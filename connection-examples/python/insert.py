#!/usr/bin/env python3

import psycopg2
import sys

dsn = "user=MATERIALIZE_USERNAME password=MATERIALIZE_PASSWORD host=MATERIALIZE_HOST port=6875 dbname=materialize sslmode=require"
conn = psycopg2.connect(dsn)

cur = conn.cursor()
cur.execute("INSERT INTO countries (name, code) VALUES (%s, %s)", ('United States', 'US'))
cur.execute("INSERT INTO countries (name, code) VALUES (%s, %s)", ('Canada', 'CA'))
cur.execute("INSERT INTO countries (name, code) VALUES (%s, %s)", ('Mexico', 'MX'))
cur.execute("INSERT INTO countries (name, code) VALUES (%s, %s)", ('Germany', 'DE'))
conn.commit()
cur.close()

with conn.cursor() as cur:
    cur.execute("SELECT COUNT(*) FROM countries;")
    print(cur.fetchone())

conn.close()