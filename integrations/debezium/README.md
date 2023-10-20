# Materialize + Debezium Examples

## Overview

This is a collection of demos that show how to use the [Debezium](https://materialize.com/docs/ingest-data/debezium/) connector with Materialize.

## Demos

| Demo                               | Description                                                                 | Materialize Docs                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Postgres](postgres)               | Connect to a Postgres database and stream changes to Kafka/Redpanda         | [Postgres](https://materialize.com/docs/ingest-data/cdc-postgres-kafka-debezium/)    |
| TODO: [MySQL](mysql)               | Connect to a MySQL database and stream changes to Kafka/Redpanda            | [MySQL](https://materialize.com/docs/ingest-data/cdc-mysql/)                         |
| [SQL server](sqlserver)            | Connect to a SQL server database and stream changes to Kafka/Redpanda       | TODO                                                                                 |
<!-- | TODO: [MongoDB](mongodb)           | Connect to a MongoDB database and stream changes to Kafka/Redpanda     | TODO                                                                                 | -->

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Materialize](https://console.materialize.com/) account

## Running the demos

For each demo, follow the instructions in the demo's README. All demos assume that you have `psql`, `docker` and a publicly accessible Linux environment.

## Notes

Beginning with Debezium 2.0.0, Confluent Schema Registry support is not included in the Debezium containers. To enable the Confluent Schema Registry for a Debezium container, install the following Confluent Avro converter JAR files into the Connect plugin directory:

-   `kafka-connect-avro-converter`

-   `kafka-connect-avro-data`

-   `kafka-avro-serializer`

-   `kafka-schema-serializer`

-   `kafka-schema-registry-client`

-   `common-config`

-   `common-utils`
