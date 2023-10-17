use crate::connection::create_client;

/// Run a query over the table.
pub(crate) fn run_query () {
    let mut client = create_client().expect("Error creating client.");

    let results = client.query("SELECT code, name FROM countries;", &[]).expect("Error running query.");

    for row in results {
        println!("{:} - {:}", row.get::<usize, String>(0), row.get::<usize, String>(1));
    };
}
