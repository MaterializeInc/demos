{{ config(materialized='materializedview') }}

SELECT symbol,
       AVG(bid_price) AS avg_bid
FROM {{ ref('stg_market_orders') }}
GROUP BY symbol
