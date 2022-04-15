{{ config(materialized='materializedview') }}

SELECT symbol,
       AVG(bid_price) AS avg
FROM {{ ref('market_orders') }}
GROUP BY symbol
