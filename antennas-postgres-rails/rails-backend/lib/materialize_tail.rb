class MaterializeTail
  def self.materialize_db_config
    {
	    :host=>"localhost",
	    :port=>6875,
	    :user=>"materialize",
	    :password=>"materialize",
	    :dbname=>"materialize"
    }
  end

  attr_reader :sql, :connection

  def initialize(sql:)
    throw "Needs a valid SQL statement to be provided" unless sql

    @sql = sql
    @connection = PG.connect(self.class.materialize_db_config)
  end

  def run
    throw "Needs a block to be provided" unless block_given?

    tail_sql = "TAIL (#{sql})"
    connection.exec('BEGIN')
    connection.exec("DECLARE c CURSOR FOR #{tail_sql} WITH (SNAPSHOT, PROGRESS)")

    while true
      connection.exec("FETCH 100 c WITH (TIMEOUT='1s')") do |result|
        yield(result)
      end
    end
  ensure
    connection.reset
  end
end
