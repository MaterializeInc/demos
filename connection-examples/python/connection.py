#!/usr/bin/env python3

import psycopg2
import sys

dsn = "user=MATERIALIZE_USERNAME password=MATERIALIZE_PASSWORD host=MATERIALIZE_HOST port=6875 dbname=materialize sslmode=require"
# Alternative syntax:
# dsn = "postgresql://MATERIALIZE_USERNAME:MATERIALIZE_PASSWORD@MATERIALIZE_HOST:6875/materialize?sslmode=require"
conn = psycopg2.connect(dsn)
