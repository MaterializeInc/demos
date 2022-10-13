{{ config(materialized='view') }}

SELECT grp.auction_id, bid_id, buyer_id, seller_id, item, amount, bid_time, end_time 
FROM
    (SELECT DISTINCT auction_id FROM {{ ref('on_time_bids') }}) grp,
LATERAL (
    SELECT * FROM {{ ref('on_time_bids') }}
    WHERE auction_id = grp.auction_id
    ORDER BY amount DESC LIMIT 1
)