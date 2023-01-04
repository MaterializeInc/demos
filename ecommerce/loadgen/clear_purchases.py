import os

from mysql.connector import Error, connect

# CONFIG
mysqlHost = os.getenv("MYSQL_HOST", "mysql")
mysqlPort = os.getenv("MYSQL_PORT", "3306")
mysqlUser = os.getenv("MYSQL_USER", "mysqluser")
mysqlPass = os.getenv("MYSQL_PASSWORD", "I957DO9cYXp6JDEv")
purchaseRetentionDays = 3

try:
    with connect(
        host=mysqlHost,
        user=mysqlUser,
        password=mysqlPass,
    ) as connection:
        with connection.cursor() as cursor:
            print("Deleting purchases older than " + purchaseRetentionDays + " days...")
            # Delete old purchases (older than purchaseRetentionDays days)
            cursor.execute(
                f"DELETE FROM shop.purchases WHERE updated_at < DATE_SUB(NOW(), INTERVAL {purchaseRetentionDays} DAY)"
            )
            connection.commit()
            # Get the number of purchases deleted
            cursor.execute("SELECT ROW_COUNT()")
            deleted_count = cursor.fetchone()[0]
            print(f"Deleted {deleted_count} purchases")
    connection.close()

except Error as e:
    print(e)
