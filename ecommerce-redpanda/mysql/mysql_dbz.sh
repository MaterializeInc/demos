#!/usr/bin/env bash

echo "Waiting for Kafka Connect to start listening on localhost:8083 ⏳"
        while $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8083) -ne 200 ; do
          echo -e "$(date)" " Kafka Connect listener HTTP state: " curl -s -o /dev/null -w '%{http_code}' http://localhost:8083/connectors " (waiting for 200)"
          sleep 5
        done
        echo "Waiting for Schema Registry to start listening on schema-registry:8081 ⏳"
        while $(curl -s -o /dev/null -w '%{http_code}' http://schema-registry:8081) -eq 000 ; do
          echo -e "$(date)" " Schema Registry listener HTTP state: " curl -s -o /dev/null -w '%{http_code}' http://schema-registry:8081 " (waiting for != 000)"
          sleep 5
        done

echo "Creating connector"

curl -s -X PUT -H  "Content-Type:application/json" http://localhost:8083/connectors/source-datagen-item_details_01/config \
    -d '{
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": 3306,
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.name": "dbserver1",
    "database.server.id": "223344",
    "database.history.kafka.bootstrap.servers": "redpanda:9092",
    "database.history.kafka.topic": "mysql-history",
    "database.include.list": "shop",
    "time.precision.mode": "connect",
    "include.schema.changes": false
  }'

  sleep infinity
