#!/usr/bin/env bash

# Tests the dbt-get-started demo.

set -euxo pipefail

# Turn on the demo and give it a few seconds to spin up.
docker-compose up -d
sleep 5

# Run the dbt models
docker-compose exec -T dbt dbt run
sleep 5

# Check that there's data making it's way to the avg_bid materialized view
record_count=$(docker-compose run -T cli -Atc 'SELECT COUNT(*) FROM avg_bid')
[[ "$record_count" -gt 0 ]]
