# Getting started with dbt and Materialize

[dbt](https://docs.getdbt.com/docs/introduction) has become the standard for data transformation (“the T in ELT”). It combines the accessibility of SQL with software engineering best practices, allowing you to not only build reliable data pipelines, but also document, test and version-control them.

This demo recreates the Materialize [getting started guide](https://materialize.com/docs/get-started/) using dbt as the transformation layer.

## Setup

Setting up a dbt project with Materialize is similar to setting it up with any other database that requires a non-native adapter. To get up and running, fire up a terminal window and run through the following steps:

1. Install the [dbt-materialize plugin](https://pypi.org/project/dbt-materialize/) (optionally using a virtual environment):

```bash
python3 -m venv dbt-venv         # create the virtual environment
source dbt-venv/bin/activate     # activate the virtual environment
pip install dbt-materialize      # install the adapter
```

  The installation will include `dbt-core` and the `dbt-postgres` dependency.

2. To check that the plugin was successfully installed, run:

```bash
dbt --version
```

  `materialize` should be listed under “Plugins”. If this is not the case, double-check that the virtual environment is activated!

3. Export your Materialize credentials as environment variables:

```bash
export MZ_HOST=<host> MZ_USER=<user> MZ_PASSWORD=<app_password>
```

These will be picked up in the `profiles.yml` file, where the connection configuration is defined:

```nofmt
mz_get_started:
  outputs:
    dev:
      type: materialize
      threads: 1
      host: "{{ env_var('MZ_HOST') }}"
      port: 6875
      user: "{{ env_var('MZ_USER') }}"
      pass: "{{ env_var('MZ_PASSWORD') }}"
      database: materialize
      schema: qck
      cluster: quickstart
  target: dev
```

4. To test the connection to Materialize, run:

```bash
dbt debug
```

  If the output reads `All checks passed!`, you’re good to go! The [dbt documentation](https://docs.getdbt.com/docs/guides/debugging-errors#types-of-errors) has some helpful pointers in case you run into errors.

## Materialize

### Connect

In a new terminal session, connect to Materialize using a PostgreSQL-compatible [client](https://materialize.com/docs/integrations/sql-clients/) (like `psql`), and the credentials for your region:

```bash
psql "postgres://<user>:<password>@<host>:6875/materialize"
```

### Create a cluster

[//]: # "TODO(morsapaes) Look into a way to hack the cluster and connection creation steps into some dbt operation, or dbt init."

Prepare an isolated environment for experimenting by creating a new [cluster](https://materialize.com/docs/sql/create-cluster) with dedicated physical resources:

```sql
CREATE CLUSTER quickstart REPLICAS (small_replica (SIZE = '2xsmall'));

SET cluster = quickstart;
```

And a custom schema:

```sql
CREATE SCHEMA qck;
```

Notice that the `quickstart` cluster and the `qck` schema you just created are configured as defaults in the connection configuration (`profiles.yml`). This means that dbt will run all models using this cluster and schema (though you can override the default in the model configuration using the [`cluster`](https://materialize.com/docs/integrations/dbt/#clusters) and [`schema`](https://docs.getdbt.com/docs/build/custom-schemas) options).

### Create connections

We provide a Kafka cluster with sample data that you can use to explore and learn the basics! Before running dbt, the details on how to connect to the sample Kafka cluster should already exist in Materialize as connections. Navigate to the [Materialize UI](https://cloud.materialize.com/showSourceCredentials) and replace the placeholders below with the provided credentials.

```sql
CREATE SECRET kafka_user AS '<KAFKA-USER>';
CREATE SECRET kafka_password AS '<KAFKA-PASSWORD>';
CREATE SECRET csr_user AS '<CSR-USER>';
CREATE SECRET csr_password AS '<CSR-PASSWORD>';
```

Then create the required connections:

```sql
-- Kafka broker
-- Where our sample streaming data lives
CREATE CONNECTION kafka_connection TO KAFKA (
  BROKER 'pkc-n00kk.us-east-1.aws.confluent.cloud:9092',
  SASL MECHANISMS = 'PLAIN',
  SASL USERNAME = SECRET kafka_user,
  SASL PASSWORD = SECRET kafka_password
);
```

```sql
-- Confluent Schema Registry
-- Used to fetch the schema of our sample streaming data
CREATE CONNECTION qck.csr_connection TO CONFLUENT SCHEMA REGISTRY (
  URL 'https://psrc-ko92v.us-east-2.aws.confluent.cloud:443',
  USERNAME = SECRET csr_user,
  PASSWORD = SECRET csr_password
);
```

## dbt

### Define the models

This demo includes all the models needed to recreate the get started demo, including:

#### Sources

- [`sources/items.sql`](models/sources/items.sql)
- [`sources/purchases.sql`](models/sources/purchases.sql)

#### Views

- [`staging/item_purchases.sql`](models/staging/item_purchases.sql)
- [`staging/item_summary_5min.sql`](models/staging/item_summary_5min.sql)

#### Materialized views

- [`marts/item_summary.sql`](models/marts/item_summary.sql)

### Run the models!

1. From the terminal, run:

```bash
dbt run
```

This command generates executable SQL code from any model files under `/models` and runs it against your target Materialize region. You can find the compiled statements under `/target/run` and `target/compiled` in the dbt project folder.

2. From the terminal session where you connected to Materialize, double-check that all objects have been created:

**Sources**

```sql
SHOW SOURCES;

     name   |   type   |  size
------------+----------+---------
 items      | kafka    | 3xsmall
 purchases  | kafka    | 3xsmall
```

**Views**

```sql
SHOW VIEWS;

          name
-------------------------
 item_purchases
 item_summary_5min
```

**Materialized views**

```sql
SHOW MATERIALIZED VIEWS;

     name     |    cluster
--------------+---------------
 item_summary | quickstart
```

That’s it! From here on, Materialize makes sure that your models are **incrementally updated** as new data streams in, and that you get **fresh and correct** results with millisecond latency whenever you query your views.

> :crab: As an exercise, [SUBSCRIBE](https://materialize.com/docs/sql/subscribe/) to the `item_summary_5min` view to keep track of any items that had orders in the past 5 minutes (a moving target that changes as time ticks along)!

### Test the project

To help demonstrate how `dbt test` works with Materialize for [**continuous testing**](https://materialize.com/docs/integrations/dbt/#configure-continuous-testing), you'll notice that testing is configured in the dbt project configuration (`dbt-project.yml`):

```yaml
tests:
  mz_get_started:
    +store_failures: true
    +schema: 'etl_failure'
```

, and that we added some [generic tests](https://docs.getdbt.com/docs/building-a-dbt-project/tests#generic-tests) to the `item_summary` model in `ecommerce.yml`:

```yaml
models:
  - name: item_summary
    description: ''
    columns:
      - name: item_name
        description: ''
        tests:
          - not_null
```

Tests are configured to `store_failures`, which instructs dbt to create a materialized view for each test using the respective `SELECT` statements.

1. To run the tests:

```bash
dbt test
```

  This creates a materialized view in a dedicated schema (`qck_etl_failure`): `not_null_item_summary_item_name`. dbt takes care of naming the view based on the type of test (`not_null`) and the columns being tested (`item_name`).

  These views are continuously updated as new data streams in, and allow you to monitor failing rows **as soon as** an assertion fails. You can use this feature for unit testing during the development of your dbt models, and later in production to trigger real-time alerts downstream.

2. From the terminal session where you connected to Materialize, double-check that the schema storing the tests was created:

#### Schemas

```sql
SHOW SCHEMAS;

        name
--------------------
 qck
 qck_etl_failure
```

#### (Testing) Materialized views

```sql
SHOW MATERIALIZED VIEWS FROM qck_etl_failure;

             name             |    cluster
------------------------------+---------------
 not_null_item_summary_item_name | quickstart
```

<hr>

If you run into issues with the `dbt-materialize` adapter, please [open a GitHub issue](https://github.com/MaterializeInc/materialize/issues/new/choose) so we can look into it!

### SQLFluff

[SQLFluff](https://github.com/sqlfluff/sqlfluff/) is a linter for SQL. It can be used to enforce a consistent style and syntax across your SQL codebase. It can also be used to enforce best practices and prevent common mistakes.

SQLFluff has a Materialize dialect, which can be used to lint SQL code that uses Materialize-specific syntax.

To install SQLFluff, run:

```bash
# Pin to 2.0.0a4 due to sqlfluff #4317
pip install sqlfluff-templater-dbt==2.0.0a4
```

To fix any linting errors, run:

```bash
sqlfluff fix --dialect  materialize
```
