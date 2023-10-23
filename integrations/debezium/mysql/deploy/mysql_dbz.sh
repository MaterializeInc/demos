#!/bin/bash

#Initialize Debezium (Kafka Connect Component)

while true; do
    echo "Waiting for Debezium to be ready"
    sleep 0.1
    curl -s -o /dev/null -w "%{http_code}" http://debezium:8083/connectors/ | grep 200
    if [ $? -eq 0 ]; then
        echo "Debezium is ready"
        break
    fi
done

# Read the JSON file and register the connector and change the ${EXTERNAL_IP} with the external IP environment variable
sed -i "s/EXTERNAL_IP/${EXTERNAL_IP}/g" /deploy/register-mysql.json

curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://debezium:8083/connectors/ -d @/deploy/register-mysql.json

if [ $? -eq 0 ]; then
    echo "Debezium connector registered"
else
    echo "Debezium connector registration failed"
    exit 1
fi

##
# Reviews generation mock script
# Table details:
# - name: reviews
# - columns:
#   - id
#   - user_id
#   - review_text
#   - review_rating
#   - created_at
#   - updated_at
##

# Start generating reviews
# Start generating reviews
# Start generating reviews
echo "Generating reviews..."
id=1
while [[ true ]] ; do

    # Define variables
    user_role=$(seq 1 4 | sort -R | head -n1)
    review_rating=$(seq 1 10 | sort -R | head -n1)
    review_text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

    echo "Generating review for user_id: ${id}"

    # Generate users
    # Assuming you have added name and role_id columns to your demo.users table
    mysql -h mysql -u mysqluser -pmysqlpwd -e "INSERT INTO demo.users (id, name, email, role_id) VALUES ( ${id}, 'user${id}', 'user${id}@demo.com', ${user_role} );" 2> /dev/null

    # Generate reviews
    # Assuming you have updated column names in your demo.reviews table
    mysql -h mysql -u mysqluser -pmysqlpwd -e "INSERT INTO demo.reviews (user_id, comment, rating, created_at, updated_at) VALUES ( ${id}, '${review_text}', ${review_rating}, NOW(), NOW() );" 2> /dev/null

    # Increment id
    ((id=id+1))

    # Sleep for 1 second
    sleep 1

done
