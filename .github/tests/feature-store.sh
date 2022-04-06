#!/usr/bin/env bash

# Tests the real-time feature store.

set -euxo pipefail

# Turn on the demo and give it a few seconds to spin up.
docker-compose up -d
sleep 15

# Ensure that we can successfully query the server for an account
curl localhost:8100/score/1 > /dev/null 
docker-compose logs server
