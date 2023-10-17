use postgres::{Client, NoTls, Error};

/// Create a client using localhost
pub(crate) fn create_client() -> Result<Client, Error> {
    let config = "postgres://materialize@localhost:6875/materialize";
    Client::connect(config, NoTls)
}

// ----------------------------------
// Alternative way to create a client
// ----------------------------------
// pub(crate) fn create_client_with_config() -> Result<Client, Error> {
//     Config::new()
//         .host("localhost")
//         .port(6875)
//         .dbname("materialize")
//         .user("materialize")
//         .connect(NoTls)
// }