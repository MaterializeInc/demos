#!/usr/bin/env bash

# Tests the chbench demo.

set -euxo pipefail

# Install jq to parse JSON
curl -fsSL http://stedolan.github.io/jq/download/linux64/jq > /usr/local/bin/jq
chmod +x /usr/local/bin/jq

# Turn on the demo and give it a few (good) seconds to spin up.
docker-compose up -d
sleep 20

# Ensure that the Debezium connector was deployed successfully
dbz_connector=$(curl -H "Accept:application/json" localhost:8083/connectors/ | jq -r '.[]')

[[ "$dbz_connector" == "register-mysql" ]]

# NOTE(morsapaes): for now, let's trust that if the connector is functional
# the demo soldiers on. This is to avoid spending insane amounts of CI time
# waiting for the whole setup to be responsive (esp. since we'll be swapping
# this one for the ecommerce demo in the docs, at some point). For details,
# check thread in https://github.com/MaterializeInc/demos/pull/22/.
