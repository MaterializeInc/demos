# Materialize Rails Demo
This demo shows how to connect to `materialized` database and live stream updates using Ruby on Rails. The updates are fetched using Materialize's `TAIL` command and streamed to the frontend using ActionCable.

This demo makes use of some components of `antennas-postgres` app setup. It reuses the schema of `postgres` and `materialized` databases. It also uses the helper script which is responsible for
  - setting up the schemas for `postgres` and `materialized` databases
  - injects updates to `postgres` which is ingested by `materialized` providing a stream of changes which is used by this demo

The following is the architecture of the app:
// TODO: Insert image of architecture

This README focuses on how to consume the stream of updates and show the updates in the frontend using Ruby on Rails. For more information about the schemas and data changes, read here.

## Running the demo locally
```sh
docker-compose up
```

After successful build, wait for a minute or so for the data to be intialized. Head to:
```sh
# Check in your browser
localhost:3000
```

You should see the following page with a stream of updates from Materialized
// Insert gif

## What is happening here?
As mentioned above the data in Materialize and Postgres is being setup and updated constantly by the helper script. Showing the updates in a Rails view involves two steps:
1. Connect to Materialize database using `TAIL` command
2. Broadcast this fetched data using ActionCable.

### TAIL-ing updates
`TAIL` opens a keep-alive TCP connection to the database. Once the connection is open we use `FETCH` command to keep fetching updates at regular intervals.

`MaterializeTail` is a Ruby class which encapsulates this functionality. It accepts a valid SQL statement which is passed on to TAIL.
```rb
# file: rails/lib/materialize_tail.rb

client = MaterializeTail.new(sql: "SELECT * FROM last_half_minute_performance_per_antenna")
```

`MaterializeTail#run` starts fethcing data using the above provided SQL. It needs a block as an argument. The block is called after every fetch with the results returned by the database.
```rb
client.run do |result|
  puts result
end
```

### Broadcasting fetched updates
We use ActionCable to broadcast the results from every `TAIL` fetch. Clients (browser or any web socket consumers) can subscribe to Channels defined in the Rails app. Any updates to the channel will be pushed to the client via a web socker.

We define a channel called `TailChannel` which streams a broadcast `tail`.

```rb
# file: rails/app/channels/tail_channel.rb
class TailChannel < ApplicationCable::Channel
  def subscribed
    stream_from "tail"
  end

  ...
end
```

We then write to `tail` broadcast every time `FETCH` returns results from `materialize`.

```rb
client.run do |result|
  ActionCable.server.broadcast("tail", result)
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

As mentioned before, as `TAIL` open a keep alive TCP connection, any script running `TAIL` has to be a long running process. Hence this cannot be run as part of Rails's request-response cycle.

In this demo, we use `rails runner` to run `TAIL`. Rails's `runner` loads the Rails environment before running the script.
```sh
rails runner lib/scripts/global_tail.rb
```

The script creates a "global tail" for any consumer to consume. This is a "global" tail because only one `TAIL` connection is maintained for the whole application. All consumers recieve data from this single broadcast on connection.

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

The runner runs in a different process from the Rails server processes. In the included Docker setup, the runner runs in its own container.

**Note on ActionCable configuration**
Since the script runs in a different process than the Rails server, we need to configure ActionCable to use `redis` as the subscription adapter which defaults to `async` adapater. Checkout Action Cable config here.

On `ActionCable.server.broadcast` its the responsibility of `ActionCable` to deliver updates to the consumers. `ActionCable` usually runs as a part of the Rails server. (more details here)

## Running multiple `TAIL` commands
This demo excutes a single `TAIL` command with a pre-determined query. In some usecases we might need to execute multiple `TAIL` commands. For example, a `TAIL` call per connected ActionCable consumer.

These usecases would require you to run multiple runner scripts like the one in this demo or a script which can create a thread per `TAIL`. A script like this would also need a way to manage the open threads. It might need to connect to the DB to dynamically fetch the SQL that the  `TAIL` will run. This is out of scope of this demo.


## Wrap up
- The schema and data that this demo uses is the same as antennas-postgres demo
- The updates from materialize is read by a script running `TAIL` in a long running process. This process passes on the updates to an ActionCable broadcast called "tail"
- The ActionCable channel called `TailChannel` streams from "tail" broadcast
- A Rails view initiates a ActionCable consumer subscribes to `TailChannel` and receives the updates which are displayed as a log.






