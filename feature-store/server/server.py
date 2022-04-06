from aiohttp import web
from dataclasses import dataclass
import logging
import psycopg2
import random
from typing import Optional


logger = logging.getLogger('feature-store')
dsn = "postgresql://materialize@materialized:6875/materialize?sslmode=disable"
conn = psycopg2.connect(dsn)
conn.autocommit = True


@dataclass
class FeatureVctor:
    """
    A feature vector used to score a fraud model.

    Attributes:
        fraud_count The number of time the owner of the given account
                    has experienced fraudulent transactions, across any
                    of their accounts, over the last 30 days. 
    """

    fraud_count: int


def sophisticated_ds_model(_vector: FeatureVctor) -> int:
    """
    A highly sophisticated model, developed by our data science team, for
    estimating the likelyhood a transaction is fraudulent. It will return 
    a value in the range [0, 100) which can be used to trigger some downstream
    action such as sending an alert or blocking payment.
    """
    return random.randint(0, 100)


def query_feature_vector(account_id) -> Optional[FeatureVctor]:
    """
    This method builds a feature vector by pulling dimensions from
    Materialize. Under the hood, Materialize is continuously updating 
    the VIEWs as new data becomes available. While the logic for 
    generating fraud_count_feature may be computationally exensive, 
    querying the view is not because the computation is already completed.
    """
    with conn.cursor() as cur:
        cur.execute(f"""SELECT fraud_count 
                        FROM fraud_count_feature 
                        WHERE account_id = {account_id}""")

        for row in cur:
            fraud_count = int(row[0])
            logger.info(
                f"Materialize says {account_id} has a fraud count of {fraud_count}")
            return FeatureVctor(fraud_count)

        logger.info(
            f"Account {account_id} was not found in Materialize. This means it is not an active account.")
        return None


async def handle(request):
    account_id = int(request.match_info.get('account_id', "0"))
    logger.info(f"Calculating fraud score for account {account_id}")

    vector = query_feature_vector(account_id)

    if vector is not None:
        score = sophisticated_ds_model(vector)
        logger.info(
            f"Transaction for account {account_id} has been scored {score}% likely as fraudulent")
    else:
        score = -1

    return web.json_response({'score': score})


app = web.Application()
app.add_routes([web.get('/score/{account_id}', handle)])

if __name__ == '__main__':
    logging.basicConfig(format='%(asctime)s %(message)s')
    web.run_app(app, port=8100)
