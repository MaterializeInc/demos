# Materialize + Rust Example

You can connect to Materialize the same way you connect to [PostgreSQL with the crate](https://crates.io/crates/postgres).

Add the dependencies:

```
[dependencies]

postgres = "0.19.3"
```

Run examples:
```bash
cargo run
```
### Examples:

- [Connection](./src/connection.rs)
- [Stream](./src/subscribe.rs)
- [Query](./src/query.rs)
- [Insert data into tables](./src/insert.rs)
- [Manage sources](./src/source.rs)
- [Manage Views](./src/view.rs)