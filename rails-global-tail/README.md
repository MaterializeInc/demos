# Materialize Rails Demo
This demo shows how to connect to `materialized` database and live stream updates using Ruby on Rails. The updates are fetched using Materialize's `TAIL` command and streamed to the frontend using Rails's ActionCable.

This demo makes use of some components of [antennas-postgres](../antennas-postgres/) app setup. If you want to understand the structure of the data that we will be using in this demo, please read the [readme](../antennas-postgres/README.md) of the project.

This demo reuses the schema of `postgres` and `materialized` databases. It also uses the [helper](./helper/src/app.ts) script which is responsible for
  - setting up the schemas for `postgres` and `materialized` databases
  - injects updates to `postgres` which is ingested by `materialized` providing a stream of changes which is used by this demo

This demo has the same architecture as the `antennas-postgres` app except the Graphql, React and Service have been replaced by Rails.

![Architecture](https://user-images.githubusercontent.com/11491779/155920578-7984244a-6382-4628-a87b-00e1f6ad1acd.png)

This README focuses on how to consume the stream of updates from `materialized` and show the updates in a view using Ruby on Rails.

## Running the demo locally
```sh
docker-compose up
```

After successful build, wait for a minute or so for the data to be intialized. Open
```sh
localhost:3000
```

You should see the following page with a stream of updates from Materialized
<img width="1792" alt="demo" src="https://user-images.githubusercontent.com/423102/181230608-2bc4f958-5fa4-4a83-b651-21ab3ec790b1.png">

## What is happening here?
As mentioned above the data in `materialized` and `postgres` is being setup and updated constantly by the [helper]()./helper/src/app.ts) script. Showing the updates in a Rails view involves two steps:
1. Connect to Materialize database using `TAIL` command
2. Broadcast the fetched data in a Rails view using ActionCable

### TAIL-ing updates
[`TAIL`](https://materialize.com/docs/sql/tail/) opens a keep-alive TCP connection to the database. Once the connection is open, we use [`FETCH`](https://materialize.com/docs/sql/fetch/) command to keep fetching updates at regular intervals. More information on how to use `TAIL` and `FETCH` in Ruby is [here](https://materialize.com/docs/integrations/ruby/).

`MaterializeTail` is a Ruby class which encapsulates this functionality. It accepts a valid SQL statement which is passed on to TAIL.
```rb
# file: rails/lib/materialize_tail.rb

client = MaterializeTail.new(sql: "SELECT * FROM last_half_minute_performance_per_antenna")
```

`MaterializeTail#run` starts fetching data using the above provided SQL. It needs a block as an argument. The block is called after every fetch with the results returned by the database.
```rb
client.run do |result|
  puts result
end
```

### Broadcasting fetched updates
We use ActionCable to broadcast the results from every `TAIL` fetch. Clients (browser or any web socket consumers) can subscribe to Channels defined in the Rails app. Any updates to the channel will be pushed to the client via a web socker. More information on how ActionCable works [here](https://guides.rubyonrails.org/action_cable_overview.html).

We define a channel called `TailChannel` which streams a broadcast named `tail`.

```rb
# file: rails/app/channels/tail_channel.rb
class TailChannel < ApplicationCable::Channel
  def subscribed
    stream_from "tail"
  end

  ...
end
```

We write to `tail` broadcast every time `FETCH` returns results from `materialize`.

```rb
# file: rails/lib/scripts/global_tail.rb
client.run do |result|
  ...

  ActionCable.server.broadcast("tail", result)

  ...
end
```

In the frontend, we create a ActionCable Consumer which listens to `TailChannel`. This receives data on broadcast of the updates. In this demo, we display the broadcasted data as a log.

```javascript
// file: rails/app/javascript/channels/tail_channel.js

import consumer from "channels/consumer"

consumer.subscriptions.create("TailChannel", {
  ...

  received(data) {
    this.appendLine(JSON.stringify(data));
  },

  appendLine(data) {
    // Update log
  },

  ...
});
```

## Deploying TAIL script and ActionCable

As mentioned before, `TAIL` opens a keep-alive TCP connection. Any script running `TAIL` has to be a long running process. Hence this cannot be run as part of Rails's request-response cycle.

In this demo, we use `rails runner` to run `TAIL`. Rails's `runner` loads the Rails environment before running the script.
```sh
rails runner lib/scripts/global_tail.rb
```

The script creates a "global tail" for any consumer to consume. This is a "global" tail because a single `TAIL` connection is maintained for the whole application. All consumers recieve data from this single broadcast when they connect.

```ruby
# file: rails/lib/scripts/global_tail.rb

...

# Initialize MaterializeTail
client = MaterializeTail.new(sql: "SELECT * FROM last_half_minute_performance_per_antenna")

# On every fetch process the results and broadcast to "tail"
client.run do |result|
  puts "New updates from tail..."

  rows = result.map do |row|
    {
      antenna_id: row["antenna_id"],
      geojson: row["geojson"].to_json,
      performance: row["performance"],
      diff: row["mz_diff"],
      timestamp: row["mz_timestamp"]
    }
  end

  ActionCable.server.broadcast("tail", { data: { antennasUpdates: rows }})
end

...
```

The runner runs in a different process from the Rails server processes. In the included [Docker](./rails/Dockerfile) setup, the runner runs in its own container.

**Note on ActionCable configuration**
Since the script runs in a different process than the Rails server, we need to configure ActionCable to use `redis` as the [subscription adapter](https://guides.rubyonrails.org/action_cable_overview.html#subscription-adapter) which defaults to `async` adapater. Checkout Action Cable config here: [cable.yml](./rails/config/cable.yml).

On `ActionCable.server.broadcast` its the responsibility of ActionCable to deliver updates to the consumers. ActionCable usually runs as a part of the Rails server. ([More details on ActionCable deployment](https://guides.rubyonrails.org/action_cable_overview.html#deployment))

## Running multiple `TAIL` commands
This demo excutes a single `TAIL` command with a pre-determined query. In some usecases we might need to execute multiple `TAIL` commands. For example, a `TAIL` call per connected ActionCable consumer.

These usecases would require us to run multiple runner scripts like the one in this demo or a script which can create a thread per `TAIL`. A script like this would also need a way to manage the open threads. It might need to connect to the DB to dynamically fetch the SQL that the  `TAIL` will run. This is out of scope of this demo.


## Conclusion
To sum up
- The schema and data that this demo uses is the same as [antennas-postgres](../antennas-postgres/)
- The updates from `materialized` is read by a script running `TAIL` in a long running process. This process passes on the updates to an ActionCable broadcast called "tail"
- The ActionCable channel called `TailChannel` streams from "tail" broadcast
- A Rails view initiates a ActionCable consumer subscribes to `TailChannel` and receives the updates which are displayed as a log.
