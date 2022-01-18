# Real-time view of top 10 Wikipedia editors using Python and JavaScript

This directory contains a demo application showing how to build an event-driven
data pipeline, using [Wikimedia's recent change stream]. In the example
application, Materialize is configured with three materialized views that
reflect new edits appended to the `wikirecent` source:

- `counter`: The count all edits that have ever been observed.
- `useredits`: The count of all edits observed, grouped by user.
- `top10`: The top 10 users, where top means most edits by count. This view is a materialized view on top of `useredits`.

A Python web application then serves a basic page that renders both the current
value for `counter` and a visualization of the `top10` view. To get the updated
results as the underlying data changes, we're making use of Materialize's
[`TAIL`] command.

## Running the demo

To spin up this demo locally, run:

```
docker-compose up -d
```

To check if the demo is running, run:

```
docker-compose ps
```

To view the web app in your local browser, visit <http://localhost:8875>.

![wikirecent-demo](https://user-images.githubusercontent.com/21223421/149947818-01a89070-a6f6-42ee-a199-c31af09f8791.gif)

### Connect to `materialized`

To open a Postgres shell connected to the `materialized` instance running as
part of this demo, run:

```
docker-compose run cli
```

- Show the created views:

To view the `recentchanges` file, run:

```sql
SHOW VIEWS;

-- Output
     name
---------------
 counter
 recentchanges
 top10
 user_edits
```

- Query the `counter` view:

```sql
SELECT * FROM counter;

-- Output
 count
-------
  1893
(1 row)

```

### Use `TAIL` to watch for changes

Rather than running `SELECT * FROM top10;` to get the latest results, we can stream the `top10` updates to your console you can use `TAIL`:

```sql
COPY (TAIL top10) TO STDOUT;
```

This will output the current value of the `top10` materialized view as the data changes:

![Use TAIL to watch for changes](https://user-images.githubusercontent.com/21223421/149956101-aef8ad16-f563-4201-a10d-68c8c7c23e5d.gif)

### Streaming a view from the Python web server to your console

You can use `curl` to stream the contents of the `top10` view via the Python web server,
rather than from Materialize directly:

```
curl --no-buffer --output - \
  -H "Sec-WebSocket-Key: +" -H "Sec-WebSocket-Version: 13" -H "Connection: Upgrade" -H "Upgrade: websocket" \
  "http://localhost:8875/api/stream/top10"
```

The output corresponds to the JSON results returned by the web server to the
JavaScript client.

## How it works

This application is written as an event-driven application, which means that no components are configured to repeatedly query or poll other applications.
Instead, each application is subscribing to updates from their dependencies.
Updates are minimal in size and are expressed solely as transformations from
previous state. This has two major benefits:

- **Real-time push notifications.** Applications are notified as soon as data
  changes and are not required to repeatedly poll for the same information over
  and over again.

- **Resource efficiency.** Each result set only contains information about
  rows that have changed. Fewer bytes are sent over the network and processing
  updates is more efficient.

### Services and service dependencies

There are 4 major components that comprise this stack:

- `stream`: A service to curl [Wikimedia's recent change stream] and append the results to a file called `recentchanges`.
- `materialized`: An instance of `materialized` configured to `TAIL` the
  `recentchanges` file and maintain the `counter`, `useredits` and `top10`
  materialized views.
- `app`: A Python web server, written as an asynchronous application using
  [tornado-web] and [psycopg3], to tail the `counter` and `top10` views and
  present updates to these views over websockets.
- Your web browser. The webpage rendered by `app` includes JavaScript code
  that opens two websockets to `app`. Each message, pushed by `app`, contains an
  update that is then rendered in the browser.

Thus, the flow of data looks like this:

    Wikimedia --> stream --> recentchanges --> materialized --> app --> browser

Contrast this with a "typical web app" backed by a SQL database, where each application is making
repeated requests to upstream systems:

    Wikimedia <-- stream --> database <-- app <-- browser

## Stopping the demo

Once you're done, stop all the running services and delete the
associated volumes:

```
docker-compose down -v
```

## Usefull Resources

- [`TAIL`](https://materialize.com/docs/sql/tail/)
- [wikimedia's recent change stream](https://stream.wikimedia.org/v2/stream/recentchange)
- [tornado-web](https://www.tornadoweb.org/en/stable/)
- [psycopg3](https://www.psycopg.org/psycopg3/)
- [asyncpg](https://github.com/MagicStack/asyncpg)
