# Manhattan Antennas Performance

https://user-images.githubusercontent.com/11491779/166932582-e5a9fd47-e397-4419-b221-e8f38c6f06f5.mp4

Before trying this out you will need the following:

- [Materialize Cloud account](https://materialize.com/register/)
- A Kafka cluster, if you don't have one you can use [Upstash](https://upstash.com/) to get a free cluster

If you want to try it right now, clone the project and run:

```
cp .env.example .env
```

Then edit the `.env` file and add your Materialize Cloud credentials and Upstash credentials.

Then run:

```
docker-compose up
```

After a successful build:

```
# Check in your browser
localhost:3000
```

---

## Let’s begin.

An infrastructure working safe and healthy is critical. We, developers, know this very well. In other businesses, like in software, there are vital infrastructures, such as mobile antennas (4G, 5G) in telecommunications companies. <br/>
If there is some issue, it needs to be detected and fixed quickly; otherwise, customers will complain, or even worse, move to the competition (churn rate is serious business).

Antennas manufacturers share [key performance indicators](https://www.ericsson.com/en/reports-and-papers/white-papers/performance-verification-for-5g-nr-deployments) with their telecommunications companies clients. Let's call all these indicators "performance". Rather than setting a 5G antenna manually to provide indicators, let randomness generate this value, providing even more excitement and entertainment to the case than in real life.

Each antenna has a fixed range where is capable of serving clients. In a map, a green, yellow, or red (healthy, semi-healthy, and unhealthy) circle will denote this area.

If the last-half-minute average performance is greater than 5, the antenna is healthy. <br/>
If it is greater than 4.75 but less than 5, it is semi-healthy. <br/>
If it is less than 4.75, the antenna is unhealthy. <br/>

In case an antenna is unhealthy beyond a period of seconds, a whole set of helper antennas will be deployed to improve the performance in the area. After a few seconds of improvement they will be deactivated.

All this information needs to be processed, analyzed, and served, and that's where Materialize will do the work for us efficiently.

## Detailes steps

There are different ways to achieve a result like this one using Materialize, but for this case, the following strategy fulfill our needs:

1.  Kafka, where all the base data resides.
2.  Materialize to process and serve the antenna's performance.
3.  Helper process to generate the antennas random data and initialize Materialize
4.  Node.js GraphQL API connects to Materialize using [SUBSCRIBE](https://materialize.com/docs/sql/subscribe/#conceptual-framework).
5.  React front-end displaying the information using GraphQL subscriptions.
6.  Microservice deploying and pushing helper antennas when performance is low

_Our source, Kafka, could be alternatively replaced with any other [Materialize source](https://materialize.com/docs/sql/create-source/#conceptual-framework)_

<!-- ![Architecture](https://user-images.githubusercontent.com/11491779/155920578-7984244a-6382-4628-a87b-00e1f6ad1acd.png) -->

<br/>

1. To begin with, you will need a Kafka cluster. We will use [Upstash](https://upstash.com/) for this demo. If you don't have an account, you can [sign up](https://upstash.com/signup) for free.

<br/>

2-3. Once Kafka is up and running, Materialize will be ready to consume it. If you are automating a deployment, a [helper process](https://github.com/joacoc/antennas-manhattan/blob/Kafka/helper/src/app.ts) can do the job to set up sources and views in Materialize and also feed Kafka indefinitely with data.<br/><br/>

The script to build Kafka topics is the next one:

```javascript
async function setUpKafka() {
  console.log('Setting up Kafka...');
  const topics = await kafka.admin().listTopics();
  await producer.connect();

  if (!topics.includes(antennasEventsTopicName)) {
    await kafka.admin().createTopics({
      topics: [
        {
          topic: antennasEventsTopicName,
        },
        {
          topic: antennasTopic,
        },
      ],
    });

    producer.send({
      topic: antennasTopic,
      messages: mainAntennas.map((antenna) => ({value: JSON.stringify(antenna)})),
    });

    producer.send({
      topic: antennasTopic,
      messages: helperAntennas.map((antenna) => ({value: JSON.stringify(antenna)})),
    });
  }
}
```

The SQL script to build Materialize schema is the next one:

```sql
  -- All these queries run inside the helper process.

  -- Create the secrets
    CREATE SECRET  IF NOT EXISTS up_sasl_username AS 'your_upstash_sasl_username';
    CREATE SECRET  IF NOT EXISTS up_sasl_password AS 'your_upstash_sasl_password';

  -- Create the Kafka connection
    CREATE CONNECTION IF NOT EXISTS upstash_kafka
      FOR KAFKA
      BROKER 'your_upstas_kafka_broker',
      SASL MECHANISMS = 'SCRAM-SHA-256',
      SASL USERNAME = SECRET up_sasl_username,
      SASL PASSWORD = SECRET up_sasl_password;

  -- Create the Kafka Source
    CREATE SOURCE IF NOT EXISTS antennas_performance
      FROM KAFKA CONNECTION upstash_kafka (TOPIC 'antennas_performance')
      FORMAT BYTES
      WITH (SIZE 'xsmall');


    CREATE SOURCE IF NOT EXISTS antennas
      FROM KAFKA CONNECTION upstash_kafka (TOPIC 'antennas')
      FORMAT BYTES
      WITH (SIZE 'xsmall');

  -- Parse antennas
      CREATE MATERIALIZED VIEW IF NOT EXISTS parsed_antennas AS
      SELECT
        CAST(parsed_data->'antenna_id' AS INT) as antenna_id,
        CAST(parsed_data->'geojson' AS JSONB) as geojson
      FROM (
        -- Parse data from Kafka
        SELECT
          CAST (data AS jsonb) AS parsed_data
        FROM (
          SELECT convert_from(data, 'utf8') AS data
          FROM antennas
        )
      );

  -- Parse and save only the last minute updates to save memory
      CREATE MATERIALIZED VIEW IF NOT EXISTS last_minute_antennas_performance AS
      SELECT
        CAST(parsed_data->'antenna_id' AS INT) as antenna_id,
        CAST(parsed_data->'clients_connected' AS INT) as clients_connected,
        CAST(parsed_data->'performance' AS NUMERIC) as performance,
        CAST(parsed_data->'updated_at' AS NUMERIC) as updated_at
      FROM (
        -- Parse data from Kafka
        SELECT
          CAST (data AS jsonb) AS parsed_data
        FROM (
          SELECT convert_from(data, 'utf8') AS data
          FROM antennas_performance
        )
      )
      WHERE ((CAST(parsed_data->'updated_at' AS NUMERIC)) + 60000) > mz_now();

  -- Filter last half minute updates and aggregate by anntena ID and GeoJSON to obtain the average performance in the last half minute.
      CREATE MATERIALIZED VIEW IF NOT EXISTS last_half_minute_performance_per_antenna AS
      SELECT A.antenna_id, A.geojson, AVG(performance) as performance
      FROM parsed_antennas A JOIN last_minute_antennas_performance AP ON (A.antenna_id = AP.antenna_id)
      WHERE (AP.updated_at + 30000) > mz_now()
      GROUP BY A.antenna_id, A.geojson;
```

Antennas data generation statement:

```javascript
  /* Insert data using the helper process. */
  function buildEvent(antennaId: number) {
      return {
        antenna_id: antennaId,
        clients_connected: Math.ceil(Math.random() * 100),
        performance: Math.random() * 10,
        updated_at: new Date().getTime()
      };
    }

  ...
  setInterval(() => {
    const events = [1, 2, 3, 4, 5, 6, 7]
      .map((antennaId) => buildEvent(antennaId))
      .map((event) => ({ value: JSON.stringify(event) }));

    producer.send({
      topic: antennasEventsTopicName,
      messages: events,
    });
  }, 1000);
  ...
```

4. Now, the information should be ready to consume. <br/><br/>
   The back-end works with [Graphql-ws](https://github.com/enisdenjo/graphql-ws). Multiple applications send ongoing events to the front-end with sockets or server-sent events (SSE), becoming super handy to use with `subscribe`. Rather than constantly sending queries back-and-forth, we can run a single `subscribe last_half_minute_performance_per_antenna with (snapshot)` and send the results more efficiently. <br/><br/>
   The back-end will use a modified client to run the `SUBSCRIBE`. It implements internally [Node.js stream interfaces](https://nodejs.org/api/stream.html) to handle [backpressure](https://github.com/joacoc/antennas-manhattan/blob/Kafka/backend/src/MaterializeClient/TailStream/index.ts), create one second batches and group all the changes in one map [(summary)](https://github.com/joacoc/antennas-manhattan/blob/Kafka/backend/src/MaterializeClient/TransformStream/index.ts).

5. The front-end doesn't require going deep since it will consist of only one component. Apollo GraphQL subscribes to our back-end, and the antennas information gets displayed in a list and a visual map. The frequency at which the information updates is every one second.

6. The microservice behaves similar to the front-end. Rather than connecting directly to Materialize, it will subscribe to the GraphQL API and subscribe to the antenna's performance. Once a low performance has been detected multiple times a set of helper antennas will be deployed.
