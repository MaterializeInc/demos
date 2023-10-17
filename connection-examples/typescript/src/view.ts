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

async function main() {
    try {
        await client.connect();
        const res = await client.query(
            `CREATE MATERIALIZED VIEW IF NOT EXISTS counter_sum AS
            SELECT sum(counter)
            FROM counter;`
            );
        console.log(res);
    } catch (e) {
        console.log("error: ", e);
    } finally {
        client.end();
    }
}

await main();