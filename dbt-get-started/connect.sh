source .env
PGPASSWORD=$MZ_PASSWORD \
PGOPTIONS='--cluster=default --search_path=shop' \
    psql \
        -U $MZ_USER \
        -h $MZ_HOST \
        -p 6875 \
        -d datacouncil2023