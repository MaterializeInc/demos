# Materialize + Grafana

Materialize exposes a [system catalog](https://materialize.com/docs/sql/system-catalog/) that contains valuable metadata about its internal objects and activity. You can use this metadata to monitor the performance and overall health of your Materialize region.

This demo shows how to make Materialize metadata available as key metrics for monitoring and alerting in Grafana using a [Prometheus SQL Exporter](https://github.com/justwatchcom/sql_exporter/).

![](https://imgur.com/JN2PVUz.png "Grafana dashboard")

## Overview

The demo consists of the following components:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/joacoc/demos/assets/11491779/8dd0df96-58e0-4af7-8918-8ce848fc4a79">
  <img alt="Shows an illustration of the components." src="https://github.com/joacoc/demos/assets/11491779/c3f30984-9ee1-4b96-ba58-2d5c000ae379">
</picture>

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Materialize instance](https://materialize.com/cloud/).
- [Grafana instance](https://grafana.com/products/cloud/).

## Running the demo

- Start by cloning the repository:

    ```bash
    git clone https://github.com/MaterializeInc/demos.git
    cd demos/integrations/grafana/cloud
    ```

- Edit the `agent.yaml` file and set your Grafana Agent:

    ```yaml
      remote_write:
        - url: <REMOTE_WRITE_URL>
          basic_auth:
            username: <USERNAME>
            password: <PASSWORD>
    ```

    <details><summary>Video to generate the fields for the first time.</summary>

    ![Gif](https://github.com/MaterializeInc/demos/assets/11491779/e512a95f-e3c6-433d-bc8f-6f5138b08115)

    <details>

- Copy the `config.yml.example` file to `config.yml`:

    ```bash
    cp config.yml.example config.yml
    ```

- Edit the `config.yml` file and set your Materialize details under the two connection sections:

  ```yaml
    - "postgres://YOUR_MATERIALIZE_USER:YOUR_MATERIALIZE_PASSWORD@YOUR_MATERIALIZE_HOST.materialize.cloud:6875/materialize"
  ```

- Start the demo:

    ```bash
    docker compose up -d
    ```

- Open your Grafana account and import [the Materialize dashboard template](https://github.com/MaterializeInc/demos/blob/main/integrations/grafana/local/misc/dashboards/dashboard.json).

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
  - name: "source_messages_received"
    help: "Count of messages for each source"
    labels:
      - "source_name"
      - "source_type"
      - "cluster_id"
      - "cluster_name"
    values:
      - "messages_received"
    query:  |
            SELECT
              SUM(messages_received) as messages_received,
              S.name as source_name,
              S.type as source_type,
              S.cluster_id,
              S.name as cluster_name
            FROM mz_internal.mz_source_statistics SS
            JOIN mz_catalog.mz_sources S ON (SS.id = S.id)
            JOIN mz_catalog.mz_clusters C ON (S.cluster_id = C.id)
            GROUP BY S.name, S.type, S.cluster_id, cluster_name;
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
## Dashboard Template

Use our dashboard template available for Grafana by importing the `dashboard.json` file into your dashboards. By importing the dashboard template, you can quickly set up a customized dashboard that displays the specific metrics and data available in the `config.yaml`. This can save you time and effort in building a dashboard from scratch.

## Helpful links

- [Materialize](https://materialize.com/)
- [Materialize internal schema](https://materialize.com/docs/sql/system-catalog/mz_internal/)
- [Prometheus SQL Exporter](https://github.com/justwatchcom/sql_exporter/)
- [Grafana](https://grafana.com/)
