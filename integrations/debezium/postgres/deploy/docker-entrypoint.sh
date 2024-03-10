#!/bin/bash

set -euo pipefail

cd /deploy

bash psql_dbz.sh
