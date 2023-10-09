#!/usr/bin/env python3

import psycopg2
import sys

dsn = "user=MATERIALIZE_USERNAME password=MATERIALIZE_PASSWORD host=MATERIALIZE_HOST port=6875 dbname=materialize sslmode=require"
conn = psycopg2.connect(dsn)
conn.autocommit = True

with conn.cursor() as cur:
    cur.execute("""CREATE MATERIALIZED VIEW IF NOT EXISTS counter_sum AS
            SELECT sum(counter)
            FROM counter;""")

with conn.cursor() as cur:
    cur.execute("SHOW VIEWS")
    print(cur.fetchone())