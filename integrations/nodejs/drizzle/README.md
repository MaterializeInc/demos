## Node.js + Drizzle + Materialize demo

In this demo, we'll explore how to integrate Node.js with Drizzle ORM to query data from Materialize, a streaming database.

### Prerequisites:

-   Node.js installed on your machine
-   Materialize instance
-   Materialize [getting started guide](https://materialize.com/docs/get-started/)

### Step 1: Setting up the Project

Begin by setting up a new Node.js project:

```bash
mkdir drizzle-materialize-demo
cd drizzle-materialize-demo
npm init -y
```

### Step 2: Install Dependencies

Install the required packages:

```bash
npm install drizzle-orm pg dotenv
```

### Step 3: Configuration

Duplicate the provided `.env.example` into a new `.env` file:

```bash
cp .env.example .env
```

Update the `.env` file with your Materialize credentials.

### Step 4: Establishing a Connection

Let's understand the given code in `app.js`:

```js
import dotenv from "dotenv";
import pkg from "pg";
const { Client } = pkg;

dotenv.config();

// Create a connection client
const client = new Client({
  host: process.env.MZ_HOST,
  port: Number(process.env.MZ_PORT),
  user: process.env.MZ_USER,
  password: process.env.MZ_PASSWORD,
  database: process.env.MZ_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

await client.connect();
```

This code does the following:

1.  Imports necessary modules.
2.  Reads environment variables from the `.env` file.
3.  Creates a PostgreSQL client and connects to the Materialize database.

### Step 5: Defining the Data Structure with Drizzle

Drizzle provides an ORM (Object-Relational Mapping) interface. The given code defines a view that maps to the `winning_bids` view in the database:

```js
import { pgView, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(client);

export const winningBids = pgView("winning_bids", {
    id: serial("id"),
    buyer: text("buyer"),
    auction_id: integer("auction_id"),
    amount: real("amount"),
    bid_time: timestamp("bid_time"),
    item: text("item"),
    seller: text("seller")
}).existing();
```

Here, `pgView` is used to map the database view to a JavaScript object. Data types like `serial`, `text`, `integer`, etc., are used to define the columns and their types.

### Step 6: Fetching Data

Using Drizzle's fluent query API, you can fetch data from the Materialize view:

```js
const results = await db.select().from(winningBids).execute();
console.log(results);
```

### Step 7: Cleanup

When done, it's a good practice to close the connection to the database:

```js
await client.end();
```

### Conclusion

By following this demo, you've set up a Node.js application that uses Drizzle ORM to query data from Materialize.

You can take a look at the [`app.js`](app.js) file for the complete code.
