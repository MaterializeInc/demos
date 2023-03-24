{{ config(materialized='materializedview') }}

SELECT COUNT(*) AS total_users
FROM {{ ref('users') }}
