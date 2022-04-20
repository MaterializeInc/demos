-- Antennas table will contain the identifier and geojson for each antenna.
CREATE TABLE antennas (
    antenna_id INT GENERATED ALWAYS AS IDENTITY,
    geojson JSON NOT NULL
);

-- Antennas performance table will contain every performance update available
CREATE TABLE antennas_performance (
    antenna_id INT,
    clients_connected INT NOT NULL,
    performance INT NOT NULL,
    updated_at timestamp NOT NULL
);

-- Enable REPLICA for both tables
ALTER TABLE antennas REPLICA IDENTITY FULL;
ALTER TABLE antennas_performance REPLICA IDENTITY FULL;

-- Create publication on the created tables 
CREATE PUBLICATION antennas_publication_source FOR TABLE antennas, antennas_performance;

-- Create user and role to be used by Materialize
CREATE ROLE materialize REPLICATION LOGIN PASSWORD 'materialize';
GRANT SELECT ON antennas, antennas_performance TO materialize;