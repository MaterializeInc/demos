# Materialize + Debezium Examples

## Overview

This is a collection of demos that show how to use the [Debezium](https://materialize.com/docs/ingest-data/debezium/) connector with Materialize.

## Demos

| Demo                               | Description                                                                 | Materialize Docs                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Postgres](postgres)               | Connect to a Postgres database and stream changes to Kafka/Redpanda         | [Postgres](https://materialize.com/docs/ingest-data/cdc-postgres-kafka-debezium/)    |
| TODO: [MySQL](mysql)               | Connect to a MySQL database and stream changes to Kafka/Redpanda            | [MySQL](https://materialize.com/docs/ingest-data/cdc-mysql/)                         |
| TODO: [SQL server](sqlserver)      | Connect to a SQL server database and stream changes to Kafka/Redpanda       | TODO                                                                                 |
<!-- | TODO: [MongoDB](mongodb)           | Connect to a MongoDB database and stream changes to Kafka/Redpanda     | TODO                                                                                 | -->

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Materialize](https://console.materialize.com/) account

## Running the demos

For each demo, follow the instructions in the demo's README. All demos assume that you have `psql`, `docker` and a publicly accessible Linux environment.
