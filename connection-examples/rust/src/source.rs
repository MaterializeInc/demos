use postgres::{Error};

use crate::connection::create_client;

/// Creates a PUBNUB source
pub(crate) fn create_source() -> Result<u64, Error> {
    let mut client = create_client().expect("Error creating client.");

    client.execute("
        CREATE SOURCE IF NOT EXISTS market_orders_raw FROM PUBNUB
        SUBSCRIBE KEY 'sub-c-4377ab04-f100-11e3-bffd-02ee2ddab7fe'
        CHANNEL 'pubnub-market-orders'
    ", &[])
}