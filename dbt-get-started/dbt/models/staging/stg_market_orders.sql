{{ config(materialized='view') }}

SELECT
    ((text::jsonb)->>'bid_price')::float AS bid_price,
    (text::jsonb)->>'order_quantity' AS order_quantity,
    (text::jsonb)->>'symbol' AS symbol,
    (text::jsonb)->>'trade_type' AS trade_type,
    to_timestamp(((text::jsonb)->'timestamp')::bigint) AS ts
FROM {{ ref('market_orders_raw') }}
