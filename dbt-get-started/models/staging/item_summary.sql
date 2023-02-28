{{ config(materialized='materializedview') }}

SELECT
    ip.item_id AS item_id,
    i.name AS item_name,
    i.category AS item_category,
    SUM(ip.items_sold) AS items_sold,
    SUM(ip.revenue) AS revenue,
    SUM(ip.orders) AS orders,
    ip.latest_order AS latest_order
FROM {{ ref('item_purchases') }} ip
JOIN {{ ref('items') }} i ON ip.item_id = i.id
GROUP BY item_id, item_name, item_category, latest_order