-- The table containing account information.
-- Every account is associated with a unique
-- owner, but each owner may have multiple
-- accounts.
CREATE TABLE account_information (
	account_id 		BIGINT,
	account_owner 	BIGINT,
	PRIMARY KEY (account_id)
);

-- For Materielize to continously watch the changes
-- to the account_information table, it must have
-- full replication
ALTER TABLE account_information REPLICA IDENTITY FULL;

-- The table will additionally be part of a publication
-- that Materialize will watch.
CREATE PUBLICATION mz_source FOR TABLE account_information;

-- Insert some dummy data for us to work with in the demonstration.
-- In the real world, this data would be continously updated by
-- some service as users created new accounts.
INSERT INTO account_information (account_owner, account_id)
VALUES
	(1, 0),
	(1, 1),
	(1, 2),
	(2, 3),
	(2, 4),
	(3, 5);
