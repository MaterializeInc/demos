# Materialize + Python Example

You connect to Materialize the same way you [connect to PostgreSQL with `psycopg2`](https://www.psycopg.org/docs/usage.html).

To install [`psycopg2`](https://pypi.org/project/psycopg2/) run:

```
pip install psycopg2
```

### Examples:

- [Connection](./connection.py)
- [Stream](./subscribe.py)
- [Query](./query.py)
- [Insert data into tables](./insert.py)
- [Manage sources](./source.py)
- [Manage Views](./view.py)

### `pg8000` Example

Alternatively, you can use [`pg8000`](https://pypi.org/project/pg8000/) to connect to Materialize.

To install [`pg8000`](https://pypi.org/project/pg8000/) run:

```
pip install pg8000
```

- [pg8000](./pg8000)