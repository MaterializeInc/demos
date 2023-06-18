const chalk = require("chalk");
const figlet = require("figlet");
const emoji = require("node-emoji");
const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const {
  DB_USER = "materialize",
  DB_PASSWORD = "materialize",
  DB_NAME = "materialize",
  DB_HOST = "localhost",
  DB_PORT = 6875,
} = process.env;

const client = new Client({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  ssl: false,
});

let connectTries = 0;
const maxConnectTries = 5;
let cursorDeclared = false;

console.log(
  chalk.yellow(figlet.textSync("DB Listener", { horizontalLayout: "full" }))
);

async function connectToDB() {
  try {
    await client.connect();
    console.log(
      chalk.green(emoji.get("checkered_flag"), "Connected to the database")
    );
    main();
  } catch (err) {
    console.error(
      chalk.red(
        emoji.get("no_entry"),
        "Failed to connect to the database:",
        err
      )
    );
    connectTries++;
    if (connectTries < maxConnectTries) {
      // Wait for 5 seconds before trying again
      setTimeout(connectToDB, 5000);
    } else {
      console.error(
        chalk.red(
          emoji.get("no_entry_sign"),
          "Max connection attempts reached. Exiting..."
        )
      );
      process.exit(1);
    }
  }
}

async function checkViewExistence() {
  try {
    const res = await client.query(
      `SELECT * FROM mz_materialized_views WHERE name = 'abandoned_cart'`
    );
    return res.rowCount > 0;
  } catch (e) {
    console.error(chalk.red(emoji.get("x"), "Database query failed:", e));
    return false;
  }
}

async function main() {
  const viewExists = await checkViewExistence();
  if (viewExists) {
    console.log(
      chalk.green(emoji.get("mag_right"), "View exists, fetching data...")
    );
    fetchData();
  } else {
    console.log(
      chalk.red(
        emoji.get("warning"),
        "View does not exist, checking again in 10 seconds..."
      )
    );
    setTimeout(main, 10000);
  }
}

async function fetchData() {
  if (!cursorDeclared) {
    await client.query("BEGIN");
    await client.query(
      "DECLARE c CURSOR FOR SUBSCRIBE abandoned_cart WITH (SNAPSHOT = false)"
    );
    cursorDeclared = true;
  }

  while (true) {
    const res = await client.query("FETCH ALL c");
    console.log(
      chalk.yellow(emoji.get("arrow_right"), "Send notification to:")
    );
    console.table(res.rows);
  }
}

connectToDB();
