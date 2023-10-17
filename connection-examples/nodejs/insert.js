const { Client } = require('pg');

const client = new Client({
    user: MATERIALIZE_USERNAME,
    password: MATERIALIZE_PASSWORD,
    host: MATERIALIZE_HOST,
    port: 6875,
    database: 'materialize',
    ssl: true
});

const text = 'INSERT INTO countries(code, name) VALUES($1, $2);';
const values = ['GH', 'GHANA'];

async function main() {
    await client.connect();
    const res = await client.query(text, values);
    console.log(res);
}

main();