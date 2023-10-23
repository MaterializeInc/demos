# Debezium + SQL Server + Materialize

Before trying this out, you will need the following:

- [Materialize account](https://materialize.com/register/).
- A publicly accessible Linux server with [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Running the demo

If you want to try it right now, follow these steps:

1. Clone the project on your Linux server and run:

    ```shell session
    git clone https://github.com/MaterializeInc/demos.git
    cd demos/integrations/debezium/sqlserver
    ```

1. Start all containers:

    ```shell
    export EXTERNAL_IP=$(hostname -I | awk '{print $1}')
    docker compose up -d --build
    ```

1. Check the status of the containers:

    ```shell
    docker compose ps
    ```


1. Exec in to the redpanda container to look around using redpanda's amazing [rpk](https://docs.redpanda.com/docs/reference/rpk/) CLI.

   ```shell session
   docker compose exec redpanda /bin/bash

   rpk debug info

   rpk topic list
   ```

1. Connect to Materialize

    If you already have `psql` installed on your machine, use the provided connection string to connect:

    Example:

    ```shell session
    psql "postgres://user%40domain.com@materialize_host:6875/materialize"
    ```

    Otherwise, you can find the steps to install and use your CLI of choice under [Supported tools](https://materialize.com/docs/integrations/sql-clients/#supported-tools).

1. Now that you're in the Materialize CLI, define the connection to the Redpanda broker and the schema registry:

    ```sql
    -- Create Redpanda connection
    CREATE CONNECTION redpanda_connection
      TO KAFKA (
      BROKER '<your_server_ip:9092>');

    -- Create Registry connection
    CREATE CONNECTION schema_registry
      TO CONFLUENT SCHEMA REGISTRY (
      URL 'http://<your_server_ip:8081>');
    ```

1. Next, define all of the topics as sources:

    ```sql
    CREATE SOURCE customers
      FROM KAFKA CONNECTION redpanda_connection (TOPIC 'server1.testDB.dbo.customers')
      FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
      ENVELOPE DEBEZIUM
      WITH (SIZE = '3xsmall');

    CREATE SOURCE orders
      FROM KAFKA CONNECTION redpanda_connection (TOPIC 'server1.testDB.dbo.orders')
      FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
      ENVELOPE DEBEZIUM
      WITH (SIZE = '3xsmall');

    CREATE SOURCE products
      FROM KAFKA CONNECTION redpanda_connection (TOPIC 'server1.testDB.dbo.products')
      FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
      ENVELOPE DEBEZIUM
      WITH (SIZE = '3xsmall');
    
    CREATE SOURCE products_on_hand
      FROM KAFKA CONNECTION redpanda_connection (TOPIC 'server1.testDB.dbo.products_on_hand')
      FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
      ENVELOPE DEBEZIUM
      WITH (SIZE = '3xsmall');
    ```

1. Subscribe to the `orders` topic:

    ```sql
    COPY ( SUBSCRIBE TO orders ) TO STDOUT;
    ```

1. Next generate some orders:

    ```sh
    cat sqlserver/orders.sql | docker compose -f docker compose.yaml exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
    ```

1. Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)

    ```sh
    docker compose -f docker compose.yaml exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'
    ```


## Cleanup

To stop the services and remove the containers, run:

```shell session
docker compose down
```

In Materialize, run:

```sql
DROP CONNECTION redpanda_connection CASCADE;
DROP CONNECTION schema_registry CASCADE;
```

## Helpful resources:

* [`CREATE CONNECTION`](https://materialize.com/docs/sql/create-connection/)
* [`CREATE SOURCE`](https://materialize.com/docs/sql/create-source)
* [`CREATE MATERIALIZED VIEW`](https://materialize.com/docs/sql/create-materialized-view)

## Community

If you have any questions or comments, please join the [Materialize Slack Community](https://materialize.com/s/chat)!
