import express from "express";
import { WebSocketServer } from "ws";
import { Extra, useServer } from "graphql-ws/lib/use/ws";
import { buildSchema, parse, validate } from "graphql";
import MaterializeClient from "./MaterializeClient";
import EventEmitter from "events";
import { Pool } from "pg";
import { Context, SubscribeMessage } from "graphql-ws";

/**
 * Materialize Client
 */
const materializeClient = new MaterializeClient({
  // host: "localhost",
  host: "materialized",
  port: 6875,
  user: "materialize",
  password: "materialize",
  database: "materialize",
  query_timeout: 5000,
});

/**
 * Postgres Client
 */
const postgresPool = new Pool({
  // host: "localhost",
  host: "postgres",
  port: 5432,
  user: "postgres",
  password: "pg_password",
  database: "postgres",
});

/**
 * Build GraphQL Schema
 */
const schema = buildSchema(`
  type Antenna {
    antenna_id: String
    geojson: String
    performance: Float
    diff: Int
    timestamp: Float
  }

  type Query {
    getAntennas: [Antenna]
  }

  type Mutation {
    crashAntenna(antenna_id: String!): Antenna
  }

  type Subscription {
    antennasUpdates: [Antenna]
  }
`);

/**
 * Map to follow connections and tails
 */
const connectionEventEmitter = new EventEmitter();

/**
 * Build a custom Postgres insert with a low performance value to crash antenna
 * @param antennaId Antenna Identifier
 * @returns
 */
function buildQuery(antennaId: number) {
  return `
      INSERT INTO antennas_performance (antenna_id, clients_connected, performance, updated_at) VALUES (
        ${antennaId},
        ${Math.ceil(Math.random() * 100)},
        -100,
        now()
      );
    `;
}

/**
 * Queries
 */
const getAntennas = async () => {
  try {
    const { rows } = await materializeClient.query("SELECT * FROM antennas;");

    /**
     * Stringify GEOJson
     */
    const mappedRows = rows.map((x) => ({
      ...x,
      geojson: JSON.stringify(x.geojson),
    }));
    return mappedRows;
  } catch (err) {
    console.log("Error running query.");
    console.error(err);
  }

  return "Hello!";
};

/**
 * Mutations
 */
const crashAntenna = async (context) => {
  const { antenna_id: antennaId } = context;

  postgresPool.connect(async (err, client, done) => {
    if (err) {
      console.error(err);
      return;
    }

    try {
      /**
       * Smash the performance
       */
      const query = buildQuery(antennaId);

      await client.query(query);
    } catch (clientErr) {
      console.error(clientErr);
    } finally {
      done();
    }
  });

  return {
    antenna_id: antennaId,
  };
};

/**
 * Subscriptions
 */
async function* antennasUpdates(_, ctxVars) {
  const [subscriptionId] = ctxVars;

  try {
    /**
     * Yield helpers
     */
    let results = [];
    let resolve: (value: unknown) => void;
    let promise = new Promise((r) => (resolve = r));
    let done = false;

    /**
     * Listen tail events
     */
    const eventEmmiter = new EventEmitter();
    eventEmmiter.on("data", (data) => {
      const mappedData: Array<any> = data.map((x) => ({
        ...x,
        geojson: JSON.stringify(x.geojson),
        diff: x.mz_diff,
        timestamp: x.mz_timestamp,
      }));
      results = mappedData;
      resolve(mappedData);
      promise = new Promise((r) => (resolve = r));
    });

    materializeClient
      .tail(
        "TAIL (SELECT * FROM last_half_minute_performance_per_antenna)",
        eventEmmiter
      )
      .catch((tailErr) => {
        console.error("Error running tail.");
        console.error(tailErr);
      })
      .finally(() => {
        console.log("Finished tail.");
        done = true;
      });

    connectionEventEmitter.on("disconnect", (unsubscriptionId) => {
      if (subscriptionId === unsubscriptionId) {
        eventEmmiter.emit("disconnect");
        done = true;
      }
    });

    /**
     * Yield results
     */
    while (!done) {
      await promise;
      yield { antennasUpdates: results };
      results = [];
    }

    console.log("Outside done.");
  } catch (error) {
    console.error("Error running antennas updates subscription.");
    console.error(error);
  }
}

/**
 * The roots provide resolvers for each GraphQL operation
 */
const roots = {
  query: {
    getAntennas,
  },
  mutation: {
    crashAntenna,
  },
  subscription: {
    antennasUpdates,
  },
};

/**
 * Connection handlers
 */
const onClose = () => {
  console.log("onClose ids");
};
const onConnect = () => {
  console.log("onConnect.");
};
const onDisconnect = (ctx) => {
  const ids = Object.keys(ctx.subscriptions);
  ids.forEach((id) => connectionEventEmitter.emit("disconnect", id));
};
const onError = (ctx, msg, errors) => {
  console.error("onError: ", ctx, msg, errors);
};
const onSubscribe: (
  ctx: Context<Extra & Partial<Record<PropertyKey, never>>>,
  message: SubscribeMessage
) => any = (ctx, msg) => {
  const ids = Object.keys(ctx.subscriptions);
  console.log("OnSubscribe ids: ", ids);

  const args = {
    schema,
    operationName: msg.payload.operationName,
    document: parse(msg.payload.query),
    variableValues: msg.payload.variables,
  };

  // dont forget to validate when returning custom execution args!
  const errors = validate(args.schema, args.document);
  if (errors.length > 0) {
    return errors; // return `GraphQLError[]` to send `ErrorMessage` and stop subscription
  }

  return { ...args, contextValue: ids };
};

/**
 * Setup server
 */
const app = express();

const server = app.listen(4000, () => {
  const wsServer = new WebSocketServer({
    server,
    path: "/graphql",
  });

  wsServer.on("error", (serverError) => {
    console.error("Server error: ", serverError);
  });

  wsServer.on("connection", (ws) => {
    ws.on("error", (socketError) => {
      console.error("Socket error: ", socketError);
    });
  });

  useServer(
    { schema, roots, onClose, onDisconnect, onError, onSubscribe, onConnect },
    wsServer
  );

  console.log(
    "🚀 GraphQL web socket server listening on port 4000. \n\nUse 'ws://localhost:4000/graphql' to connect."
  );
});
