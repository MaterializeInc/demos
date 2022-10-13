{{ config(materialized='materializedview') }}

SELECT *
FROM {{ ref('highest_bid_per_auction') }}
WHERE end_time < mz_now()