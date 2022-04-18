#!/usr/bin/env bash

# Tests the billing demo.

set -euxo pipefail

# Turn on the demo and give it a few seconds to spin up.
docker-compose up -d
sleep 5

# Ensure that one of the views is basically functional.
record_count=$(docker-compose run -T cli -Atc 'SELECT count(*) FROM billing_raw_data')
[[ "$record_count" -eq 1000 ]]
