CREATE TABLE IF NOT EXISTS demo.reviews (
    id SERIAL PRIMARY KEY,
    user_id INT COMMENT 'faker.datatype.number({min: 1, max: 1000})',
    rating INT COMMENT 'faker.datatype.number({min: 1, max: 10})',
    comment TEXT COMMENT 'faker.lorem.paragraph()',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
