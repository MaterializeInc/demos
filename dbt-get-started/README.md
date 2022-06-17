# Getting started with dbt and Materialize

[dbt](https://docs.getdbt.com/docs/introduction) has become the standard for data transformation (“the T in ELT”). It combines the accessibility of SQL with software engineering best practices, allowing you to not only build reliable data pipelines, but also document, test and version-control them.

This demo recreates the Materialize [getting started guide](https://materialize.com/docs/get-started/) using dbt as the transformation layer.

## Docker

```bash
# Start the setup
docker-compose up -d

# Check if everything is up and running!
docker-compose ps
```

Once you're done playing with the setup, tear it down:

```bash
docker-compose down -v
```

## dbt

To access the [dbt CLI](https://docs.getdbt.com/dbt-cli/cli-overview), run:

```bash
docker exec -it dbt bash
```

From here, you can run dbt commands as usual. To check that the [`dbt-materialize`](https://pypi.org/project/dbt-materialize/) plugin has been installed:

```bash
dbt --version
```

### Build and run the models

We've created a few core models that take care of defining the building blocks of a dbt+Materialize project, including a streaming [source](https://materialize.com/docs/overview/api-components/#sources):

- `sources/market_orders_raw.sql`

, as well as a staging [view](https://materialize.com/docs/overview/api-components/#non-materialized-views) to transform the source data:

- `staging/stg_market__orders.sql`

, and a [materialized view](https://materialize.com/docs/overview/api-components/#materialized-views) that continuously updates as the underlying data changes:

- `marts/avg_bid.sql`

To run the models:

```bash
dbt run
```

> :crab: As an exercise, you can add models for the queries demonstrating [joins](https://materialize.com/docs/get-started/#joins) and [temporal filters](https://materialize.com/docs/get-started/#temporal-filters).

## Materialize

To connect to the running Materialize service, you can use `mzcli`, which is included in the setup:

```bash
docker-compose run mzcli
```

and run a few commands to check the objects created through dbt:

**Sources**

```sql
SHOW SOURCES;

       name
-------------------
 market_orders_raw
```

**Views**

```sql
SHOW VIEWS;

     name
---------------
 avg_bid
 market_orders
```

**Materialized views**

```sql
SHOW MATERIALIZED VIEWS;

  name
---------
 avg_bid
```

You'll notice that you're only able to `SELECT` from `avg_bid` — this is because this is the only materialized view. It is incrementally updated as new data streams in, so you get fresh and correct results with low latency. Behind the scenes, Materialize is indexing the results of the embedded query in memory.

### Run the tests

We've included the generic `non_null` and `unique` out of the box tests in our project to help demonstrate the power of dbt test.

To run the tests:

```bash
dbt test
```

Under the hood, dbt creates a `SELECT` query for each test that returns the rows where this assertion is _not_ true; if the test returns zero rows, the assertion passes.

If you set the optional `--store-failures` flag or create a [`store_failures` config](https://docs.getdbt.com/reference/resource-configs/store_failures), dbt will create a materialized view using the test query.
This view is a continuously updating representation of failures. It allows you to examine failing records _both_ as they happen while you are developing your data model, and later in production if an upstream change causes an assertion to fail.

We've configured our [project](dbt/dbt_project.yml) to `store-failures` from these tests in the `etl_failures` schema.

```sql
SHOW SCHEMAS;

        name
--------------------
 public ---note: our data model
 public_etl_failure
```

```sql
SHOW VIEWS FROM public_etl_failure;

          name
-------------------------
 not_null_avg_bid_symbol
 unique_avg_bid_symbol
(2 rows)
```

dbt took care of naming these materailized views for us based on the type of test and the columms being tested. No rows in these! Data pipeline looks good.

## Local installation

To set up dbt and Materialize in your local environment instead of using Docker, follow the instructions in the [documentation](https://materialize.com/docs/guides/dbt/).

<hr>

If you run into issues with the `dbt-materialize` adapter, please [open a GitHub issue](https://github.com/MaterializeInc/materialize/issues/new/choose) so we can look into it!
