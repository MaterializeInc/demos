{{ config(materialized='source') }}

CREATE SOURCE {{ this }}
FROM KAFKA CONNECTION {{ target.schema }}.kafka_connection (
    TOPIC 'mysql.shop.purchases'
)
FORMAT AVRO
USING CONFLUENT SCHEMA REGISTRY CONNECTION {{ target.schema }}.csr_connection
ENVELOPE DEBEZIUM
WITH (SIZE = '3xsmall')
