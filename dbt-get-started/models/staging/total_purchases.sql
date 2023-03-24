{{ config(materialized='materializedview') }}

SELECT SUM(purchase_price * quantity) AS total_purchases
FROM {{ ref('purchases') }}
