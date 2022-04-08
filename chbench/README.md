# CH-benCHmark demo

This is a demonstration of Materialize on CH-benCHmark—a mashup of TPC-C and
TPC-H designed to test the speed of analytics queries on a rapidly changing
dataset.

Documentation: <https://materialize.com/docs/demos/business-intelligence/>

TEMPORARY DEBUG/RUN Instructions:

Start everything up, make sure things are all healthy, then:
```
docker-compose run chbench gen --config-file-path=/etc/chbenchmark/mz-default-mysql.cfg --warehouses=1
curl -X POST -H "Content-Type: application/json" -d @mysql-connector.json http://localhost:8083/connectors
docker-compose run chbench run --config-file-path=/etc/chbenchmark/mz-default-mysql.cfg --dsn=mysql --gen-dir=/var/lib/mysql-files --analytic-threads=0 --transactional-threads=1 --run-seconds=86400 --mz-sources
```