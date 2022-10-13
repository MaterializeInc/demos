# Getting started with dbt and Materialize

[dbt](https://docs.getdbt.com/docs/introduction) has become the standard for data transformation (“the T in ELT”). It combines the accessibility of SQL with software engineering best practices, allowing you to not only build reliable data pipelines, but also document, test and version-control them.

This demo recreates the Materialize [getting started guide](https://materialize.com/docs/get-started/) using dbt as the transformation layer.

## Configuration

To get started, make sure you have a Materialize account. Log into your account and generate an [app password](https://cloud.materialize.com/access) to use in your dbt connection. Update [`profiles.yml`](profiles.yml) to replace the `Host`, `Password` and `User` connection parameters.

We've bundled everything you'll need to create a development environment in a wrapper script, in `bin/dbt`. It installs the dbt-materialize adapter for you, and sets your profile path. Alternatively, [install](https://materialize.com/docs/integrations/dbt/#setup) the dbt-materialize plugin locally.

Test the connection by running:

```shell
bin/dbt debug
```

### Create a cluster

In Materialize, [clusters](https://materialize.com/docs/overview/key-concepts/#clusters) are logical components that let you express resource isolation for all dataflow-powered objects, e.g. indexes. They rely on cluster replicas to run dataflows. We'll create a `auction_house` cluster (logical compute) and cluster replica (physical compute) to isolate the work we will do when we run our dbt models in the next step.

To connect to Materialize, you can use a PostgreSQL-compatible [client](https://materialize.com/docs/integrations/sql-clients/) like `psql`:

```bash
psql "postgres://<user>:<password>@<host>:6875/materialize"
```

and then run:

```sql
CREATE CLUSTER auction_house REPLICAS (xsmall_replica (SIZE 'xsmall'));
```

### Define the models

We've created a few core models that take care of defining the building blocks of a dbt+Materialize project, including a streaming [source](https://materialize.com/docs/overview/api-components/#sources). In this demo, we'll use Materialize's built in [Auction](https://materialize.com/docs/sql/create-source/load-generator/#auction) load generator source to simulate an auction house where different users are bidding on an ongoing series of auctions:

- [`sources/auction_house.sql`](models/sources/auction_house.sql)

We'll create a [view](https://materialize.com/docs/overview/api-components/#non-materialized-views) to join together our `bids` and `auction` sources:

- [`marts/on_time_bids.sql`](marts/on_time_bids.sql)

We'll aggregate `on_time_bids` by creating a view that utilizes an [index](https://materialize.com/docs/overview/key-concepts/#indexes) to assemble and incrementally maintain the average bid amount in memory. These are especially useful in cases where you need to speed up complex queries or filter on literal values or expressions:

- [`marts/avg_bids.sql`](marts/avg_bids.sql)

We'll demonstrate how to go beyond the reporting use case to power a downstream alerting pipeline, used to inform the winners of each auction immediately after it closes. To do so, we'll need to create a view that tells us the highest bid for each auction:

- [`marts/highest_bid_per_auction.sql`](marts/highest_bid_per_auction.sql)

and contain that result set to only include bids that came in before each auction closed:

- [`marts/winning_bids.sql`](marts/winning_bids.sql)

The final result is a [materialized view](https://materialize.com/docs/overview/key-concepts/#materialized-views) that is persisted in durable storage and incrementally updated as new data arrives.

### Build and run the models

To step through building this auction house pipeline, run one model at a time by directly [selecting](https://docs.getdbt.com/reference/node-selection/syntax) it:

```shell
bin/dbt run -s models/sources
bin/dbt run -s models/marts/on_time_bids.sql
bin/dbt run -s models/marts/avg_bids.sql
bin/dbt run -s models/marts/highest_bid_per_auction.sql
bin/dbt run -s models/marts/winning_bids.sql
```

To run everything together, omit the selection and just use `bin/dbt run`.

> :crab: As an exercise, connect to Materialize and [SUBSCRIBE](https://materialize.com/docs/sql/subscribe/) to `winning_bids` to see who is winning!

### Test the project

To help demonstrate how `dbt test` works with Materialize for **continuous testing**, we've added some [generic tests](https://docs.getdbt.com/docs/building-a-dbt-project/tests#generic-tests) to the [`on_time_bids` model](models/on_time_bids.sql):

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

, and configured testing in the [project file](dbt/dbt_project.yml):

```yaml
tests:
  mz_get_started:
    marts:
      +store_failures: true
      +schema: 'etl_failure'
```

Note that tests are configured to [`store_failures`](https://docs.getdbt.com/reference/resource-configs/store_failures), which instructs dbt to create a materialized view for each test using the respective `SELECT` statements.

To run the tests:

```bash
bin/dbt test
```

This creates two materialized views in a dedicated schema (`public_etl_failures`): `not_null_on_time_bids_bid_id` and `unique_on_time_bids_bid_id`. dbt takes care of naming the views based on the type of test (`not_null`, `unique`) and the columns being tested (`bid_id`).

These views are continuously updated as new data streams in, and allow you to monitor failing rows **as soon as** an assertion fails. You can use this feature for unit testing during the development of your dbt models, and later in production to trigger real-time alerts downstream.

## Materialize

Run a few commands to check the objects created through dbt:

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

### Continuous testing

To validate that the schema storing the tests was created:

```sql
SHOW SCHEMAS;

        name
--------------------
 public
 public_etl_failure
```

, and that the materialized views that continuously test the `on_time_bids` view for failures are up and running:

```sql
SHOW MATERIALIZED VIEWS FROM public_etl_failure;

             name             |    cluster
------------------------------+---------------
 not_null_on_time_bids_bid_id | auction_house
 unique_on_time_bids_bid_id   | auction_house

```

<hr>

If you run into issues with the `dbt-materialize` adapter, please [open a GitHub issue](https://github.com/MaterializeInc/materialize/issues/new/choose) so we can look into it!
