{{ config(materialized='view', indexes=[{'columns': ['auction_id']}]) }}

SELECT auction_id,
       avg(amount) AS amount
FROM {{ ref('on_time_bids') }}
GROUP BY auction_id