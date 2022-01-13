#!/usr/bin/env bash

# Tests the wikirecent demo.

set -euxo pipefail

# Install websocat, a tool for testing WebSockets from the command line.
curl -fsSL https://github.com/vi/websocat/releases/download/v1.9.0/websocat_linux64 > /usr/local/bin/websocat
chmod +x /usr/local/bin/websocat

# Turn on the demo and give it a few seconds to spin up.
docker-compose up -d
sleep 5

# Ensure the webserver is functional.
curl -fI localhost:8875

# Ensure we can receive at least one message from one of the WebSocket APIs.
websocat -1U ws://localhost:8875/api/stream/counter

# NOTE(benesch): we don't verify that the JavaScript is functional. That's a
# bit too much work.
