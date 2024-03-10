FROM mcr.microsoft.com/mssql/server:2019-latest

# Copy your SQL script into the image
COPY ./inventory.sql /

# Create an entrypoint script
COPY ./entrypoint.sh /

# Set the entrypoint script to run on container startup
ENTRYPOINT ["/entrypoint.sh"]
