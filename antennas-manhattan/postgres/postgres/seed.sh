#!/bin/bash

echo "Creating tables, publications and roles"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /scripts/seed.sql