#!/bin/bash

# Start SQL Server
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to start up
echo "Waiting for SQL Server to start up..."
sleep 25

# Run the SQL script
echo "Running the SQL script..."
/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -i /inventory.sql

# Keep the container running
tail -f /dev/null
