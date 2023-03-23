{{ config(materialized='source', indexes=[{'columns': ['item_id']}]) }}

CREATE SOURCE {{ this }}
FROM KAFKA CONNECTION public.kafka_connection (
    TOPIC 'mysql.shop.purchases'
)
FORMAT AVRO
USING CONFLUENT SCHEMA REGISTRY CONNECTION public.csr_connection
ENVELOPE DEBEZIUM
WITH (SIZE = '3xsmall')
