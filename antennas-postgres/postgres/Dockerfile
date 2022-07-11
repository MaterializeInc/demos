FROM postgres:14.2-alpine

# Automatically run by Postgres
COPY ./create.sh /docker-entrypoint-initdb.d/
COPY ./seed.sh /docker-entrypoint-initdb.d/

# Create Tables, Publications and Roles
COPY ./create.sql /scripts/
COPY ./seed.sql /scripts/
