#!/usr/bin/env bash

# Tests the antennas Kafka demo.

set -euxo pipefail

# Install jq to parse JSON
curl -fsSL http://stedolan.github.io/jq/download/linux64/jq > /usr/local/bin/jq
chmod +x /usr/local/bin/jq

# Turn on the demo and give it a few (good) seconds to spin up.
docker-compose up -d
sleep 70

# Run a SQL using the sql endpoint
count="$(curl -X POST 'localhost:6875/sql' -d 'sql=SELECT COUNT(1) FROM last_half_minute_performance_per_antenna' | jq -r '.results[0].rows[0][0]')"

if [ "$count" -le 0 ];
then
    exit 5;
fi
