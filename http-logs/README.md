# HTTP Log Parsing

This is a self-contained demo using [Materialize](https://materialize.com) to parse server logs for a mock e-commerce site, and extract some business insights from them.

![Materialize Log Parsing demo Diagram](https://materialize.com/docs/images/demos/log_parsing_architecture_diagram.png)

For a more thorough walkthrough, check out the [Materialize documentation](https://materialize.com/docs/demos/log-parsing/).

## Running the demo

To spin up the demo, run:

```
docker-compose up -d
```

, and check that all services were started successfully:

```
docker-compose ps
```

### Launch Materialize CLI

In order to access the Materialize CLI (`mzcli`) container, run the following command:

```bash
docker-compose run mzcli
```

### Create a source from HTTP logs

To tap into the `/log/requests` file (that is being constantly updated), you need to create a [file source](https://materialize.com/docs/sql/create-source/text-file/):

```sql
CREATE SOURCE requests
FROM FILE '/log/requests' WITH (tail = true)
FORMAT REGEX '(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - - \[(?P<ts>[^]]+)\] "(?P<path>(?:GET /search/\?kw=(?P<search_kw>[^ ]*) HTTP/\d\.\d)|(?:GET /detail/(?P<product_detail_id>[a-zA-Z0-9]+) HTTP/\d\.\d)|(?:[^"]+))" (?P<code>\d{3}) -';
```

To verify that the source was created, you can use the following statement:

```sql
SHOW SOURCES;
```

Output:

```
+-----------+
| SOURCES   |
|-----------|
| requests  |
+-----------+
```

, and then check its structure using `SHOW COLUMNS`:

```sql
SHOW COLUMNS FROM requests;
```

Output:

```
+-------------------+------------+--------+
| name              | nullable   | type   |
|-------------------+------------+--------|
| ip                | true       | text   |
| ts                | true       | text   |
| path              | true       | text   |
| search_kw         | true       | text   |
| product_detail_id | true       | text   |
| code              | true       | text   |
| mz_line_no        | false      | int8   |
+-------------------+------------+--------+
```

### Create a materialized view

Next, you can create a materialized view that embeds this query:

```sql
CREATE MATERIALIZED VIEW unique_visitors AS
    SELECT count(DISTINCT ip) FROM requests;
```

To view the results of the embedded query, run:

```sql
SELECT * FROM unique_visitors;
```

If you re-run the `SELECT` statement at different points in time, you can see the updated results based on the latest log data.

---

Let's create another materialized view, now to count the total number of instances for each `ip`, `path` and `statuscode` combo:

```sql
CREATE MATERIALIZED VIEW aggregated_logs AS
  SELECT
    ip,
    path,
    code::int,
    COUNT(*) as count
  FROM requests GROUP BY 1,2,3;
```

Again, you can retrieve the most recent results for `aggregated_logs` using:

```sql
SELECT * FROM unique_visitors ORDER BY count DESC LIMIT 100;
// Output:
       ip       |      path      | code | count
----------------+----------------+------+-------
 18.120.103.2   | GET / HTTP/1.1 |  200 |    15
 2.65.37.39     | GET / HTTP/1.1 |  200 |    13
 127.23.43.9    | GET / HTTP/1.1 |  200 |    13
 29.120.64.86   | GET / HTTP/1.1 |  200 |    13
 82.27.85.125   | GET / HTTP/1.1 |  200 |    13
 112.69.118.96  | GET / HTTP/1.1 |  200 |    13
 115.118.92.80  | GET / HTTP/1.1 |  200 |    13
 60.104.117.114 | GET / HTTP/1.1 |  200 |    13
 0.67.28.9      | GET / HTTP/1.1 |  200 |    12
```

# Recap

In this demo, you learned how to:

- Create a source from a dynamic log file
- Break down log files using `REGEX`
- Consume data from a streaming source and create materialized views
- Use SQL to extract data from your logs

## Related pages

- [`CREATE SOURCE`](https://materialize.com/docs/sql/create-source)
- [Functions + Operators](https://materialize.com/docs/sql/functions)
