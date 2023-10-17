use postgres::{Error};

use crate::connection::create_client;

/// Creates a materialized view over the PUBNUB source
pub(crate) fn create_materialized_view() -> Result<u64, Error> {
    let mut client = create_client().expect("Error creating client.");

    client.execute("
        CREATE MATERIALIZED VIEW IF NOT EXISTS market_orders AS
        SELECT
            val->>'symbol' AS symbol,
            (val->'bid_price')::float AS bid_price
        FROM (SELECT text::jsonb AS val FROM market_orders_raw)
    ", &[])
}