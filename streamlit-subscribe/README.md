# Real-time Sensor Data Visualization with Streamlit and Materialize

This project showcases a real-time visualization of sensor data updates using Streamlit and Materialize. The application subscribes to updates from the Materialize instance and presents the average temperature readings from various sensors in a dynamic chart.

## Requirements

-   Python `3.7` or higher
-   Materialize instance
-   Streamlit
-   `psycopg`
-   `altair`
-   `pandas`

## Installation and Setup

1.  Clone this repository:

    ```bash
    git clone https://github.com/MaterializeInc/demos.git
    cd demos/streamlit-subscribe
    ```

2.  Create a virtual environment (optional but recommended):

    ```bash
    python -m venv venv
    source .venv/bin/activate
    # On Windows use `venv\Scripts\activate`
    ```

3.  Install the required packages:

    ```bash
    pip install -r requirements.txt
    ```

4.  Set the `DATABASE_URL` environment variable to the connection string of your Materialize instance:

    ```python
    export DATABASE_URL="postgres://<username>:<app_password>@<host>/materialize?sslmode=require"
    ```

## Generating Data

For this demo we will use a webhook source in Materialize to store our data in.

Via the Materialize SQL shell, create a secret, cluster, and webhook source:

```sql
-- Create a shared secret
CREATE SECRET basic_auth_secret AS 'some-secret-value';

-- Create a cluster
CREATE CLUSTER my_webhook_cluster SIZE = 'xsmall';

-- Create a webhook source with validation
CREATE SOURCE my_webhook_source IN CLUSTER my_webhook_cluster FROM WEBHOOK
    BODY FORMAT JSON
    CHECK (
        WITH (
            HEADERS,
            SECRET basic_auth_secret
        )
        "headers" -> 'authorization' = "basic_auth_secret"
    );
```

The public URL for this webhook source is `https://<host>/api/webhook/<database>/<schema>/<src_name>`:
- `<host>` is the hostname of the Materialize cluster.
- `<database>` is the name of the database where the source is created. Defaults to `materialize`.
- `<schema>` is the name of the schema where the source is created. Defaults to `public`.
- `<src_name>` is the name of the source. In this case, it's `my_webhook_source`.

### Simulating IoT Data with [`datagen`](https://github.com/MaterializeInc/datagen)

In the context of IoT, webhooks are extremely useful.

![](https://imgur.com/EnW33xM.png)

To install `datagen`, run:

```bash
npm install -g @materializeinc/datagen
```

Once you have your Materialize webhook source ready, create a `.env` file with the following variables:

```
# Webhook
export WEBHOOK_URL=https://<host>/api/webhook/<database>/<schema>/<src_name>
export WEBHOOK_SECRET=some-secret-value
```

You can use the [sensors.json](sensors.json) schema:

```bash
datagen -f webhook -s sensors.json -n 10000
```

The above command will generate 10000 JSON payloads and send them to your Materialize webhook source, the output should look like this:

```
✔  Webhook response:
  Status: 200 OK


ℹ  Sending payload to webhook...
  Webhook: https://<host>/api/webhook/<database>/<schema>/<src_name>
  Payload: {"sensor_id":82,"timestamp":"2025-12-22T20:02:08.692Z","location":{"latitude":-9,"longitude":97},"temperature":40.46}
...
```

Leave this running in the background to simulate IoT data and move on to the next step.

## Compute real-time analytics on IoT data

Let's create a view to cast the JSON payloads into columns with the correct data types:

```sql
CREATE VIEW sensors_data AS SELECT
    (body->>'sensor_id')::text AS "sensor_id",
    (body->>'timestamp')::timestamp AS "timestamp",
    (body->>'temperature')::float AS "temperature",
    (body->'location'->>'latitude')::float AS "latitude",
    (body->'location'->>'longitude')::float AS "longitude"
  FROM my_webhook_source;
```

After that we can create a materialized view to compute real-time analytics on the IoT data in the last 5 minutes:

```sql
CREATE MATERIALIZED VIEW simple_sensor_summary AS
SELECT
    s.sensor_id,
    COUNT(*) AS total_records,
    AVG(s.temperature) AS avg_temperature,
    MAX(s.timestamp) AS latest_timestamp
FROM
    sensors_data AS s
GROUP BY
    sensor_id;
```

We can query the materialized view to get the latest data:

```sql
SELECT * FROM simple_sensor_summary LIMIT 10;
```

To subscribe to the `simple_sensor_summary` materialized view, we can use the `SUBSCRIBE` command:

```sql
COPY (
    SUBSCRIBE TO simple_sensor_summary
    WITH (SNAPSHOT = FALSE)
) TO STDOUT;
```

## Usage

1.  Navigate to the project directory and activate the virtual environment if you set it up.

2.  Start the Streamlit application:

    ```bash
    streamlit run subscribe.py
    ```

3.  Access the application in your web browser at `http://localhost:8501/`.
