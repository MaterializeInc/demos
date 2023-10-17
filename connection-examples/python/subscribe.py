#!/usr/bin/env python3

import psycopg2
import sys
from state import State

dsn = "user=MATERIALIZE_USERNAME password=MATERIALIZE_PASSWORD host=MATERIALIZE_HOST port=6875 dbname=materialize sslmode=require"
conn = psycopg2.connect(dsn)

with conn.cursor() as cur:
    cur.execute("DECLARE c CURSOR FOR SUBSCRIBE (SELECT sum FROM counter_sum) WITH (PROGRESS);")

    state = State()
    updated = False
    while True:
        cur.execute("FETCH ALL c")
        for row in cur:
            # Map row fields
            ts = row[0]
            progress = row[1]
            diff = row[2]

            # When a progress is detected, get the last values
            if progress:
                if updated:
                    updated = False
                    print(state.get_state())
            else:
                rowData = { "sum": int(row[3]) }

                # Update the state with the last data
                updated = True
                try:
                    state.update([{
                        'value': rowData,
                        'diff': float(diff),
                    }], float(ts))
                except Exception as err:
                    print(err)