#!/usr/bin/env python3

import pg8000.native
import ssl
from state import State

ssl_context = ssl.create_default_context()

conn = pg8000.connect(host="MATERIALIZE_HOST", port=6875, user="MATERIALIZE_USERNAME", password="MATERIALIZE_PASSWORD", database="materialize", ssl_context=ssl_context)

conn.run("BEGIN")
conn.run("DECLARE c CURSOR FOR SUBSCRIBE (SELECT sum FROM counter_sum) WITH (PROGRESS);")
state = State()
updated = False

# infinite loop to keep the cursor open
while True:
    results = conn.run("FETCH ALL FROM c")
    for row in results:
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


