{{ config(materialized='source', indexes=[{'columns': ['id']}]) }}

CREATE SOURCE {{ this }}
FROM KAFKA CONNECTION public.kafka_connection (
    TOPIC 'mysql.shop.users'
)
FORMAT AVRO
USING CONFLUENT SCHEMA REGISTRY CONNECTION public.csr_connection
ENVELOPE DEBEZIUM
WITH (SIZE = '3xsmall')
