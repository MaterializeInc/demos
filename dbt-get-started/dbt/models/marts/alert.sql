{{ config(materialized='materializedview') }}

SELECT
       'avg_bid_below_200' as alert_condition,
       jsonb_build_object('symbol', symbol) as alert_labels,
       avg_bid as alert_value
FROM {{ ref('avg_bid') }}
WHERE avg_bid < 200
UNION
SELECT
        'avg_bid_above_250' as alert_condition,
        jsonb_build_object('symbol', symbol) as alert_labels,
        avg_bid as alert_value
FROM {{ ref('avg_bid') }}
WHERE avg_bid >= 250
