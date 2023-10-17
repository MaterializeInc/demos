import { Client } from "https://deno.land/x/postgres/mod.ts";
import { Update } from "./state";
import State, { Update } from "./state.ts";

const client = new Client({
  user: "MATERIALIZE_USERNAME",
  database: "materialize",
  password: "APP_SPECIFIC_PASSWORD",
  hostname: "MATERIALIZE_HOST",
  port: 6875,
  ssl: true,
});

interface CounterSum {
    sum: number;
  }

const main = async ({ response }: { response: any }) => {
    try {
        await client.connect()

        await client.queryObject('BEGIN');
        await client.queryObject('DECLARE c CURSOR FOR SUBSCRIBE (SELECT sum FROM counter_sum) WITH (PROGRESS);');

        while (true) {
          let buffer: Array<Update<CounterSum>> = [];
          const state = new State<CounterSum>();

          // Loop indefinitely
          while (true) {
            const { rows } = await client.queryObject('FETCH ALL c');
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
                    console.log("State: ", state.getState());
                    buffer.splice(0, buffer.length);
                  }
                }
              } else {
                  buffer.push({ value: { sum }, diff });
              }
          });
        }
      }
    } catch (err) {
        console.error(err.toString())
    } finally {
        await client.end()
    }
}

export { main }

// Call the main function
main({ response: {} })