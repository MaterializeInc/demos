import {Pool} from 'pg';

/**
 * Materialize Client
 */
 const mzHost = process.env.MZ_HOST || 'materialized';
 const mzPort = Number(process.env.MZ_PORT) || 6875;
 const mzUser = process.env.MZ_USER || 'materialize';
 const mzPassword = process.env.MZ_PASSWORD || 'materialize';
 const mzDatabase = process.env.MZ_DATABASE || 'materialize';

/**
 * Create Materialize sources and materialized views
 * Before creating the views it will check if they aren't created already.
 */
async function setUpMaterialize() {
  const pool = await new Pool({
    host: mzHost,
    port: mzPort,
    user: mzUser,
    password: mzPassword,
    database: mzDatabase,
    ssl: true,
  });
  const poolClient = await pool.connect();

  await poolClient.query(`
    CREATE SECRET  IF NOT EXISTS postgres_password AS 'materialize';
  `);

  await poolClient.query(`
    CREATE CONNECTION pg_connection TO POSTGRES (
      HOST '${process.env.POSTGRES_HOST || 'postgres'}'}',
      PORT 5432,
      USER 'materialize',
      PASSWORD SECRET pgpass,
      DATABASE 'postgres'
    );
  `);

  await poolClient.query(`
    CREATE SOURCE IF NOT EXISTS antennas_publication_source
      FROM POSTGRES CONNECTION pg_connection (PUBLICATION 'antennas_publication_source')
      FOR ALL TABLES
      WITH (SIZE = '3xsmall');
  `);

  const {rowCount} = await pool.query(
    "SELECT * FROM mz_views WHERE name='antennas' OR name='antennas_performance';"
  );

  if (!rowCount) {
    await poolClient.query(`
    CREATE VIEWS FROM SOURCE antennas_publication_source;
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

const {AUTOSETUP} = process.env;

/**
 * If AUTOSETUP = true then run automatically the source creation, etc..
 */
if (AUTOSETUP) {
  setUpMaterialize()
    .then(() => {
      console.log('Generating data.');
      dataGenerator();
    })
    .catch((err) => {
      console.error(err);
    });
} else {
  console.log('Generating data.');
  dataGenerator();
}
