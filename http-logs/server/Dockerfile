FROM python:3.9.9-bullseye

WORKDIR /workdir

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD python3 server.py 2>&1 | tee -a /log/requests
