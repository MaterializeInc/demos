-- This file contains the statements run against Materialize
-- at start up to power a real time feature store.

-- Create a new materialized source from the a postgres
-- replication bin log. This will continuously update
-- as the PostgreSQL tables are modified upstream. 
CREATE MATERIALIZED SOURCE IF NOT EXISTS pg_source FROM POSTGRES
    CONNECTION 'host=postgres user=postgres dbname=default'
    PUBLICATION 'mz_source'
    WITH (timestamp_frequency_ms = 100);

-- From that source, create views for all tables being replciated.
-- This will include the account_information table which correlates
-- accounts to account owners.
CREATE VIEWS FROM SOURCE pg_source;

-- Create a new source to read fraud confirmation reports
-- from the confirmed_fraud topic on RedPanda.
CREATE SOURCE IF NOT EXISTS json_confirmed_fraud
    FROM KAFKA BROKER 'redpanda:9092' TOPIC 'confirmed_fraud'
    FORMAT BYTES;

-- Fraud confirmations are encoded as JSON and consumed as raw bytes.
-- We can create a view to decode this into a well typed format, making
-- it easier to use. 
CREATE VIEW IF NOT EXISTS confirmed_fraud AS
  SELECT
    CAST(data->>'account_id' AS BIGINT) AS account_id,
    CAST(data->>'transaction_ts' AS TIMESTAMP) AS transaction_ts
  FROM (SELECT CONVERT_FROM(data, 'utf8')::jsonb AS data FROM json_confirmed_fraud);

-- Keep track of how many fraudulent transactions 
-- an account saw over a 30 second period. The idea being
-- the longer since we've seen fraud the less concerned we
-- are about an account. In a real world application, this may
-- be a longer interval, such as 30 days. 30 seconds was only 
-- chosen to make it easier to see what Materialize is doing
-- while running through the demonstration.
CREATE MATERIALIZED VIEW IF NOT EXISTS confirmed_fraudulent_transactions AS
SELECT account_owner, confirmed_fraud.account_id, COUNT(*) as fraud_count
FROM confirmed_fraud
INNER JOIN account_information ON confirmed_fraud.account_id = account_information.account_id
WHERE EXTRACT(EPOCH FROM (transaction_ts + INTERVAL '30 seconds'))::bigint * 1000 > mz_logical_timestamp()
GROUP BY account_information.account_owner, confirmed_fraud.account_id;

-- For each account, keep track of how many fraudulent
-- transactions the account owner has seen for the last 30 seconds
CREATE MATERIALIZED VIEW IF NOT EXISTS fraud_count_feature AS
SELECT left.account_id, SUM(right.fraud_count) AS fraud_count
FROM confirmed_fraudulent_transactions AS left 
INNER JOIN confirmed_fraudulent_transactions AS right ON left.account_owner = right.account_owner
GROUP BY left.account_id;

