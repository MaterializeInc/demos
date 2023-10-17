import streamlit as st
import psycopg
import altair as alt
import threading
import queue
import pandas as pd
import os
from collections import defaultdict

DATABASE_URL = os.environ['DATABASE_URL']
updates_queue = queue.Queue()

def fetch_data():
    conn = psycopg.connect(DATABASE_URL)
    with conn.cursor() as cur:
        for row in cur.stream("SUBSCRIBE simple_sensor_summary ENVELOPE UPSERT (KEY (sensor_id));"):
            # print(f"Row from database: {row}")  # Log the fetched row for debugging
            updates_queue.put(row)

# Create a background thread to fetch data
thread = threading.Thread(target=fetch_data)
thread.start()

# Initialize the session state
if 'data' not in st.session_state:
    st.session_state.data = defaultdict(list)

chart_placeholder = st.empty()

while True:
    if not updates_queue.empty():
        print("Data found in queue!")  # Check if we're ever entering this block
        update = updates_queue.get()
        # print(f"Update received: {update}")  # Log the received update for debugging

        update = updates_queue.get()
        if "Error" in update:
            st.error(update)
        else:
            # Append data to session state
            st.session_state.data['mz_timestamp'].append(int(update[0]))
            st.session_state.data['mz_state'].append(update[1])
            st.session_state.data['key'].append(update[2])
            st.session_state.data['total_records'].append(update[3])
            st.session_state.data['avg_temperature'].append(float(update[4]))  # Convert string to float
            st.session_state.data['latest_timestamp'].append(update[5])

            # Convert session state to DataFrame for Altair
            df = pd.DataFrame(st.session_state.data)

            # Update chart
            chart = alt.Chart(df).mark_point().encode(
                x='mz_timestamp:T',
                y='avg_temperature:Q',
                color='key:N'
            )
            chart_placeholder.altair_chart(chart, use_container_width=True)
