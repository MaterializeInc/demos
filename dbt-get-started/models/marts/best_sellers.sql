{{ config(materialized='view', indexes=[{'columns': ['category']}]) }}

SELECT
    I.NAME,
    I.CATEGORY,
    COUNT(*) AS PURCHASES
FROM {{ ref('purchases') }} AS P
INNER JOIN {{ ref('items') }} AS I ON (P.ITEM_ID = I.ID)
GROUP BY I.NAME, I.CATEGORY
ORDER BY PURCHASES DESC
LIMIT 10
