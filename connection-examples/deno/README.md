# Materialize + Deno example

You connect to Materialize the same way you [connect to PostgreSQL with `deno-postgres`](https://deno.land/x/postgres).

To run the example, run the following command:

```
deno run --allow-net --allow-env --allow-read --allow-write --unstable connection.ts
```

### Examples:

- [Connection](./connection.ts)
- [Stream](./subscribe.ts)
- [Query](./query.ts)
- [Insert data into tables](./insert.ts)
- [Manage sources](./source.ts)
- [Manage Views](./view.ts)