<?php
// Include the Postgres connection details
require 'connection.php';

$sql = "CREATE SOURCE IF NOT EXISTS counter
        FROM LOAD GENERATOR COUNTER
        (TICK INTERVAL '500ms')
        WITH (SIZE = '3xsmall');";

$statement = $connection->prepare($sql);
$statement->execute();

$sources = "SHOW SOURCES";
$statement = $connection->query($sources);
$result = $statement->fetchAll(PDO::FETCH_ASSOC);
var_dump($result);