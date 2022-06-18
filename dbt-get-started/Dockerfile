FROM python:3.9.9-bullseye

WORKDIR /usr/app/dbt

RUN set -ex; \
    pip install --no-cache-dir dbt-materialize==1.1.2

ENTRYPOINT ["/bin/bash"]
