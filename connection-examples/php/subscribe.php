<?php
// Include the Postgres connection details
require 'connection.php';
require 'state.php';

// Begin a transaction
$connection->beginTransaction();
// Declare a cursor
$statement = $connection->prepare('DECLARE c CURSOR FOR SUBSCRIBE (SELECT sum FROM counter_sum) WITH (PROGRESS);');
// Execute the statement
$statement->execute();

// Create a new State object
$state = new State(true);

// Buffer updates
$buffer = array();

/* Fetch all of the remaining rows in the result set */
while (true) {
    $subscribe = $connection->prepare('FETCH ALL c');
    $subscribe->execute();
    $result = $subscribe->fetchAll(PDO::FETCH_ASSOC);

    // Iterate over the results using a foreach loop
    foreach ($result as $row) {
        // Access the values of each column in the row using the column name
        $ts = $row['mz_timestamp'];
        $progressed = $row['mz_progressed'];
        $diff = $row['mz_diff'];
        $sum = $row['sum'];

        if ($progressed == 1) {
            $state->update($buffer, $ts);
            $buffer = array();
            print_r($state->get_state());
        } else {
            array_push($buffer, new Update(
                array('sum' => $sum),
                $diff
            ));
        }
    }
}