> 🚧👷 We have adapted the demos in this repository to the shiny, new [cloud-native version of Materialize](https://materialize.com/blog/next-generation/). You can sign up for Early Access [here](https://materialize.com/register/), and take the self-contained demos in [the `lts` branch](https://github.com/MaterializeInc/demos/tree/lts) for a spin in the meantime!

# Materialize Demos

[![Slack Badge](https://img.shields.io/badge/Join%20us%20on%20Slack!-blueviolet?style=flat&logo=slack&link=https://materialize.com/s/chat)](https://materialize.com/s/chat)

[Materialize](https://github.com/MaterializeInc/materialize) is a streaming database for real-time applications.

This repo is a collection of runnable demos that walk you through using Materialize for different use cases, and with different stacks. All demos assume that you have [signed up for a Materialize account](https://materialize.com/register/).

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

## Getting support

If you run into a snag or need support as you explore the demos in this repo, join the Materialize [Slack community](https://materialize.com/s/chat) or [open an issue](https://github.com/MaterializeInc/demos/issues/new)!
