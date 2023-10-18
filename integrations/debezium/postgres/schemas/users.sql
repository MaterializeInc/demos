CREATE TABLE IF NOT EXISTS demo.users (
    "id" INT COMMENT 'iteration.index',
    "role_id" INT COMMENT 'faker.datatype.number({min: 1, max: 4})',
    "first_name" varchar COMMENT 'faker.internet.userName()',
    "last_name" VARCHAR COMMENT 'faker.internet.userName()',
    "email" VARCHAR COMMENT 'faker.internet.email()'
);
