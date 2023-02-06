# Materialize + Datadog

<img width="1728" alt="Screenshot 2023-02-01 at 12 53 41" src="https://user-images.githubusercontent.com/11491779/216036715-9a4b4db7-8f93-4b6a-ac21-f7eb5a01d151.png">

## Overview

This is a demo of how to use Datadog to monitor Materialize using the OpenMetrics standard.

Materialize collects information about its internal components in a [public catalog](https://materialize.com/docs/sql/system-catalog/mz_internal/), consumable by tools like [Prometheus SQL Exporter](https://github.com/justwatchcom/sql_exporter/), _"a service that runs user-defined SQL queries at flexible intervals and exports the resulting metrics via HTTP for Prometheus consumption"_.

Datadog's OpenMetrics integration can consume from the Prometheus SQL Exporter endpoint and allows a way to monitor Materialize.

<img width="1499" alt="Datadog" src="https://user-images.githubusercontent.com/11491779/216926716-cc0cdd46-7ea7-496f-8fa3-a4863fc1ce00.png">

## Prerequisites

- [Docker Compose](https://docs.docker.com/compose/install/)
- [Materialize instance](https://materialize.com/cloud/)
- [Datadog API Key](https://docs.datadoghq.com/account_management/api-app-keys/)

## Running the demo

1. Start by cloning the repository:

    ```bash
    git clone https://github.com/joacoc/DatadogOpenMetricsMaterialize.git
    cd DatadogOpenMetricsMaterialize
    ```

2. Edit the `config.yaml` file and set your Materialize details under the connections:

    ```yaml
    connections:
    - "postgres://<USER>:<PASSWORD>@<HOST>:<PORT>/materialize"
    ```


3. Edit the `docker-compose.yaml` file and set your Datadog API key:

    ```yaml
    environment:
    - DD_API_KEY=${DD_API_KEY}
    ```

4. Start the demo:

    ```bash
    docker-compose up -d
    ```

5. Open your Datadog account and explore the `materialize.*` metrics.

## Configuration overview

The `config.yaml` file contains the configuration for the Prometheus SQL exporter. The `jobs` section divides into two:

1. The `connections` section where you can configure the Prometheus SQL exporter to connect to multiple Materialize instances:

```yaml
connections:
- "postgres://<USER>:<PASSWORD>@<HOST>:<PORT>/materialize"
```

You can change the interval at which the exporter queries Materialize by changing the `interval` value. The `connections` section contains the connection string for the Materialize instance.

2. The `queries` section where you can configure the Prometheus SQL exporter to export metrics from Materialize:

```yaml
queries:
- name: "replica_memory_usage"
    help: "Replica memory usage"
    labels:
    - "replica_name"
    - "cluster_id"
    values:
    - "memory_percent"
    query:  |
            SELECT
            name::text as replica_name,
            cluster_id::text as cluster_id,
            memory_percent::float as memory_percent
            FROM mz_cluster_replicas r join mz_internal.mz_cluster_replica_utilization u on r.id=u.replica_id;
```

The `queries` section contains all the queries that the Prometheus SQL exporter will run to export metrics from Materialize. Each query has the following fields:
- **Name**: This is the name of the metric that will be exported to Prometheus
- **Labels**: These are the columns that will be used as labels in the exported metric
- **Values**: These are the columns that will be used as values in the exported metric
- **Query**: This is the SQL query that will be run to get the data for the metric

## Adding extra Prometheus SQL exporter checks

To configure the Prometheus SQL exporter to export additional metrics, add a new entry to the `sql_exporter` section of the `config.yaml` file. For example, to export the number of rows in the `orders` table, add the following:

```yaml
sql_exporter:
- name: "total_orders"
    help: "Total Orders"
    values:
    - "count"
    query:  |
            select count(*) from orders
```

## Datadog's OpenMetrics integration

Datadog's agent will run and use the configuration file available in `datadog/conf.d/openmetrics.yaml`. The available configuration file describes consuming and sending all the metrics available from the Prometheus SQL Exporter endpoint.

## Helpful links

- [Materialize](https://materialize.com/)
- [Materialize internal schema](https://materialize.com/docs/sql/system-catalog/mz_internal/)
- [Prometheus SQL Exporter](https://github.com/justwatchcom/sql_exporter/)
- [Datadog](https://www.datadoghq.com/)
