// node 14+ cjs named exports not found in pg
import pkg from 'pg';
import State, { Update } from './state';
const { Client } = pkg;

const client = new Client({
  user: "MATERIALIZE_USERNAME",
  database: "materialize",
  password: "APP_SPECIFIC_PASSWORD",
  host: "MATERIALIZE_HOST",
  port: 6875,
  ssl: true
});

interface CounterSum {
  sum: number;
}

async function main() {
  try {
    await client.connect();

    await client.query('BEGIN');
    await client.query('DECLARE c CURSOR FOR SUBSCRIBE (SELECT sum FROM counter_sum) WITH (PROGRESS);');

    const state = new State<CounterSum>();
    const buffer: Array<Update<CounterSum>> = [];

    // Loop indefinitely
    while (true) {
      const { rows } = await client.query('FETCH ALL c');
      rows.forEach(row => {
        // Map row fields
        const {
          mz_timestamp: ts,
          mz_progressed: progress,
          mz_diff: diff,
          sum,
         } = row;

        //  When a progress is detected, get the last values
        if (progress) {
          if (buffer.length > 0) {
            try {
              state.update(buffer, ts);
            } catch (err) {
              console.error(err);
            } finally {
              buffer.splice(0, buffer.length);
            }
          }
        } else {
            buffer.push({ value: { sum }, diff });
        }
      });
    }
  } catch (e) {
    console.log("error: ", e);
  } finally {
    client.end(); // only on error
  }
}

await main();