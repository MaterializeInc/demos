require 'pg'

conn = PG.connect(
  host: "MATERIALIZE_HOST",
  port: 6875,
  dbname: "materialize",
  user: "MATERIALIZE_USERNAME",
  password: "MATERIALIZE_PASSWORD",
  sslmode: 'require'
)

# Create a source
src = conn.exec(
    "CREATE SOURCE IF NOT EXISTS counter
    FROM LOAD GENERATOR COUNTER
    (TICK INTERVAL '500ms')
    WITH (SIZE = '3xsmall')
    "
);

puts src.inspect

# Show the source
res = conn.exec("SHOW SOURCES")
res.each do |row|
  puts row
end