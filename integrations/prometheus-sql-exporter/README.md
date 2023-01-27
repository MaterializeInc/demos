# Materialize + Prometheus SQL Exporter + Grafana

This is a demo of how to use the [Prometheus SQL Exporter](https://github.com/justwatchcom/sql_exporter/) to export data from Materialize to Prometheus, and then use Grafana to visualize the data.

![](https://imgur.com/JN2PVUz.png "Grafana dashboard")

## Overview

The demo consists of the following components:

* A Materialize instance
* A Prometheus instance
* A Prometheus SQL Exporter instance
* A Grafana instance

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Materialize instance](https://materialize.com/cloud/).

## Running the demo

- Start by cloning the repository:

    ```bash
    git clone TODO_URL
    cd TODO_DIR
    ```

- Copy the `config.yml.example` file to `config.yml`:

    ```bash
    cp config.yml.example config.yml
    ```

- Edit the `config.yml` file and set your Materialize details under the connection section:

    ```yaml
      - "postgres://YOUR_MATERIALIZE_USER:YOUR_MATERIALIZE_PASSWORD@YOUR_MATERIALIZE_HOST.materialize.cloud:6875/materialize"
    ```

- Start the demo:

    ```bash
    docker-compose up -d
    ```

- Open Grafana at http://localhost:3000 and check out the `Materialize Example` dashboard.

## Configuration overview

The `config.yml` file contains the configuration for the SQL exporter. In the `jobs` section, there are two main sections:

- The `connections` section where you can configure the SQL exporter to connect to multiple Materialize instances:

```yaml
jobs:
- name: "global"
  interval: '1m'
  connections:
  - "postgres://YOUR_MATERIALIZE_USER:YOUR_MATERIALIZE_PASSWORD@YOUR_MATERIALIZE_HOST.materialize.cloud:6875/materialize"
```

You can change the interval at which the exporter queries Materialize by changing the `interval` value. The `connections` section contains the connection string for the Materialize instance.

- The `queries` section where you can configure the SQL exporter to export metrics from Materialize:

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
            FROM mz_cluster_replicas r 
            JOIN mz_internal.mz_cluster_replica_utilization u ON r.id=u.replica_id;
```

The `queries` section contains all the queries that the SQL exporter will run to export metrics from Materialize. Each query has the following fields:
- `name`: the name of the metric that will be exported to Prometheus
- `help`: the text that will be displayed in the Grafana UI
- `labels`: the columns that will be used as labels in the exported metric
- `values`: the columns that will be used as values in the exported metric
- `query`: the SQL query that will be run to get the data for the metric

## Adding extra SQL exporter checks

To configure the SQL exporter to export additional metrics, add a new entry to the `sql_exporter` section of the `config.yml` file. For example, to export the number of rows in the `orders` table, add the following:

```yaml
sql_exporter:
- name: "total_orders"
    help: "Total Orders"
    values:
    - "count"
    query:  |
            SELECT count(*) FROM orders
```

## Helpful links

- [Materialize](https://materialize.com/)
- [Materialize internal schema](https://materialize.com/docs/sql/system-catalog/mz_internal/)
- [Prometheus SQL Exporter](https://github.com/justwatchcom/sql_exporter/)
- [Grafana](https://grafana.com/)
