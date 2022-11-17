> 🚧👷 We're working on adapting the demos in this repository to the shiny, new [cloud-native version of Materialize](https://materialize.com/blog/next-generation/). In the meantime, you can take the self-contained demos in [the `lts` branch](https://github.com/MaterializeInc/demos/tree/lts) for a spin!

# Materialize Demos

[![Slack Badge](https://img.shields.io/badge/Join%20us%20on%20Slack!-blueviolet?style=flat&logo=slack&link=https://materialize.com/s/chat)](https://materialize.com/s/chat)

[Materialize](https://github.com/MaterializeInc/materialize) is a streaming database for real-time applications.

This repo is a collection of runnable demos that walk you through using Materialize for different use cases, and with different stacks. All demos are containerized and should run end-to-end with no modifications.

## Setup

To get started, make sure you have installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

We recommend running Docker with at least **2 CPUs** and **8GB** of memory, so double check your [resource preferences](https://docs.docker.com/desktop/mac/#preferences) before getting to it!

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
        <tr>
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/feature-store">feature-store</a></code></b></td>
            <td>Postgres, Redpanda</td>
            <td>Calculating and serving features in real-time for fraud detection</td>
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

## Other

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
          <td><b><code><a href="https://github.com/MaterializeInc/demos/tree/main/chbench">chbench</a></code></b></td>
            <td>MySQL, Debezium, Kafka, Metabase</td>
            <td>Benchmarking the speed of analytics queries on a streaming dataset</td>
        </tr>
    </tbody>
</table>

## Getting support

If you run into a snag or need support as you explore the demos in this repo, join the Materialize [Slack community](https://materialize.com/s/chat) or [open an issue](https://github.com/MaterializeInc/demos/issues/new)!
