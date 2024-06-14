-- Create a schema and set the search path
CREATE SCHEMA demo;
SET search_path TO demo;

-- Set the wal_level to logical and andd replication role to the postgres user
ALTER SYSTEM SET wal_level = logical;
ALTER ROLE postgres WITH REPLICATION;

-- Create the table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO roles (name) VALUES ('admin'), ('user'), ('guest'), ('vip');

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users REPLICA IDENTITY FULL;
ALTER TABLE roles REPLICA IDENTITY FULL;
ALTER TABLE reviews REPLICA IDENTITY FULL;

CREATE PUBLICATION mz_source FOR TABLE users, roles, reviews;
