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

### Test the project

To help demonstrate how `dbt test` works with Materialize for **continuous testing**, we've added some [generic tests](https://docs.getdbt.com/docs/building-a-dbt-project/tests#generic-tests) to the [`avg_bid` model](dbt/models/marts/avg_bid.sql):

```yaml
models:
  - name: avg_bid
    description: 'Computes the average bid price'
    columns:
      - name: symbol
        description: 'The stock ticker'
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
dbt test
```

This creates two materialized views in a dedicated schema (`public_etl_failures`): `not_null_avg_bid_symbol` and `unique_avg_bid_symbol`. dbt takes care of naming the views based on the type of test (`not_null`, `unique`) and the columns being tested (`symbol`).

These views are continuously updated as new data streams in, and allow you to monitor failing rows **as soon as** an assertion fails. You can use this feature for unit testing during the development of your dbt models, and later in production to trigger real-time alerts downstream.

## Materialize

To connect to the running Materialize service, you can use a PostgreSQL-compatible client like `psql`, which is bundled in the `materialize/cli` image:

```bash
docker-compose run cli
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

You'll notice that you're only able to `SELECT` from `avg_bid` — this is because it is the only materialized view! This view is incrementally updated as new data streams in, so you get fresh and correct results with low latency. Behind the scenes, Materialize is indexing the results of the embedded query in memory.

### Continuous testing

To validate that the schema storing the tests was created:

```sql
SHOW SCHEMAS;

        name
--------------------
 public
 public_etl_failure
```

, and that the materialized views that continuously test the `avg_bid` view for failures are up and running:

```sql
SHOW VIEWS FROM public_etl_failure;

          name
-------------------------
 not_null_avg_bid_symbol
 unique_avg_bid_symbol
```

## Local installation

To set up dbt and Materialize in your local environment instead of using Docker, follow the instructions in the [documentation](https://materialize.com/docs/guides/dbt/).

<hr>

If you run into issues with the `dbt-materialize` adapter, please [open a GitHub issue](https://github.com/MaterializeInc/materialize/issues/new/choose) so we can look into it!
