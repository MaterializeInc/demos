import {Pool} from 'pg';

/**
 * Create Materialize sources and materialized views
 * Before creating the views it will check if they aren't created already.
 */
async function setUpMaterialize() {
  const pool = await new Pool({
    host: 'materialized',
    port: 6875,
    user: 'materialize',
    password: 'materialize',
    database: 'materialize',
  });
  const poolClient = await pool.connect();

  await poolClient.query(`
    CREATE MATERIALIZED SOURCE IF NOT EXISTS antennas_publication_source
    FROM POSTGRES
    CONNECTION 'host=postgres port=5432 user=materialize password=materialize dbname=postgres'
    PUBLICATION 'antennas_publication_source';
  `);

  const {rowCount} = await pool.query(
    "SELECT * FROM mz_views WHERE name='antennas' OR name='antennas_performance';"
  );

  if (!rowCount) {
    await poolClient.query(`
    CREATE MATERIALIZED VIEWS FROM SOURCE antennas_publication_source;
  `);

    await poolClient.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS last_half_minute_performance_per_antenna AS
    SELECT A.antenna_id, A.geojson, AVG(AP.performance) as performance
    FROM antennas A JOIN antennas_performance AP ON (A.antenna_id = AP.antenna_id)
    WHERE ((CAST(EXTRACT( epoch from AP.updated_at) AS NUMERIC) * 1000) + 30000) > mz_logical_timestamp()
    GROUP BY A.antenna_id, A.geojson;
  `);
  }

  poolClient.release();
}

/**
 * Build a custom Postgres insert with a random performance and clients connected
 * @param antennaId Antenna Identifier
 * @returns
 */
function buildQuery(antennaId: number) {
  return `
    INSERT INTO antennas_performance (antenna_id, clients_connected, performance, updated_at) VALUES (
      ${antennaId},
      ${Math.ceil(Math.random() * 100)},
      ${Math.random() * 10},
      now()
    );
  `;
}

/**
 * Generate data to Postgres indefinitely
 */
async function dataGenerator() {
  const pool = await new Pool({
    host: 'postgres',
    user: 'postgres',
    password: 'pg_password',
  });

  const poolClient = await pool.connect();
  setInterval(() => {
    const query = [1, 2, 3, 4, 5, 6, 7].map((antennaId) => buildQuery(antennaId)).join('\n');

    poolClient.query(query);
  }, 1000);
}

const {PLAY} = process.env;

/**
 * If PLAY = true then let the user play with the source creation and etc..
 */
if (PLAY) {
  console.log('Generating data.');
  dataGenerator();
} else {
  setUpMaterialize()
    .then(() => {
      console.log('Generating data.');
      dataGenerator();
    })
    .catch((err) => {
      console.error(err);
    });
}
