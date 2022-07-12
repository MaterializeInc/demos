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
    rows = result.map do |row|
      {
        antenna_id: row["antenna_id"],
        geojson: row["geojson"].to_json,
        performance: row["performance"],
        diff: row["mz_diff"],
        timestamp: row["mz_timestamp"]
      }
    end

    ActionCable.server.broadcast("tail", { data: { antennasUpdates: rows }})
  end
end