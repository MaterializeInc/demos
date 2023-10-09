use postgres::{Error};

use crate::connection::create_client;

/// Create a simple table
pub(crate) fn create_table() -> Result<u64, Error> {
    let mut client = create_client().expect("Error creating client.");

    client.execute("
        CREATE TABLE IF NOT EXISTS countries(code TEXT, name TEXT);
    ", &[])
}