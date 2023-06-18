const WebSocket = require("ws");
const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const {
  DB_USER = "materialize",
  DB_PASSWORD = "materialize",
  DB_NAME = "materialize",
  DB_HOST = "materialized",
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

const activeConnections = new Set(); // Track active WebSocket connections

async function connectToDB() {
  try {
    await client.connect();
    console.log("Connected to the database");
    main();
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    connectTries++;
    if (connectTries < maxConnectTries) {
      // Wait for 5 seconds before trying again
      setTimeout(connectToDB, 5000);
    } else {
      console.error("Max connection attempts reached. Exiting...");
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
    console.error("Database query failed:", e);
    return false;
  }
}

async function startWS() {
  const wss = new WebSocket.Server({
    port: 8080,
    verifyClient: function (info, callback) {
      callback(true);
    },
  });

  wss.on("connection", async ws => {
    console.log("Connected to WebSocket client");
    activeConnections.add(ws); // Add the connection to the active connections set

    ws.on("close", async () => {
      console.log("WebSocket client disconnected");
      activeConnections.delete(ws); // Remove the connection from the active connections set
    });

    if (!cursorDeclared) {
      await client.query("BEGIN");
      await client.query(
        "DECLARE c CURSOR FOR SUBSCRIBE abandoned_cart WITH (SNAPSHOT = false)"
      );
      cursorDeclared = true;
    }

    while (true) {
      const res = await client.query("FETCH ALL c");
      console.log(res.rows);
      ws.send(JSON.stringify(res.rows));
    }
  });
}

async function main() {
  const viewExists = await checkViewExistence();
  if (viewExists) {
    console.log("View exists, starting WebSocket server...");
    startWS();
  } else {
    console.log("View does not exist, checking again in 10 seconds...");
    setTimeout(main, 10000);
  }
}

connectToDB();
