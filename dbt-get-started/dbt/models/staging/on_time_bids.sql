{{ config(materialized='view') }}

SELECT bids.id AS bid_id,
       auctions.id   AS auction_id,
       auctions.seller AS seller_id,
       bids.buyer AS buyer_id,
       auctions.item,
       bids.bid_time,
       auctions.end_time,
       bids.amount
FROM {{ source('auction_house','bids')}}
JOIN {{ source('auction_house','auctions')}} ON bids.auction_id = auctions.id
WHERE bids.bid_time < auctions.end_time
