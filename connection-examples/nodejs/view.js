const { Client } = require("pg");

const client = new Client({
    user: "MATERIALIZE_USERNAME",
    password: "MATERIALIZE_PASSWORD",
    host: "MATERIALIZE_HOST",
    port: 6875,
    database: "materialize",
    ssl: true,
});

async function main() {
  await client.connect();
  const res = await client.query(
    `CREATE MATERIALIZED VIEW IF NOT EXISTS counter_sum AS
    SELECT sum(counter)
    FROM counter;`
  );
  console.log(res);
}

main();
