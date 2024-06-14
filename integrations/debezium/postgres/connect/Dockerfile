FROM debezium/connect-base:2.4

#
# Set up the plugins directory ...
#
ENV CONFLUENT_VERSION=7.0.1 \
    AVRO_VERSION=1.10.1 \
    GUAVA_VERSION=31.0.1-jre

RUN docker-maven-download confluent kafka-connect-avro-converter "$CONFLUENT_VERSION" fd03a1436f29d39e1807e2fb6f8e415a && \
    docker-maven-download confluent kafka-connect-avro-data "$CONFLUENT_VERSION" d27f30e9eca4ef1129289c626e9ce1f1 && \
    docker-maven-download confluent kafka-avro-serializer "$CONFLUENT_VERSION" c72420603422ef54d61f493ca338187c && \
    docker-maven-download confluent kafka-schema-serializer "$CONFLUENT_VERSION" 9c510db58119ef66d692ae172d5b1204 && \
    docker-maven-download confluent kafka-schema-registry-client "$CONFLUENT_VERSION" 7449df1f5c9a51c3e82e776eb7814bf1 && \
    docker-maven-download confluent common-config "$CONFLUENT_VERSION" aab5670de446af5b6f10710e2eb86894 && \
    docker-maven-download confluent common-utils "$CONFLUENT_VERSION" 74bf5cc6de2748148f5770bccd83a37c && \
    docker-maven-download central org/apache/avro avro "$AVRO_VERSION" 35469fee6d74ecbadce4773bfe3a204c && \
    docker-maven-download central com/google/guava guava "$GUAVA_VERSION" bb811ca86cba6506cca5d415cd5559a7

# https://github.com/debezium/container-images/blob/main/connect/2.4/Dockerfile
LABEL maintainer="Debezium Community"

ENV DEBEZIUM_VERSION="2.4.0.Final" \
    MAVEN_REPO_CENTRAL="" \
    MAVEN_REPOS_ADDITIONAL="" \
    MAVEN_DEP_DESTINATION=$KAFKA_CONNECT_PLUGINS_DIR \
    MONGODB_MD5=a22784387e0ec8a6abb1606c2c365cb2 \
    MYSQL_MD5=4bff262afc9678f5cbc3be6315b8e71e \
    POSTGRES_MD5=b42c9e208410f39ad1ad09778b1e3f03 \
    SQLSERVER_MD5=9b8bf3c62a7c22c465a32fa27b3cffb5 \
    ORACLE_MD5=21699814400860457dc2334b165882e6 \
    DB2_MD5=0727d7f2d1deeacef39e230acac835a8 \
    SPANNER_MD5=186b07595e914e9139941889fd675044 \
    VITESS_MD5=3b4d24c8c9898df060c408a13fd3429f \
    JDBC_MD5=77c5cb9adf932ab17c041544f4ade357 \
    KCRESTEXT_MD5=25c0353f5a7304b3c4780a20f0f5d0af \
    SCRIPTING_MD5=53a3661e7a9877744f4a30d6483d7957

RUN docker-maven-download debezium mongodb "$DEBEZIUM_VERSION" "$MONGODB_MD5" && \
    docker-maven-download debezium mysql "$DEBEZIUM_VERSION" "$MYSQL_MD5" && \
    docker-maven-download debezium postgres "$DEBEZIUM_VERSION" "$POSTGRES_MD5" && \
    docker-maven-download debezium sqlserver "$DEBEZIUM_VERSION" "$SQLSERVER_MD5" && \
    docker-maven-download debezium oracle "$DEBEZIUM_VERSION" "$ORACLE_MD5" && \
    docker-maven-download debezium-additional db2 db2 "$DEBEZIUM_VERSION" "$DB2_MD5" && \
    docker-maven-download debezium-additional jdbc jdbc "$DEBEZIUM_VERSION" "$JDBC_MD5" && \
    docker-maven-download debezium-additional spanner spanner "$DEBEZIUM_VERSION" "$SPANNER_MD5" && \
    docker-maven-download debezium-additional vitess vitess "$DEBEZIUM_VERSION" "$VITESS_MD5" && \
    docker-maven-download debezium-optional connect-rest-extension "$DEBEZIUM_VERSION" "$KCRESTEXT_MD5" && \
    docker-maven-download debezium-optional scripting "$DEBEZIUM_VERSION" "$SCRIPTING_MD5"
