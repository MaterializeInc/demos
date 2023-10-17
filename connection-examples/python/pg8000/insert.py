#!/usr/bin/env python3

import pg8000.native
import ssl

ssl_context = ssl.create_default_context()

conn = pg8000.connect(host="MATERIALIZE_HOST", port=6875, user="MATERIALIZE_USERNAME", password="MATERIALIZE_PASSWORD", database="materialize", ssl_context=ssl_context)

# Insert data
print('Insert data')
insert_query = "INSERT INTO countries (name, code) VALUES ('United States', 'US')"
conn.run(insert_query)
insert_query = "INSERT INTO countries (name, code) VALUES ('Canada', 'CA')"
conn.run(insert_query)
print('Select data')
countries = conn.run("SELECT * FROM countries;")
print(countries)