------ Seven Manhattan Antennas:
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9999, 40.7396] }, "properties": { "name": "W 15th St & 7th Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9849, 40.7454] }, "properties": { "name": "E 30th St & Madison Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9949, 40.7554] }, "properties": { "name": "W 37th St & 9th Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9985, 40.7266] }, "properties": { "name": "W Houston St & Wooster St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.981, 40.733] }, "properties": { "name": "1st Ave & E 17th St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9829, 40.7166] }, "properties": { "name": "Williamsburg Bridge & Pitt St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0075, 40.7126] }, "properties": { "name": "Broadway & Park Pl" } }');

------ Helper Antennas
-- W 15th St & 7th Ave (Helps Antenna ID: 1)
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9979, 40.7434] }, "properties": { "name": "W 21st St", "helps": "W 15th St & 7th Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0066, 40.7432] }, "properties": { "name": "460-454 W 16th St", "helps": "W 15th St & 7th Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0026, 40.7366] }, "properties": { "name": "227 W 11th St", "helps": "W 15th St & 7th Ave" } }');

-- E 30th St & Madison Ave (Helps Antenna ID: 2)
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9821, 40.7488] }, "properties": { "name": "201-217 Madison Ave", "helps": "E 30th St & Madison Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9793, 40.7434] }, "properties": { "name": "443 3rd Ave", "helps": "E 30th St & Madison Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9869, 40.7425] }, "properties": { "name": "36 Madison Ave", "helps": "E 30th St & Madison Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9896, 40.7473] }, "properties": { "name": "856 6th Ave", "helps": "E 30th St & Madison Ave" } }');

-- W 37th St & 9th Ave (Helps Antenna ID: 3)
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9926, 40.7586] }, "properties": { "name": "W 42nd St & 9th Ave", "helps": "W 37th St & 9th Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0004, 40.7580] }, "properties": { "name": "473-455 11th Ave", "helps": "W 37th St & 9th Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9886, 40.7535] }, "properties": { "name": "7th Avenue and & W 38th St", "helps": "W 37th St & 9th Ave" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9975, 40.7518] }, "properties": { "name": "370-380 9th Ave", "helps": "W 37th St & 9th Ave" } }');

-- W Houston St & Wooster St (Helps Antenna ID: 4)
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9955, 40.7295] }, "properties": { "name": "226-242 Greene St", "helps": "W Houston St & Wooster St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0028, 40.7285] }, "properties": { "name": "Greenwich Village", "helps": "W Houston St & Wooster St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0019, 40.7230] }, "properties": { "name": "Broome St", "helps": "W Houston St & Wooster St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9928, 40.7241] }, "properties": { "name": "E Houston St & Bowery", "helps": "W Houston St & Wooster St" } }');

-- 1st Ave & E 17th St (Helps Antenna ID: 5)
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9791, 40.7360] }, "properties": { "name": "375-361 1st Ave", "helps": "Ave & E 17th St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9743, 40.7303] }, "properties": { "name": "E 16th St", "helps": "Ave & E 17th St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9841, 40.7293] }, "properties": { "name": "177-171 1st Ave", "helps": "Ave & E 17th St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9879, 40.7353] }, "properties": { "name": "E 16th St & Irving Pl", "helps": "Ave & E 17th St" } }');

-- Williamsburg Bridge & Pitt St (Helps Antenna ID: 6)
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9768, 40.714] }, "properties": { "name": "FDR dr & Williamsburg Bridge", "helps": "Williamsburg Bridge & Pitt St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9810, 40.7211] }, "properties": { "name": "12-34 Avenue C", "helps": "Williamsburg Bridge & Pitt St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9873, 40.7184] }, "properties": { "name": "85 Delancey St", "helps": "Williamsburg Bridge & Pitt St" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-73.9851, 40.7130] }, "properties": { "name": "300 Madison St", "helps": "Williamsburg Bridge & Pitt St" } }');

-- Broadway & Park Pl (Helps Antenna ID: 7)
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0054, 40.715] }, "properties": { "name": "290 Broadway", "helps": "Broadway & Park Pl" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0013, 40.7101] }, "properties": { "name": "355-365 Pearl St", "helps": "Broadway & Park Pl" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0100, 40.7097] }, "properties": { "name": "140-172 Broadway", "helps": "Broadway & Park Pl" } }');
INSERT INTO antennas (geojson) VALUES ('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-74.0121, 40.7148] }, "properties": { "name": "240 Greenwich St 16th Floor", "helps": "Broadway & Park Pl" } }');