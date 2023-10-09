# Materialize + Lua Example

This example uses [luasql](https://keplerproject.github.io/luasql/index.html)
and was tested on Lua `v5.4`

Install the Postgres driver using LuaRocks:

`luarocks install luasql-postgres`

There are a few helper functions in `utils.lua` for iterating over rows
and dumpings a table to stdout.

### Examples:

- [Connection](./connection.lua)
- [Stream](./subscribe.lua)
- [Query](./query.lua)
- [Insert data into tables](./insert.lua)
- [Manage sources](./source.lua)
- [Manage Views](./view.lua)
