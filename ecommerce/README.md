# Real-Time E-Commerce Demo

This app demonstrates the real-time incremental computation capabilities of Materialize in the context of an e-commerce website.

**An e-commerce business wants to understand:**

- **Order trends** throughout the day to discern patterns.
- **What is selling the most?**
  - Understand supply/demand and manage inventory.
  - Show inventory status in the website to encourage users to buy.
- **Conversion Funnel:** Effectiveness of the website in converting pageviews to actual buys.
- **Low-stock Alerts:** Generate alerts and automatically place orders to the warehouse if a specific item is close to running out of stock

We'll build materialized views that answer most of the questions by providing data in a [business intelligence dashboard](#business-intelligence-metabase).

To generate the data we'll simulate **users**, **items**, **purchases** and **pageviews** on a fictional e-commerce website.

To simplify deploying all of this infrastructure, the demo is enclosed in a series of Docker images glued together via Docker Compose. As a secondary benefit, you can run the demo via Linux, an EC2 VM instance, or a Mac laptop.

The [docker-compose file](docker-compose.yml) spins up containers with the following names, connections and roles:
![Shop demo infra](demo.png)

## What to Expect

Our load generator (`loadgen`) is a [python script](loadgen/generate_load.py) that does two things:

1. It seeds MySQL with `item`, `user` and `purchase` tables, and then begins rapidly adding `purchase` rows that join an item and a user. _(~10 per second)_
2. It simultaneously begins sending JSON-encoded `pageview` events directly to kafka. _(~750 per second)_

As the database writes occur, Debezium/Kafka stream the changes out of MySQL. Materialize subscribes to this change feed and maintains our materialized views with the incoming data––materialized views typically being some report whose information we're regularly interested in viewing.

For example, if we wanted real time statistics of total pageviews and orders by item, Materialize could maintain that report as a materialized view. And, in fact,
that is exactly what this demo will show.

## Prepping Mac Laptops

| **M1 Mac Warning**                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| This demo relies heavily on Docker images from several different sources, we haven't tested it on Apple M1 Silicon yet, which is known to have Docker compatibility issues. |

If you're on a Mac laptop, you might want to increase the amount of memory
available to Docker Engine.

1. From the Docker Desktop menu bar app, select **Preferences**.
2. Go to the **Advanced** tab.
3. Select at least **8 GiB** of **Memory**.
4. Click **Apply and Restart**.

## Running the Demo

You'll need to have [docker and docker-compose installed](https://materialize.com/docs/third-party/docker) before getting started.

1. Clone this repo and navigate to the directory by running:

   ```shell session
   git clone https://github.com/MaterializeInc/demos.git
   cd demos/ecommerce
   ```

2. Bring up the Docker Compose containers in the background:

   ```shell session
   docker-compose up -d
   ```

   **This may take several minutes to complete the first time you run it.** If all goes well, you'll have everything running in their own containers, with Debezium configured to ship changes from MySQL into Kafka.

3. Launch the Materialize CLI.

   ```shell session
   docker-compose run cli
   ```

   _(This is just a shortcut to a docker container with postgres-client pre-installed, if you already have psql you could run `psql -U materialize -h localhost -p 6875 materialize`)_

4. Now that you're in the Materialize CLI, define all of the tables in `mysql.shop` as Kafka sources:

   ```sql
   CREATE SOURCE purchases
   FROM KAFKA BROKER 'kafka:9092' TOPIC 'mysql.shop.purchases'
   FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY 'http://schema-registry:8081'
   ENVELOPE DEBEZIUM;

   CREATE SOURCE items
   FROM KAFKA BROKER 'kafka:9092' TOPIC 'mysql.shop.items'
   FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY 'http://schema-registry:8081'
   ENVELOPE DEBEZIUM;

   CREATE SOURCE users
   FROM KAFKA BROKER 'kafka:9092' TOPIC 'mysql.shop.users'
   FORMAT AVRO USING CONFLUENT SCHEMA REGISTRY 'http://schema-registry:8081'
   ENVELOPE DEBEZIUM;
   ```

   Because these sources are pulling message schema data from the registry, materialize knows the column types to use for each attribute.

5. We'll also want to create a JSON-formatted source for the pageviews:

   ```sql
   CREATE SOURCE json_pageviews
   FROM KAFKA BROKER 'kafka:9092' TOPIC 'pageviews'
   FORMAT BYTES;
   ```

   With JSON-formatted messages, we don't know the schema so the [JSON is pulled in as raw bytes](https://materialize.com/docs/sql/create-source/json-kafka/) and we still need to CAST data into the proper columns and types. We'll show that in the step below.

   Now if you run `SHOW SOURCES;` in the CLI, you should see the four sources we created:

   ```
   materialize=> SHOW SOURCES;
       name
   ----------------
   items
   json_pageviews
   purchases
   users
   (4 rows)

   materialize=>
   ```

