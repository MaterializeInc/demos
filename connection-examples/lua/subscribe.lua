local utils = require "utils"
local driver = require "luasql.postgres"
local env = assert (driver.postgres())
local State = require("state")
local con = assert(env:connect("postgresql://MATERIALIZE_USERNAME:MATERIALIZE_PASSWORD@MATERIALIZE_HOST:6875/materialize?sslmode=require"))
con:setautocommit(false)

assert (con:execute("DECLARE c CURSOR FOR SUBSCRIBE (SELECT sum FROM counter_sum) WITH (PROGRESS);"))

while(true) do
    local buffer = {};
    local state = State:new(false)

    for mz_timestamp, mz_progressed, mz_diff, sum in utils.rows(con,"FETCH ALL c") do
        -- Map row fields
        local ts = mz_timestamp
        local progress = mz_progressed
        local diff = mz_diff

        -- When a progress is detected, get the last values
        if progress ~= 'f' then
            if updated then
                updated = false;

                -- Update state
                state:update(buffer, ts);
                buffer = {};

                -- Print state
                print("Sum: ", table.concat(state:getState(), ','));
            end
        else
            -- Update the state with the last data
            updated = true
            local update = {
                value = sum,
                diff = tonumber(diff)
            }
            table.insert(buffer, update);
        end
    end
end

con:commit()
con:close()

con:close()
env:close()
