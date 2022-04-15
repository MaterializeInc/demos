{{ config(materialized='source') }}

{% set source_name %}
    {{ mz_generate_name('market_orders_raw') }}
{% endset %}

CREATE SOURCE {{ source_name }}
FROM PUBNUB
SUBSCRIBE KEY 'sub-c-4377ab04-f100-11e3-bffd-02ee2ddab7fe'
CHANNEL 'pubnub-market-orders'
