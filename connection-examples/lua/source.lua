local dump = require('utils').dump
local driver = require "luasql.postgres"
local env = assert (driver.postgres())
local con = assert(env:connect("postgresql://MATERIALIZE_USERNAME:MATERIALIZE_PASSWORD@MATERIALIZE_HOST:6875/materialize?sslmode=require"))

con:execute[[
    CREATE SOURCE IF NOT EXISTS counter
    FROM LOAD GENERATOR COUNTER
    (TICK INTERVAL '500ms')
    WITH (SIZE = '3xsmall')
]]

local cur = assert (con:execute"SHOW SOURCES")
local row = cur:fetch({}, 'a')
while row do
    print(dump(row))
    row = cur:fetch({}, 'a')
end

cur:close()
con:close()
env:close()
