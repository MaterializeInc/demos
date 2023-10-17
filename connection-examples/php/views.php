<?php
// Include the Postgres connection details
require 'connection.php';

$sql = "CREATE MATERIALIZED VIEW IF NOT EXISTS counter_sum AS
        SELECT sum(counter)
        FROM counter;";

$statement = $connection->prepare($sql);
$statement->execute();

$views = "SHOW VIEWS";
$statement = $connection->query($views);
$result = $statement->fetchAll(PDO::FETCH_ASSOC);
var_dump($result);