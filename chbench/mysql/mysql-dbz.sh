#!/usr/bin/env bash

echo "Deploying Debezium MySQL connector"

curl -s -X PUT -H  "Content-Type:application/json" http://debezium:8083/connectors/register-mysql/config \
    -d '{
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": 3306,
    "database.user": "debezium",
    "database.password": "debezium",
    "database.server.name": "debezium",
    "database.server.id": "223344",
    "database.allowPublicKeyRetrieval": true,
    "database.history.kafka.bootstrap.servers": "kafka:9092",
    "database.history.kafka.topic": "mysql-history",
    "database.include.list": "tpcch",
    "time.precision.mode": "connect"
 }'
