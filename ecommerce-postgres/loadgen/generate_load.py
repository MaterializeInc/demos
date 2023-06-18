import json
import math
import os
import random
import time

import barnum
from kafka import KafkaProducer
import psycopg2

# CONFIG
userSeedCount = 10000
itemSeedCount = 1000
purchaseGenCount = 500000
purchaseGenEveryMS = 100
pageviewMultiplier = 2  # Translates to 2x purchases, currently 20/sec or ~2M/day
itemInventoryMin = 1000
itemInventoryMax = 5000
itemPriceMin = 5
itemPriceMax = 500
pgHost = os.getenv("POSTGRES_HOST", "postgres")
pgPort = os.getenv("POSTGRES_PORT", "5432")
pgUser = os.getenv("POSTGRES_USER", "postgres")
pgPass = os.getenv("POSTGRES_PASSWORD", "postgres")
pgDatabase = os.getenv("POSTGRES_DATABASE", "postgres")
kafkaHostPort = os.getenv("CONFLUENT_BROKER_HOST", "redpanda:9092")
kafkaTopic = "pageviews"
channels = ["organic search", "paid search", "referral", "social", "display"]
categories = ["widgets", "gadgets", "doodads", "clearance"]
toInfinity = True

# INSERT TEMPLATES
item_insert = "INSERT INTO public.items (name, category, price, inventory) VALUES ( %s, %s, %s, %s )"
user_insert = "INSERT INTO public.users (email, is_vip) VALUES ( %s, %s )"
purchase_insert = "INSERT INTO public.purchases (user_id, item_id, quantity, purchase_price, status) VALUES ( %s, %s, %s, %s, %s )"
purchase_update = "UPDATE public.purchases SET deleted = true WHERE id=%s"

# Sleep for 5 seconds to give postgres time to start
print("Sleeping for 5 seconds to give postgres time to start...")
time.sleep(5)

# Initialize Kafka
if os.getenv("CONFLUENT_API_KEY") and os.getenv("CONFLUENT_API_SECRET"):
    producer = KafkaProducer(
        bootstrap_servers=[kafkaHostPort],
        value_serializer=lambda x: json.dumps(x).encode("utf-8"),
        security_protocol='SASL_SSL',
        sasl_mechanism='PLAIN',
        sasl_plain_username=os.getenv("CONFLUENT_API_KEY"),
        sasl_plain_password=os.getenv("CONFLUENT_API_SECRET")
    )
else:
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

def purchaseLoop():
    if toInfinity:
        index = 0
        while True:
            yield index
            index += 1
    else:
        for i in range(purchaseGenCount):
            yield i

try:
    with psycopg2.connect(
        host=pgHost,
        port=pgPort,
        user=pgUser,
        password=pgPass,
        database=pgDatabase
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
            cursor.execute("SELECT id, price FROM public.items")
            item_prices = [(row[0], row[1]) for row in cursor]

            print("Preparing to loop + seed kafka pageviews and purchases")
            for i in purchaseLoop():
                # Get a user and item to purchase
                purchase_item = random.choice(item_prices)
                purchase_user = random.randint(1, userSeedCount - 1)
                purchase_quantity = random.randint(1, 5)
                if random.randint(0,100) < 90:
                    purchase_status = 1
                else:
                    purchase_status = 0

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
                        purchase_status
                    ),
                )
                connection.commit()

                # Pause
                time.sleep(purchaseGenEveryMS / 1000)

            # Update purchases (soft deletes)
            cursor.execute("""
                SELECT id
                FROM public.purchases
                WHERE deleted = false
                ORDER BY RAND()
                LIMIT 500
            """)
            purchases_to_delete = [(row[0]) for row in cursor]
            cursor.executemany(purchase_update, purchases_to_delete)
            connection.commmit()

    connection.close()

except psycopg2.Error as e:
    print(e)
