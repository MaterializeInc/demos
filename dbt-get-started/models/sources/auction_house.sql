{{ config(materialized='source') }}

CREATE SOURCE {{ this }}
FROM LOAD GENERATOR AUCTION (TICK INTERVAL '50ms')
FOR TABLES (auctions, bids)
WITH (SIZE = '3xsmall')
