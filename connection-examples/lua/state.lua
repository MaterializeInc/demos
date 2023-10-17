local json = require "cjson"
local State = {}

function State:new(collectHistory)
  local obj = {
    state = {},
    timestamp = 0,
    valid = true,
    history = collectHistory and {} or nil
  };

  setmetatable(obj, self)
  self.__index = self
  return obj
end

function State:getState()
  local list = {}

  for key, value in pairs(self.state) do
    local clone = json.decode(key)['value']
    for i = 1, value do
      table.insert(list, clone)
    end
  end

  return list
end

function State:getHistory()
  return self.history
end

function State:validate(timestamp)
  if not self.valid then
    error("Invalid state.")
  elseif tonumber(timestamp) < self.timestamp then
    print("Invalid timestamp.")
    self.valid = false
    error(string.format("Update with timestamp (%d) is lower than the last timestamp (%d). Invalid state.", timestamp, self.timestamp))
  end
end

function State:process(update)
  local value = json.encode({ value = update.value })
  local count = self.state[value] or 0
  count = count + update.diff

  if count <= 0 then
    self.state[value] = nil
  else
    self.state[value] = count
  end

  if self.history then
    table.insert(self.history, update)
  end
end

function State:update(updates, timestamp)
  if #updates > 0 then
    self:validate(timestamp)
    self.timestamp = timestamp
    for _, update in ipairs(updates) do
      self:process(update)
    end
  end
end

return State
