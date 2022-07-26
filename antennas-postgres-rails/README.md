# Materialize Rails Demo
This demo shows how to connect to `materialized` database and live stream updates using Ruby on Rails. The updates are fetched using Materialize's `TAIL` command and streamed to the frontend using ActionCable.

This demo makes use of some components of `antennas-postgres` app setup. It reuses the schema of `postgres` and `materialized` databases. It also uses the helper script which is responsible for
  - setting up the schemas for `postgres` and `materialized` databases
  - injects updates to `postgres` which is ingested by `materialized` providing a stream of changes which is used by this demo

The following is the architecture of the app:
// TODO: Insert image of architecture

This README focuses on how to consume the stream of updates and show the updates in the frontend using Ruby on Rails. For more information about the schemas and data changes, read here.

# Running the demo locally
```
docker-compose up
```

After successful build, wait for a minute or so for the data to be intialized. Head to:
```
# Check in your browser
localhost:3000
```

You should see the following page with a stream of updates from Materialized
// Insert gif

# What is happening here?
As mentioned above the data in Materialize and Postgres is being setup and updated constantly by the helper script. To show these updates in a Rails View we using ActionCable which is a wrapper around web sockets.

