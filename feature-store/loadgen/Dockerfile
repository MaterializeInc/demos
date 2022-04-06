FROM python:3.9.9-bullseye

RUN mkdir -p /app
WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY loadgen.py /app
CMD ["python3", "/app/loadgen.py"]