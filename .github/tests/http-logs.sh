#!/usr/bin/env bash

# Tests the http-logs demo.

set -euxo pipefail

# Turn on the demo and give it a few seconds to spin up.
docker-compose up -d
sleep 5

# Ensure that one of the views is basically functional.
product_count=$(docker-compose run -T cli -Atc 'SELECT count(*) FROM top_products')
[[ "$product_count" -eq 40 ]]
