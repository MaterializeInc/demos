source .env
PGPASSWORD=$MZ_PASSWORD \
PGOPTIONS='--cluster=datacouncil2023 --search_path=shop --transaction_isolation=serializable' \
    psql \
        -U $MZ_USER \
        -h $MZ_HOST \
        -p 6875 \
        -d datacouncil2023