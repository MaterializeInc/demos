require 'pg'

conn = PG.connect(
  host: "MATERIALIZE_HOST",
  port: 6875,
  dbname: "materialize",
  user: "MATERIALIZE_USERNAME",
  password: "MATERIALIZE_PASSWORD",
  sslmode: 'require'
)

# Create a view
view = conn.exec(
    "CREATE MATERIALIZED VIEW IF NOT EXISTS counter_sum AS
      SELECT sum(counter)
      FROM counter;"
);
puts view.inspect

# Show the view
res = conn.exec("SHOW VIEWS")
res.each do |row|
  puts row
end