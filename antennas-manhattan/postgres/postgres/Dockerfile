FROM postgres

# Automatically runned by Postgres
ADD ./create.sh /docker-entrypoint-initdb.d/
ADD ./seed.sh /docker-entrypoint-initdb.d/

# Create Tables, Publications and Roles
ADD ./create.sql /scripts/
ADD ./seed.sql /scripts/