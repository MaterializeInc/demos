# Materialize Demos

[![Slack Badge](https://img.shields.io/badge/Join%20us%20on%20Slack!-blueviolet?style=flat&logo=slack&link=https://materialize.com/s/chat)](https://materialize.com/s/chat)

Materialize is a **data warehouse** purpose-built for **operational workloads**. It allows you build real-time automation, engaging customer experiences, and interactive
data products using SQL and other common tools in the ecosystem.

This repo is a collection of sample code that walks you through using Materialize for different use cases, and with different stacks. All demos assume that you have [signed up for a Materialize account](https://materialize.com/register/).

## Use Cases

<table>
    <thead>
        <tr>
            <th>Demo</th>
            <th>Stack</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/antennas-kafka">antennas-kafka</a></code></b></td>
            <td>Node.js, GraphQL, Kafka</td>
            <td rowspan=2>Tracking key performance indicators for infrastructure monitoring</td>
        </tr>
        <tr>
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/antennas-postgres">antennas-postgres</a></code></b></td>
            <td>Node.js, GraphQL, Postgres</td>
        </tr>
        <tr>
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/ecommerce">ecommerce</a></code></b></td>
            <td>MySQL, Debezium, Kafka, Metabase</td>
            <td rowspan=2>Building a streaming ETL pipeline for e-commerce analytics</td>
        </tr>
        <tr>
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/ecommerce-redpanda">ecommerce-redpanda</a></code></b></td>
            <td>MySQL, Debezium, Redpanda, Metabase</td>
        </tr>
    </tbody>
</table>

## Ecosystem

### dbt

<table>
    <thead>
        <tr>
            <th>Demo</th>
            <th>Stack</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/dbt-get-started">dbt-get-started</a></code></b></td>
            <td>dbt</td>
            <td>The dbt version of the Materialize <a href="https://materialize.com/docs/get-started/">get started guide</a></td>
        </tr>
        <tr>
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/dbt-jaffle-shop">dbt-jaffle-shop</a></code></b></td>
            <td>dbt</td>
            <td>An adapted version of the dbt Jaffle Shop using <a href="https://docs.getdbt.com/reference/warehouse-profiles/materialize-profile"</a><code>dbt-materialize</code></a></td>
        </tr>
    </tbody>
</table>

## [Connection examples](./connection-examples)

This is a collection of reference examples for common language-specific PostgreSQL drivers and PostgreSQL-compatible ORMs that have been tested with Materialize.

- [PHP](./connection-examples/php)
- [NodeJS](./connection-examples/nodejs)
- [TypeScript](./connection-examples/typescript)
- [Deno](./connection-examples/deno)
- [Java](./connection-examples/java)
- [Python](./connection-examples/python)
  - [FastAPI](./connection-examples/fastapi)
- [Ruby](./connection-examples/ruby)
- [Go](./connection-examples/go)
- [Lua](./connection-examples/lua)
- [Rust](./connection-examples/rust)

## Getting support

If you run into a snag or need support as you explore the demos in this repo, join the Materialize [Slack community](https://materialize.com/s/chat) or [open an issue](https://github.com/MaterializeInc/demos/issues/new)!
