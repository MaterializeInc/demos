#!/usr/bin/env python3

import psycopg2
import sys

dsn = "user=MATERIALIZE_USERNAME password=MATERIALIZE_PASSWORD host=MATERIALIZE_HOST port=6875 dbname=materialize sslmode=require"
conn = psycopg2.connect(dsn)
conn.autocommit = True

with conn.cursor() as cur:
    cur.execute("""CREATE SOURCE IF NOT EXISTS counter
            FROM LOAD GENERATOR COUNTER
            (TICK INTERVAL '500ms')
            WITH (SIZE = '3xsmall');""")

with conn.cursor() as cur:
    cur.execute("SHOW SOURCES")
    print(cur.fetchone())