import os
import psycopg2
import time

# CONFIG
pgHost = os.getenv("POSTGRES_HOST", "postgres")
pgPort = os.getenv("POSTGRES_PORT", "5432")
pgUser = os.getenv("POSTGRES_USER", "postgres")
pgPass = os.getenv("POSTGRES_PASSWORD", "postgres")
pgDatabase = os.getenv("POSTGRES_DATABASE", "postgres")

purchaseRetentionDays = 2

while True:
    try:
        with psycopg2.connect(
            host=pgHost,
            port=pgPort,
            user=pgUser,
            password=pgPass,
            database=pgDatabase
        ) as connection:
            with connection.cursor() as cursor:
                print(f"Deleting purchases older than {purchaseRetentionDays} days...")
                # Delete old purchases (older than purchaseRetentionDays days)
                cursor.execute(
                    f"DELETE FROM shop.purchases WHERE updated_at < NOW() - INTERVAL '{purchaseRetentionDays} days'"
                )
                connection.commit()
                # Get the number of purchases deleted
                cursor.execute("SELECT ROW_COUNT()")
                deleted_count = cursor.fetchone()[0]
                print(f"Deleted {deleted_count} purchases")

    except psycopg2.Error as e:
        print(e)

    # Wait for 5 minutes (300 seconds)
    time.sleep(300)
