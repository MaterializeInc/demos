use postgres::{Error};

use crate::connection::create_client;

/// Insert data into the table
pub(crate) fn insert() -> Result<u64, Error> {
    let mut client = create_client().expect("Error creating client.");

    let code = "GH";
    let name = "Ghana";

    client.execute("INSERT INTO countries(code, name) VALUES($1, $2)", &[&code, &name])
}