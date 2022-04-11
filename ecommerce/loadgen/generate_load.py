import json
import math
import os
import random
import time

import barnum
from kafka import KafkaProducer
from mysql.connector import Error, connect

# CONFIG
userSeedCount = 10000
itemSeedCount = 1000
purchaseGenCount = 500000
purchaseGenEveryMS = 100
pageviewMultiplier = 75  # Translates to 75x purchases, currently 750/sec or 65M/day
itemInventoryMin = 1000
itemInventoryMax = 5000
itemPriceMin = 5
itemPriceMax = 500
mysqlHost = "mysql"
mysqlPort = "3306"
mysqlUser = "mysqluser"
mysqlPass = "mysqlpw"
kafkaHostPort = os.getenv("KAFKA_ADDR", "kafka:9092")
kafkaTopic = "pageviews"
debeziumHostPort = "debezium:8083"
channels = ["organic search", "paid search", "referral", "social", "display"]
categories = ["widgets", "gadgets", "doodads", "clearance"]

# INSERT TEMPLATES
item_insert = "INSERT INTO shop.items (name, category, price, inventory) VALUES ( %s, %s, %s, %s )"
user_insert = "INSERT INTO shop.users (email, is_vip) VALUES ( %s, %s )"
purchase_insert = "INSERT INTO shop.purchases (user_id, item_id, quantity, purchase_price) VALUES ( %s, %s, %s, %s )"


# Initialize Kafka
producer = KafkaProducer(
    bootstrap_servers=[kafkaHostPort],
    value_serializer=lambda x: json.dumps(x).encode("utf-8"),
)


def generatePageview(viewer_id, target_id, page_type):
    return {
        "user_id": viewer_id,
        "url": f"/{page_type}/{target_id}",
        "channel": random.choice(channels),
        "received_at": int(time.time()),
    }


try:
    with connect(
        host=mysqlHost,
        user=mysqlUser,
        password=mysqlPass,
    ) as connection:
        with connection.cursor() as cursor:
            print("Seeding data...")
            cursor.executemany(
                item_insert,
                [
                    (
                        barnum.create_nouns(),
                        random.choice(categories),
                        random.randint(itemPriceMin * 100, itemPriceMax * 100) / 100,
                        random.randint(itemInventoryMin, itemInventoryMax),
                    )
                    for i in range(itemSeedCount)
                ],
            )
            cursor.executemany(
                user_insert,
                [
                    (barnum.create_email(), (random.randint(0, 10) > 8))
                    for i in range(userSeedCount)
                ],
            )
            connection.commit()

            print("Getting item ID and PRICEs...")
            cursor.execute("SELECT id, price FROM shop.items")
            item_prices = [(row[0], row[1]) for row in cursor]

            print("Preparing to loop + seed kafka pageviews and purchases")
            for i in range(purchaseGenCount):
                # Get a user and item to purchase
                purchase_item = random.choice(item_prices)
                purchase_user = random.randint(0, userSeedCount - 1)
                purchase_quantity = random.randint(1, 5)

                # Write purchaser pageview
                producer.send(
                    kafkaTopic,
                    key=str(purchase_user).encode("ascii"),
                    value=generatePageview(purchase_user, purchase_item[0], "products"),
                )

                # Write random pageviews to products or profiles
                pageviewOscillator = int(
                    pageviewMultiplier + (math.sin(time.time() / 1000) * 50)
                )
                for i in range(pageviewOscillator):
                    rand_user = random.randint(0, userSeedCount)
                    rand_page_type = random.choice(["products", "profiles"])
                    target_id_max_range = (
                        itemSeedCount if rand_page_type == "products" else userSeedCount
                    )
                    producer.send(
                        kafkaTopic,
                        key=str(rand_user).encode("ascii"),
                        value=generatePageview(
                            rand_user,
                            random.randint(0, target_id_max_range),
                            rand_page_type,
                        ),
                    )

                # Write purchase row
                cursor.execute(
                    purchase_insert,
                    (
                        purchase_user,
                        purchase_item[0],
                        purchase_quantity,
                        purchase_item[1] * purchase_quantity,
                    ),
                )
                connection.commit()

                # Pause
                time.sleep(purchaseGenEveryMS / 1000)

    connection.close()

except Error as e:
    print(e)
