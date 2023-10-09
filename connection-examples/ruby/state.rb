class State
  Update = Struct.new(:value, :diff)

  def initialize(collect_history)
    @state = {}
    @timestamp = 0
    @valid = true
    @history = collect_history ? [] : nil
  end

  def get_state
    list = []

    @state.each do |key, value|
      clone = JSON.parse(key)
      value.times { list << clone }
    end

    list.freeze
  end

  def get_history
    @history
  end

  private

  def validate(timestamp)
    raise "Invalid state." unless @valid

    if timestamp < @timestamp
      puts "Invalid timestamp."
      @valid = false
      raise "Update with timestamp (#{timestamp}) is lower than the last timestamp (#{@timestamp}). Invalid state."
    end
  end

  def process(update)
    # Count value starts as a NaN
    value = JSON.generate(update[:value])
    count = @state[value].to_i + update[:diff]

    if count <= 0
      @state.delete(value)
    else
      @state[value] = count
    end

    @history&.push(update)
  end

  public

  def update(updates, timestamp)
    return if updates.empty?

    validate(timestamp)
    @timestamp = timestamp
    updates.each { |update| process(update) }
  end
end
