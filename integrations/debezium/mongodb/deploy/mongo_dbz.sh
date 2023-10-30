#!/bin/bash

#Initialize Debezium (Kafka Connect Component)

while true; do
    echo "Waiting for Debezium to be ready"
    sleep 0.1
    curl -s -o /dev/null -w "%{http_code}" http://debezium:8083/connectors/ | grep 200
    if [ $? -eq 0 ]; then
        echo "Debezium is ready"
        break
    fi
done

# Read the JSON file and register the connector and change the ${EXTERNAL_IP} with the external IP environment variable
sed -i "s/EXTERNAL_IP/${EXTERNAL_IP}/g" /deploy/register-mongodb.json

curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://debezium:8083/connectors/ -d @/deploy/register-mongodb.json

if [ $? -eq 0 ]; then
    echo "Debezium connector registered"
else
    echo "Debezium connector registration failed"
    exit 1
fi
