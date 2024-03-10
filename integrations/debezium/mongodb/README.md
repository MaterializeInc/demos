# Debezium + MongoDB + Materialize

> {notice}: WIP: This demo is a work in progress. It is not yet ready for use.

- When trying to create a source with envelope debezium, the following error is thrown:

    ```sql
    ERROR:  'before' column must be of type record
    ```

An example of the records generated:

- Insert:
```sql
-[ RECORD 1 ]-----+------------------------------------------------------------------------------------------------------------------
id                | 102
before            | 
after             | {"_id":{"$numberLong":"102"},"description":"12V car battery","name":"car battery","quantity":8,"weight":8.1}
updateDescription | 
source            | (2.4.0.Final,mongodb,dbserver1,0,true,inventory,,rs0,products,-1,,,)
op                | r
ts_ms             | 1698676832093
transaction       |
```

- Update:
```sql
-[ RECORD 2 ]-----+------------------------------------------------------------------------------------------------------------------
id                | 101
before            | {"_id":{"$numberLong":"101"},"description":"Small 2-wheel scooter","name":"scooter","quantity":3,"weight":3.14}
after             | {"_id":{"$numberLong":"101"},"description":"Updated 2-wheel scooter","name":"scooter","quantity":3,"weight":3.14}
updateDescription | (,"{""description"":""Updated 2-wheel scooter""}",)
source            | (2.4.0.Final,mongodb,dbserver1,1698676924000,false,inventory,,rs0,products,1,,,1698676924686)
op                | u
ts_ms             | 1698676924707
transaction       |
 ```

---

Before trying this out, you will need the following:

- [Materialize account](https://materialize.com/register/).
- A publicly accessible Linux server with [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Running the demo

If you want to try it right now, follow these steps:

1. Clone the project on your Linux server and run:

    ```shell session
    git clone https://github.com/MaterializeInc/demos.git
    cd demos/integrations/debezium/mongodb
    ```

1. After cloning the project, you will need to set the `EXTERNAL_IP` environment variable to the IP address of your Linux server. For example:

    ```shell session
    export EXTERNAL_IP=$(hostname -I | awk '{print $1}')

    # Check the value of EXTERNAL_IP
    echo $EXTERNAL_IP
    ```

1. Bring up only the MongoDB container in the background.

   ```shell session
   docker compose up -d --build mongodb
   ```

1. Initialize the MongoDB replica set.

   ```shell session
   docker compose exec mongodb bash -c "/usr/local/bin/init-inventory.sh"
   ```

1. Bring up the rest of the Docker containers in the background.

   ```shell session
   docker compose up -d --build
   ```

   **This may take one or two minutes to complete the first time you run it.** If all goes well, you'll have everything running in their own containers, with Debezium configured to ship changes from Mongo into Redpanda.

1. Confirm that everything is running as expected:

   ```shell session
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

1. Now that you're in the Materialize, define the connection to the Redpanda broker and the schema registry:

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

1. Next, define all of the tables in `demo` as sources:

    ```sql
    CREATE SOURCE customers
      FROM KAFKA CONNECTION redpanda_connection (TOPIC 'dbserver1.inventory.customers')
      FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
      ENVELOPE DEBEZIUM
      WITH (SIZE = '3xsmall');

    CREATE SOURCE orders
        FROM KAFKA CONNECTION redpanda_connection (TOPIC 'dbserver1.inventory.orders')
        FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
        ENVELOPE DEBEZIUM
        WITH (SIZE = '3xsmall');

    CREATE SOURCE products
        FROM KAFKA CONNECTION redpanda_connection (TOPIC 'dbserver1.inventory.products')
        FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
        ENVELOPE DEBEZIUM
        WITH (SIZE = '3xsmall');
   ```

    Because the three sources are pulling message schema data from the registry, materialize knows the column types to use for each attribute.


1. Select from one of sources to see the data:

    ```sql
    SELECT * FROM customers LIMIT 5;
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

* [`CREATE SOURCE`](https://materialize.com/docs/sql/create-source)
* [`CREATE MATERIALIZED VIEW`](https://materialize.com/docs/sql/create-materialized-view)

## Community

If you have any questions or comments, please join the [Materialize Slack Community](https://materialize.com/s/chat)!
