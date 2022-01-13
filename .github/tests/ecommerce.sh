#!/usr/bin/env bash

# Tests the ecommerce demo.

set -euxo pipefail

# Turn on the demo and give it a few seconds to spin up.
docker-compose up -d
sleep 15

# Ensure that the items table is imported with the correct number of items.
docker-compose run -T cli -c "
CREATE MATERIALIZED SOURCE items
FROM KAFKA BROKER 'kafka:9092' TOPIC 'mysql.shop.items'
FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY 'http://schema-registry:8081'
ENVELOPE DEBEZIUM;
"
# The source isn't imported immediately, so sleep for a bit. Gross, but it
# works.
sleep 10
items_count=$(docker-compose run -T cli -Atc 'SELECT count(*) FROM items')
[[ "$items_count" -eq 1000 ]]
