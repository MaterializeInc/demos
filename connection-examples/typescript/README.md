# Materialize + TypeScript Example

You connect to Materialize the same way you connect to [PostgreSQL with `node-postgres`](https://node-postgres.com/features/connecting).

Install dependencies and build:
```bash
# Requires npm
$ npm run build # npm i && tsc
```

Run examples
```bash
$ node "./dist/connection.js"
$ node "./dist/source.js"
$ node "./dist/view.js"
$ node "./dist/subscribe.js"
$ node "./dist/query.js"
$ node "./dist/insert.js"
```

### Examples:

- [Connection](./src/connection.ts)
- [Stream](./src/subscribe.ts)
- [Query](./src/query.ts)
- [Insert data into tables](./insert.ts)
- [Manage sources](./source.ts)
- [Manage Views](./view.ts)