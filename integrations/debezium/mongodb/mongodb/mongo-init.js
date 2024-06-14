// Initialize Replica Set
rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "localhost:27017" }]
});

print("Initiated replica set");

// Sleep is not available in this context, so we rely on MongoDB to wait until the RS is initiated
// before proceeding with the rest of the script

// Create admin user
db = db.getSiblingDB('admin');
db.createUser({
    user: 'admin',
    pwd: 'admin',
    roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
});

// Define new roles
db.createRole({
    role: "listDatabases",
    privileges: [{
        resource: { cluster: true },
        actions: ["listDatabases"]
    }],
    roles: []
});

db.createRole({
    role: "readChangeStream",
    privileges: [{
        resource: { db: "", collection: "" },
        actions: ["find", "changeStream"]
    }],
    roles: []
});

// Create debezium user
db.createUser({
    user: 'debezium',
    pwd: 'dbz',
    roles: [
        { role: "readWrite", db: "inventory" },
        { role: "read", db: "local" },
        { role: "listDatabases", db: "admin" },
        { role: "readChangeStream", db: "admin" },
        { role: "read", db: "config" },
        { role: "read", db: "admin" }
    ]
});
