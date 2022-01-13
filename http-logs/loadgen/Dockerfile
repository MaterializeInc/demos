FROM python:3.9.9-bullseye

WORKDIR /workdir

RUN apt-get update \
    && apt-get install --no-install-recommends -y wamerican \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
ENTRYPOINT ["python3", "loadgen.py"]
