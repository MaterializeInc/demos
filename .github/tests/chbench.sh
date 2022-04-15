#!/usr/bin/env bash

# Tests the chbench demo.

set -euxo pipefail

# Turn on the demo and give it a few seconds to spin up.
docker-compose up -d
sleep 2m

# Ensure that the regions table is imported with the correct number of regions.
docker-compose run -T cli -c "
CREATE MATERIALIZED VIEW r AS
SELECT * FROM debezium_tpcch_region;
"

regions_count=$(docker-compose run -T cli -Atc 'SELECT count(*) FROM r')
[[ "$regions_count" -eq 5 ]]