6. Next we will create our first Materialized View, summarizing pageviews by item and channel:

   ```sql
   CREATE MATERIALIZED VIEW item_pageviews AS
       SELECT
       (regexp_match((data->'url')::STRING, '/products/(\d+)')[1])::INT AS item_id,
       data->>'channel' as channel,
       COUNT(*) as pageviews
       FROM (
       SELECT CAST(data AS jsonb) AS data
       FROM (
           SELECT convert_from(data, 'utf8') AS data
           FROM json_pageviews
       )) GROUP BY 1, 2;
   ```

   As you can see here, we are doing a couple extra steps to get the pageview data into the format we need:

   1. We are converting from raw bytes to utf8 encoded text to [jsonb](https://materialize.com/docs/sql/types/jsonb/#main):

      ```sql
      SELECT CAST(data AS jsonb) AS data
       FROM (
           SELECT convert_from(data, 'utf8') AS data
           FROM json_pageviews
       )
      ```

   2. We are using postgres JSON notation (`data->'url'`), type casts (`::STRING`) and [regexp_match](https://materialize.com/docs/sql/functions/#string-func:~:text=regexp_match(haystack) function to extract only the item_id from the raw pageview URL.

      ```sql
      (regexp_match((data->'url')::STRING, '/products/(\d+)')[1])::INT AS item_id,
      ```

7. Now if you select results from the view, you should see data populating:

   ```sql
   SELECT * FROM item_pageviews ORDER BY pageviews DESC LIMIT 10;
   ```

   If you re-run it a few times you should see the pageview counts changing as new data comes in and gets materialized in real time.

8. Let's create some more materialized views:

   **Purchase Summary:**

   ```sql
   CREATE MATERIALIZED VIEW purchase_summary AS
       SELECT
           item_id,
           SUM(purchase_price) as revenue,
           COUNT(id) AS orders,
           SUM(quantity) AS items_sold
       FROM purchases GROUP BY 1;
   ```

   **Item Summary:** _(Using purchase summary and pageview summary internally)_

   ```sql
   CREATE MATERIALIZED VIEW item_summary AS
       SELECT
           items.name,
           items.category,
           SUM(purchase_summary.items_sold) as items_sold,
           SUM(purchase_summary.orders) as orders,
           SUM(purchase_summary.revenue) as revenue,
           SUM(item_pageviews.pageviews) as pageviews,
           SUM(purchase_summary.orders) / SUM(item_pageviews.pageviews)::FLOAT AS conversion_rate
       FROM items
       JOIN purchase_summary ON purchase_summary.item_id = items.id
       JOIN item_pageviews ON item_pageviews.item_id = items.id
       GROUP BY 1, 2;
   ```

   This view shows some of the JOIN capabilities of Materialize, we're joining our two previous views with items to create a summary of purchases, pageviews, and conversion rates.

   If you select from `item_summary` you can see the results in real-time:

   ```sql
   SELECT * FROM item_summary ORDER BY conversion_rate DESC LIMIT 10;
   ```

   **Remaining Stock:** This view joins items and (all purchases created _after_ an item's inventory was updated) and creates a column that subtracts quantity_sold from inventory to get a live in-stock count.

   ```sql
   CREATE MATERIALIZED VIEW remaining_stock AS
       SELECT
         items.id as item_id,
         MAX(items.inventory) - SUM(purchases.quantity) AS remaining_stock
       FROM items
       JOIN purchases ON purchases.item_id = items.id AND purchases.created_at > items.inventory_updated_at
       GROUP BY items.id;
   ```

   **Trending Items:** Here we are doing a bit of a hack because Materialize doesn't yet support window functions like `RANK`. So instead we are doing a self join on `purchase_summary` and counting up the items with _more purchases than the current item_ to get a basic "trending" rank datapoint.

   ```sql
   CREATE MATERIALIZED VIEW trending_items AS
       SELECT
           p1.item_id,
           (
               SELECT COUNT(*)
               FROM purchase_summary p2
               WHERE p2.items_sold > p1.items_sold
           ) as trend_rank
       FROM purchase_summary p1;
   ```

   Lastly, let's bring the trending items and remaining stock views together to create a view that a user-facing application might read from:

   ```sql
   CREATE MATERIALIZED VIEW item_metadata AS
       SELECT
           rs.item_id as id, rs.remaining_stock, ti.trend_rank
       FROM remaining_stock rs
       JOIN trending_items ti ON ti.item_id = rs.item_id;
   ```

   Now if you run `SHOW VIEWS;` you should see all the views we just created:

   ```
   materialize=> SHOW VIEWS;
      name
   ------------------
   item_metadata
   item_pageviews
   item_summary
   purchase_summary
   remaining_stock
   trending_items
   (6 rows)
   ```

9. Now you've materialized some views that we can use in a business intelligence tool, metabase, to read and display them in pretty charts. Close out of the Materialize CLI (<kbd>Ctrl</kbd> + <kbd>D</kbd>).

## Business Intelligence: Metabase

1. In a browser, go to <localhost:3030> _(or <IP_ADDRESS:3030> if running on a VM)._

2. Click **Let's get started**.

3. Complete the first set of fields asking for your email address. This
   information isn't crucial for anything but does have to be filled in.

4. On the **Add your data** page, fill in the following information:

   | Field             | Enter...         |
   | ----------------- | ---------------- |
   | Database          | **Materialize**  |
   | Name              | **shop**         |
   | Host              | **materialized** |
   | Port              | **6875**         |
   | Database name     | **materialize**  |
   | Database username | **materialize**  |
   | Database password | Leave empty.     |

5. Proceed past the screens until you reach your primary dashboard.

6. Click **Ask a question**

7. Click **Native query**.

8. From **Select a database**, select **shop**.

9. In the query editor, enter:

   ```sql
   SELECT * FROM item_summary ORDER BY conversion_rate DESC;
   ```

10. You can save the output and add it to a dashboard, once you've drafted a dashboard you can manually set the refresh rate to 1 second by adding `#refresh=1` to the end of the URL, here is an example of a real-time dashboard of top-viewed items and top converting items:
    ![](https://user-images.githubusercontent.com/11527560/111679085-5228a780-87f7-11eb-86c5-34bf7b6cdcfb.gif)

## Conclusion

You now have materialize doing real-time materialized views on a changefeed from a database and pageview events from kafka. You have complex multi-layer views doing JOIN's and aggregations in order to distill the raw data into a form that's useful for downstream applications. In metabase, you have the ability to create dashboards and reports using the real-time data.

You have a lot of infrastructure running in docker containers, don't forget to run `docker-compose down` to shut everything down!
