const { Client } = require('pg');

const client = new Client({
    user: "MATERIALIZE_USERNAME",
    password: "MATERIALIZE_PASSWORD",
    host: "MATERIALIZE_HOST",
    port: 6875,
    database: 'materialize',
    ssl: true
});

async function main() {
    await client.connect();
    const res = await client.query(
        `CREATE SOURCE IF NOT EXISTS counter
        FROM LOAD GENERATOR COUNTER
        (TICK INTERVAL '500ms')
        WITH (SIZE = '3xsmall');`
        );
    console.log(res);
}

main();