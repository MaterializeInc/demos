# Debezium + PostgreSQL + Materialize

Before trying this out, you will need the following:

- [Materialize account](https://materialize.com/register/).
- A publicly accessible Linux server with [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Running the demo

If you want to try it right now, follow these steps:

1. Clone the project on your Linux server and run:

    ```shell session
    git clone https://github.com/MaterializeInc/demos.git
    cd demos/integrations/debezium/postgres
    ```

1. After cloning the project, you will need to set the `EXTERNAL_IP` environment variable to the IP address of your Linux server. For example:

    ```shell session
    export EXTERNAL_IP=$(hostname -I | awk '{print $1}')

    # Check the value of EXTERNAL_IP
    echo $EXTERNAL_IP
    ```

1. Bring up the Docker Compose containers in the background.

   ```shell session
   docker compose up -d --build
   ```

   **This may take one or two minutes to complete the first time you run it.** If all goes well, you'll have everything running in their own containers, with Debezium configured to ship changes from Postgres into Redpanda.

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

1. Now that you're in Materialize, define the connection to the Redpanda broker and the schema registry:

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
    CREATE SOURCE users
      FROM KAFKA CONNECTION redpanda_connection (TOPIC 'pg_repl.demo.users')
      FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
      ENVELOPE DEBEZIUM
      WITH (SIZE = '3xsmall');

    CREATE SOURCE roles
        FROM KAFKA CONNECTION redpanda_connection (TOPIC 'pg_repl.demo.roles')
        FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
        ENVELOPE DEBEZIUM
        WITH (SIZE = '3xsmall');

    CREATE SOURCE reviews
        FROM KAFKA CONNECTION redpanda_connection (TOPIC 'pg_repl.demo.reviews')
        FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY CONNECTION schema_registry
        ENVELOPE DEBEZIUM
        WITH (SIZE = '3xsmall');
   ```

    Because the three sources are pulling message schema data from the registry, materialize knows the column types to use for each attribute.

1. Create a materialized view that has only the VIP users:

    ```sql
    CREATE MATERIALIZED VIEW vip_users AS
        SELECT
            users.id,
            users.first_name,
            users.last_name,
            users.email,
            users.role_id,
            roles.name AS role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.role_id = 4;
    ```

1. Create a materialized view that has only the bad reviews:

    ```sql
    CREATE MATERIALIZED VIEW bad_reviews AS
        SELECT
            reviews.user_id,
            reviews.comment,
            reviews.rating,
            reviews.created_at,
            reviews.updated_at
        FROM reviews
        WHERE reviews.rating < 4;
    ```

1. Create a materialized view that filters all VIP users with bad reviews:

    ```sql
    CREATE MATERIALIZED VIEW vip_users_with_bad_reviews AS
        SELECT
            vip_users.first_name,
            vip_users.last_name,
            vip_users.email,
            vip_users.role_name,
            bad_reviews.rating,
            bad_reviews.comment
        FROM vip_users
        JOIN bad_reviews ON vip_users.id = bad_reviews.user_id;
    ```

1. Query the materialized view:

    ```sql
    SELECT * FROM vip_users_with_bad_reviews;
    ```

    Or use the `SUBSCRIBE` command to stream the results:

    ```sql
    COPY (SUBSCRIBE vip_users_with_bad_reviews) TO STDOUT;
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

* [`CREATE SOURCE: PostgreSQL`](https://materialize.com/docs/sql/create-source/postgres)
* [`Postgres + Kafka + Debezium`](https://materialize.com/docs/integrations/cdc-postgres/#kafka--debezium)
* [`CREATE SOURCE`](https://materialize.com/docs/sql/create-source)
* [`CREATE MATERIALIZED VIEW`](https://materialize.com/docs/sql/create-materialized-view)

## Community

If you have any questions or comments, please join the [Materialize Slack Community](https://materialize.com/s/chat)!
