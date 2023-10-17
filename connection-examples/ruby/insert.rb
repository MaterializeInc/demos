require 'pg'

conn = PG.connect(
  host: "MATERIALIZE_HOST",
  port: 6875,
  dbname: "materialize",
  user: "MATERIALIZE_USERNAME",
  password: "MATERIALIZE_PASSWORD",
  sslmode: 'require'
)

conn.exec("INSERT INTO my_table (my_column) VALUES ('some_value')")

res  = conn.exec('SELECT * FROM my_table')

res.each do |row|
  puts row
end