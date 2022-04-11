import datetime
import json
import random
import signal
import sys
import time

from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable

KAFKA_BROKER = "redpanda:9092"


def handler(_number, _frame):
    sys.exit(0)


def random_confirmed_fraud():
    """Generate infinite sequence of random fraud confirmations."""
    while True:
        yield {
            "account_id": random.randint(0, 6),
            "transaction_ts": datetime.datetime.now().isoformat(),
        }


def main():
    while True:
        try:
            producer = KafkaProducer(bootstrap_servers=[KAFKA_BROKER])
            for record in random_confirmed_fraud():
                val = json.dumps(record, ensure_ascii=False).encode("utf-8")
                producer.send(topic="confirmed_fraud", value=val)
                producer.flush()
                time.sleep(1)

        except SystemExit:
            print("Good bye!")
            return
        except NoBrokersAvailable:
            time.sleep(2)
            continue
        except Exception as e:
            print(e, flush=True)
            return


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, handler)

    main()
