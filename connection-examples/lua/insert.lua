local utils = require("utils")
local driver = require "luasql.postgres"
local env = assert (driver.postgres())
local con = assert(env:connect("postgresql://MATERIALIZE_USERNAME:MATERIALIZE_PASSWORD@MATERIALIZE_HOST:6875/materialize?sslmode=require"))

assert (con:execute([[
CREATE TABLE IF NOT EXISTS countries (name TEXT, code TEXT);
]]))

local list = {
  { name="United States", code="US", },
  { name="Canada", code="CA", },
  { name="Mexico", code="MX", },
  { name="Germany", code="DE", },
}

for _, p in pairs (list) do
  local _ = assert (con:execute(string.format([[
    INSERT INTO countries
    VALUES ('%s', '%s')]], p.name, p.code)
  ))
end

con:commit()

for count in utils.rows(con, 'SELECT COUNT(*) FROM countries;') do
    print(string.format("%s", count))
end
