// node 14+ cjs named exports not found in pg
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    user: "MATERIALIZE_USERNAME",
    database: "materialize",
    password: "APP_SPECIFIC_PASSWORD",
    host: "MATERIALIZE_HOST",
    port: 6875,
    ssl: true
});

/*
    Alternatively, you can use the connection string format:
    const client = new Client('postgres://materialize@localhost:6875/materialize');
*/

async function main() {
    try {
        await client.connect();

        /* Work with Materialize */
    } catch(e) {
        console.log("error: ", e);
    } finally {
        await client.end();
    }
}

await main();