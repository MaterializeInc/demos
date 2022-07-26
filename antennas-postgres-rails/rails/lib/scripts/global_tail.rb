# Needs Rails env to be loaded.
# Use `rails runner` command to run this script

require_relative "../materialize_tail"

client = MaterializeTail.new(sql: "SELECT * FROM last_half_minute_performance_per_antenna")
client.run do |result|
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