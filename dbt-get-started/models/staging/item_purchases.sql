{{ config(materialized='view', indexes=[{'columns': ['item_id']}]) }}

SELECT
    item_id,
    SUM(quantity) AS items_sold,
    SUM(purchase_price) AS revenue,
    COUNT(id) AS orders,
    MAX(created_at::timestamp) AS latest_order
FROM {{ ref('purchases') }}
GROUP BY item_id
