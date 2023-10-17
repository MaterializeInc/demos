const { Client } = require('pg');

const client = new Client({
    user: "MATERIALIZE_USERNAME",
    password: "MATERIALIZE_PASSWORD",
    host: "MATERIALIZE_HOST",
    port: 6875,
    database: 'materialize',
    ssl: true
});

/*
    Alternatively, you can use the following syntax:
    const client = new Client('postgres://materialize@localhost:6875/materialize');
*/

async function main() {
    await client.connect();
    /* Work with Materialize */
}

main();
