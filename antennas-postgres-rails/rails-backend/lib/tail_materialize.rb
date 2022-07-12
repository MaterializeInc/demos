mdb = {
	:host=>"localhost",
	:port=>6875,
	:user=>"materialize",
	:password=>"materialize",
	:dbname=>"materialize"
}

sql = 'TAIL (SELECT * FROM last_half_minute_performance_per_antenna)'
conn = PG.connect(mdb)
conn.exec('BEGIN')
conn.exec("DECLARE c CURSOR FOR #{sql} WITH (SNAPSHOT, PROGRESS)")

while true
  conn.exec("FETCH 100 c WITH (TIMEOUT='1s')") do |result|
    result.each do |row|
      ActionCable.server.broadcast("tail", row)
    end
  end
end