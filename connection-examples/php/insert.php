<?php
// Include the Postgres connection details
require 'connection.php';

$sql = 'INSERT INTO countries (name, code) VALUES (?, ?)';
$statement = $connection->prepare($sql);
$statement->execute(['United States', 'US']);
$statement->execute(['Canada', 'CA']);
$statement->execute(['Mexico', 'MX']);
$statement->execute(['Germany', 'DE']);

$countStmt = "SELECT COUNT(*) FROM countries";
$count = $connection->query($countStmt);
while (($row = $count->fetch(PDO::FETCH_ASSOC)) !== false) {
    var_dump($row);
}