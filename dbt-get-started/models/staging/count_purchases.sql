{{ config(materialized='materializedview') }}

SELECT COUNT(*) AS count_purchases
FROM {{ ref('purchases') }}
