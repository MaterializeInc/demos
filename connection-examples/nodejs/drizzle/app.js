import { pgView, pgTable, serial, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import dotenv from "dotenv";

const { Client } = pkg;

dotenv.config();

const client = new Client({
  host: process.env.MZ_HOST,
  port: Number(process.env.MZ_PORT),
  user: process.env.MZ_USER,
  password: process.env.MZ_PASSWORD,
  database: process.env.MZ_DATABASE,
  ssl: true
});

await client.connect();
const db = drizzle(client);

// Use an existing view
export const winningBids = pgView("winning_bids", {
    id: serial("id"),
    buyer: text("buyer"),
    auction_id: integer("auction_id"),
    amount: real("amount"),
    bid_time: timestamp("bid_time"),
    item: text("item"),
    seller: text("seller")
}).existing();

// Fetch all rows from the winningBids view
const results = await db.select().from(winningBids).execute();
console.log(results);

// Optionally, close the connection when you're done
await client.end();
