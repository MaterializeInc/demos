require 'pg'

conn = PG.connect(
  host: "MATERIALIZE_HOST",
  port: 6875,
  dbname: "materialize",
  user: "MATERIALIZE_USERNAME",
  password: "MATERIALIZE_PASSWORD",
  sslmode: 'require'
)

res  = conn.exec('SELECT * FROM counter_sum')

res.each do |row|
  puts row
end