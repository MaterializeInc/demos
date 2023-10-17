import { Client } from "https://deno.land/x/postgres/mod.ts";

const client = new Client({
    user: "MATERIALIZE_USERNAME",
    database: "materialize",
    password: "APP_SPECIFIC_PASSWORD",
    hostname: "MATERIALIZE_HOST",
    port: 6875,
    ssl: true,
})

const main = async ({ response }: { response: any }) => {
    try {
        await client.connect()

        await client.queryObject(
            `CREATE MATERIALIZED VIEW IF NOT EXISTS counter_sum AS
            SELECT sum(counter)
            FROM counter;`
        );

        const result = await client.queryObject("SHOW VIEWS")
        console.log(result.rows)
    } catch (err) {
        console.error(err.toString())
    } finally {
        await client.end()
    }
}
export { main }

// Call the main function
main({ response: {} })