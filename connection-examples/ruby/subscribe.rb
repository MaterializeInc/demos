require 'pg'
require './state'

conn = PG.connect(
  host: "MATERIALIZE_HOST",
  port: 6875,
  dbname: "materialize",
  user: "MATERIALIZE_USERNAME",
  password: "MATERIALIZE_PASSWORD",
  sslmode: 'require'
)
conn.exec('BEGIN')
conn.exec('DECLARE c CURSOR FOR SUBSCRIBE (SELECT sum FROM counter_sum) WITH (PROGRESS)')

updated = false
state = State.new(false)
buffer = []

# Loop indefinitely
loop do
  conn.exec('FETCH c') do |result|
    result.each do |row|
      # Map row fields
      ts = row["mz_timestamp"]
      progress = row["mz_progressed"]
      diff = row["mz_diff"]
      rowData = { sum: row["sum"] }

      #  When a progress is detected, get the state
      if progress == 't'
        if updated
          updated = false

          state.update(buffer, ts.to_i)
          buffer = []
          puts state.get_state
        end
      else
        # Update the state with the last data
        updated = true
        buffer.push({ value: rowData, diff: diff.to_i })
      end
    end
  end
end
