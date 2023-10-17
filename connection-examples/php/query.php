<?php
// Include the Postgres connection details
require 'connection.php';

$sql = 'SELECT * FROM my_view';
$statement = $connection->query($sql);

while (($row = $statement->fetch(PDO::FETCH_ASSOC)) !== false) {
    var_dump($row);
}