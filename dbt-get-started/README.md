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

3. Locate the `profiles.yml` file in your machine:

```bash
dbt debug --config-dir
```

4. Open `profiles.yml` and adapt it to connect to your Materialize region using the following configuration as reference:

```nofmt
mz_get_started:
  outputs:
    dev:
      type: materialize
      threads: 1
      host: <host>
      port: 6875
      user: <user@domain.com>
      pass: <password>
      database: materialize
      schema: public
      cluster: auction_house
      sslmode: require
  target: dev
```

5. To test the connection to Materialize, run:

```bash
dbt debug
```

  If the output reads `All checks passed!`, you’re good to go! The [dbt documentation](https://docs.getdbt.com/docs/guides/debugging-errors#types-of-errors) has some helpful pointers in case you run into errors.

## Materialize

### Connect

Connect to Materialize using a PostgreSQL-compatible [client](https://materialize.com/docs/integrations/sql-clients/), like `psql`, and the credentials for your region:

```bash
psql "postgres://<user>:<password>@<host>:6875/materialize"
```

### Create a cluster

Set up a [cluster](https://materialize.com/docs/sql/create-cluster) (logical compute) with one `xsmall` [replica](https://materialize.com/docs/sql/create-cluster-replica) (physical compute) so you can start running some queries:

```sql
CREATE CLUSTER auction_house REPLICAS (xsmall_replica (SIZE = 'xsmall'));
```

Notice that the `auction_house` cluster you just created is configured as the default cluster in the dbt project configuration (`profiles.yml`). This means that dbt will run all models against this cluster (though you can override the default in the model configuration using the [`cluster` option](https://materialize.com/docs/integrations/dbt/#clusters)).

## dbt

### Define the models

This demo includes all the models needed to recreate the get started demo, including:

#### Sources

- [`sources/auction_house.sql`](models/sources/auction_house.sql)

#### Views

- [`staging/avg_bids.sql`](models/staging/avg_bids.sql)

- [`staging/on_time_bids.sql`](models/staging/on_time_bids.sql)

- [`staging/highest_bid_per_auction.sql`](models/staging/highest_bid_per_auction.sql)

#### Materialized views

- [`marts/winning_bids.sql`](models/marts/winning_bids.sql)

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

     name      |      type      |  size
---------------+----------------+---------
 auction_house | load-generator | 3xsmall
 auctions      | subsource      | 3xsmall
 bids          | subsource      | 3xsmall
```

**Views**

```sql
SHOW VIEWS;

          name
-------------------------
 avg_bids
 highest_bid_per_auction
 on_time_bids
```

**Materialized views**

```sql
SHOW MATERIALIZED VIEWS;

     name     |    cluster
--------------+---------------
 winning_bids | auction_house
```

That’s it! From here on, Materialize makes sure that your models are **incrementally updated** as new data streams in, and that you get **fresh and correct** results with millisecond latency whenever you query your views.

> :crab: As an exercise, [SUBSCRIBE](https://materialize.com/docs/sql/subscribe/) to the `winning_bids` materialized view to see who is winning!

### Test the project

To help demonstrate how `dbt test` works with Materialize for **continuous testing**, you'll notice that testing is configured in the dbt project configuration (`profiles.yml`):

```yaml
tests:
  mz_get_started:
    marts:
      +store_failures: true
      +schema: 'etl_failure'
```

, and that we added some [generic tests](https://docs.getdbt.com/docs/building-a-dbt-project/tests#generic-tests) to the `on_time_bids` model in `auction_house.yml`:

```yaml
models:
  - name: on_time_bids
    description: 'On time auction bids'
    columns:
      - name: bid_id
        description: 'Unique ID for each bid'
        tests:
          - not_null
          - unique
```

Tests are configured to [`store_failures`](https://docs.getdbt.com/reference/resource-configs/store_failures), which instructs dbt to create a materialized view for each test using the respective `SELECT` statements.

1. To run the tests:

```bash
dbt test
```

  This creates two materialized views in a dedicated schema (`public_etl_failure`): `not_null_on_time_bids_bid_id` and `unique_on_time_bids_bid_id`. dbt takes care of naming the views based on the type of test (`not_null`, `unique`) and the columns being tested (`bid_id`).

  These views are continuously updated as new data streams in, and allow you to monitor failing rows **as soon as** an assertion fails. You can use this feature for unit testing during the development of your dbt models, and later in production to trigger real-time alerts downstream.

2. From the terminal session where you connected to Materialize, double-check that the schema storing the tests was created:

#### Schemas

```sql
SHOW SCHEMAS;

        name
--------------------
 public
 public_etl_failure
```

#### (Testing) Materialized views

```sql
SHOW MATERIALIZED VIEWS FROM public_etl_failure;

             name             |    cluster
------------------------------+---------------
 not_null_on_time_bids_bid_id | auction_house
 unique_on_time_bids_bid_id   | auction_house
```

<hr>

If you run into issues with the `dbt-materialize` adapter, please [open a GitHub issue](https://github.com/MaterializeInc/materialize/issues/new/choose) so we can look into it!
