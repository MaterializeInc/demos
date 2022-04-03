FROM python:3.9.9-bullseye

WORKDIR /workdir

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENTRYPOINT ["python", "generate_load.py"]
