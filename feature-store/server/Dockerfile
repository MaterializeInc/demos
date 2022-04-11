FROM python:3.9.9-bullseye

RUN mkdir -p /app
WORKDIR /app

COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

COPY feature_store_server.py /app
CMD ["python3", "/app/feature_store_server.py"]
