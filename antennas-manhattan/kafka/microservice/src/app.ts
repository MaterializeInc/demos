import { Pool } from "pg";
import { v4 } from "uuid";
import ws from "ws";
import { createClient } from "graphql-ws";
import { Kafka } from "kafkajs"

const antennasEventsTopicName = "antennas_performance";

/**
 * Materialize Client
 */
const materializePool = new Pool({
  host: "materialized",
  // host: "localhost",
  port: 6875,
  user: "materialize",
  password: "materialize",
  database: "materialize",
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
    closed: () => {
      console.log("Closed");
    }
  },
});

/**
 * Kafka client
 */
const brokers = [process.env.KAFKA_BROKER || "localhost:9092"];

const kafka = new Kafka({
  clientId: "kafkaClient",
  brokers,
});
const producer = kafka.producer();
producer.connect().catch((err) => { console.log(err); process.exit(1); });

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
const buildEvent = (antennaId: number, value: number) => {
  return {
    antenna_id: antennaId,
    clients_connected: Math.ceil(Math.random() * 100),
    performance: value,
    updated_at: new Date().getTime()
  };
}


/**
 * Find and enable helper antennas
 * @param antennaName
 */
const findHelperAntennas = (
  antennaName
): Promise<Array<{ antenna_id: number }>> => {
  const query = `SELECT antenna_id FROM parsed_antennas WHERE CAST(geojson->>'properties' as json)->>'helps' = '${antennaName}';`;
  let helperAntennas = [];

  return new Promise((res) => {
    materializePool.connect(async (err, materializeClient, done) => {
      if (err) {
        console.log(err);
      } else {
        try {
          const results = await materializeClient.query(query);
          helperAntennas = results.rows;
        } catch (clientErr) {
          console.log(clientErr);
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
  let count = 0;
  const intervalId = setInterval(async () => {

    const events = [buildEvent(Number(antennaId), 7.5), ...helperAntennas.map((x) => buildEvent(x.antenna_id, 5))]
      .map((event) => ({ value: JSON.stringify(event) }));

    count += 1;
    try {
      producer.send({
        topic: antennasEventsTopicName,
        messages: events,
      });
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
      }
    }
  }, 250);
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
      console.log(errParsing);
    }
  });
};

const onError = (err) => {
  console.log("Ouch. Some error: ", err);
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