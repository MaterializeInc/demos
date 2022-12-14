#!/usr/bin/env bash

echo "Deploying Debezium MySQL connector"

curl -s -X PUT -H  "Content-Type:application/json" http://debezium:8083/connectors/register-mysql/config \
    -d '{
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": 3306,
    "database.user": "debezium",
    "database.password": "'"${MYSQL_PASSWORD}"'",
    "database.server.name": "mysql",
    "database.server.id": "223344",
    "database.allowPublicKeyRetrieval": true,
    "database.history.kafka.bootstrap.servers":"'"${CONFLUENT_BROKER_HOST}"'",
    "database.history.consumer.security.protocol": "SASL_SSL",
    "database.history.consumer.sasl.mechanism": "PLAIN",
    "database.history.consumer.sasl.jaas.config": "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"'${CONFLUENT_API_KEY}'\" password=\"'${CONFLUENT_API_SECRET}'\";",
    "database.history.producer.security.protocol": "SASL_SSL",
    "database.history.producer.sasl.mechanism": "PLAIN",
    "database.history.producer.sasl.jaas.config": "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"'${CONFLUENT_API_KEY}'\" password=\"'${CONFLUENT_API_SECRET}'\";",
    "database.history.kafka.topic": "mysql-history",
    "database.include.list": "shop",
    "time.precision.mode": "connect",
    "include.schema.changes": false
 }'
