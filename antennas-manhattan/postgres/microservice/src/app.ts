import { Pool } from "pg";
import { v4 } from "uuid";
import ws from "ws";
import { createClient } from "graphql-ws";

/**
 * Postgres Client
 */
const postgresPool = new Pool({
  host: "postgres",
  // host: "localhost",
  port: 5432,
  user: "postgres",
  password: "pg_password",
  database: "postgres",
});

/**
 * Backend client
 */
const graphqlClient = createClient({
  url: "ws://backend:4000/graphql",
  // url: "ws://localhost:4000/graphql",
  webSocketImpl: ws,
  generateID: v4,
  on: {
    error: (error) => {
      console.log("Error: ", error);
    },
  },
});

/**
 * Map to follow bad performance antennas
 */
const performanceMapCounter = new Map<string, number>();
const alreadyImprovingSet = new Set<string>();

/**
 * Build a custom Postgres insert with a random performance and clients connected
 * @param antennaId Antenna Identifier
 * @returns
 */
const buildQuery = (antennaId: number, value: number) => {
  return `
      INSERT INTO antennas_performance (antenna_id, clients_connected, performance, updated_at) VALUES (
        ${antennaId},
        ${Math.ceil(Math.random() * 100)},
        ${value + Math.random()},
        now()
      );
    `;
};

/**
 * Find and enable helper antennas
 * @param antennaName
 */
const findHelperAntennas = (
  antennaName
): Promise<Array<{ antenna_id: number }>> => {
  const query = `SELECT antenna_id FROM antennas WHERE CAST(CAST(geojson as json)->>'properties' as json)->>'helps' = '${antennaName}';`;
  let helperAntennas = [];

  return new Promise((res) => {
    postgresPool.connect(async (err, postgresClient, done) => {
      if (err) {
        console.error(err);
      } else {
        try {
          const results = await postgresClient.query(query);
          helperAntennas = results.rows;
        } catch (clientErr) {
          console.error(clientErr);
        } finally {
          done();
          res(helperAntennas);
        }
      }
    });
  });
};

const improveAntennaPerformance = async (antennaId, antennaName) => {
  console.log("Improving performance for antenna: ", antennaId);
  alreadyImprovingSet.add(antennaId);

  const helperAntennas = await findHelperAntennas(antennaName);

  /**
   * Improve antenna performance
   */
  postgresPool.connect((err, postgresClient, done) => {
    if (err) {
      console.error(err);
    } else {
      let count = 0;
      const intervalId = setInterval(async () => {
        const query =
          buildQuery(antennaId, 7.5) +
          "\n" +
          helperAntennas.map((x) => buildQuery(x.antenna_id, 5)).join("\n");
        count += 1;
        try {
          await postgresClient.query(query);
        } catch (clientErr) {
          console.error(clientErr);
        } finally {
          /**
           * Clean set and interval
           */
          if (count === 100) {
            console.log(`Stopping interval for ${antennaId}`);
            clearInterval(intervalId);
            alreadyImprovingSet.delete(antennaId);
            done();
          }
        }
      }, 250);
    }
  });
};

/**
 * Listen antennas performance events
 */
const antennasPerformanceListener = (data) => {
  const { data: antennasData } = data;
  const { antennasUpdates } = antennasData;

  antennasUpdates.forEach((x) => {
    const { antenna_id: antennaId, geojson: rawGeoJson, performance } = x;

    try {
      const geojson = JSON.parse(rawGeoJson);
      const { properties } = geojson;
      const { name: antennaName } = properties;

      const antennaCounter = performanceMapCounter.get(antennaId);

      if (performance < 4.75) {
        if (antennaCounter > 7 && !alreadyImprovingSet.has(antennaId)) {
          improveAntennaPerformance(antennaId, antennaName);
        } else {
          performanceMapCounter.set(
            antennaId,
            typeof antennaCounter === "number" ? antennaCounter + 1 : 1
          );
        }
      } else {
        performanceMapCounter.delete(antennaId);
      }
    } catch (errParsing) {
      console.error(errParsing);
    }
  });
};

const onError = (err) => {
  console.error("Ouch. Some error: ", err);
};

const onComplete = () => {
  console.log("Finished.");
};

graphqlClient.subscribe(
  {
    query:
      "subscription { antennasUpdates { antenna_id, geojson, performance } }",
  },
  {
    next: antennasPerformanceListener,
    error: onError,
    complete: onComplete,
  }
);
