CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    is_vip BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(100),
    price DECIMAL(7,2),
    inventory INT,
    inventory_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchases
(
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    item_id BIGINT REFERENCES items(id),
    status INT DEFAULT 0,
    quantity INT DEFAULT 1,
    purchase_price DECIMAL(12,2),
    deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users REPLICA IDENTITY FULL;
ALTER TABLE items REPLICA IDENTITY FULL;
ALTER TABLE purchases REPLICA IDENTITY FULL;

CREATE PUBLICATION mz_source FOR TABLE users, items, purchases;