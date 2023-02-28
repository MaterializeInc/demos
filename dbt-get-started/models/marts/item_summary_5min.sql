{{ config(materialized='view') }}

SELECT
    item_id,
    item_name,
    item_category,
    items_sold,
    revenue,
    orders,
    latest_order
FROM {{ ref('item_summary') }}
WHERE
    mz_now() >= latest_order
    AND mz_now() < latest_order + INTERVAL '5' MINUTE
