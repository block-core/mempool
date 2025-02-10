-- Safely drop foreign key constraints
SELECT DISTINCT CONSTRAINT_NAME INTO @fk_name
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'blocks'
AND REFERENCED_TABLE_NAME = 'pools';

SET @drop_fk = CONCAT('ALTER TABLE blocks DROP FOREIGN KEY ', @fk_name);

-- Only execute if foreign key exists
SET @sql = IFNULL(@drop_fk, 'SELECT "No foreign key exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop all tables in correct order
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS pools;
DROP TABLE IF EXISTS statistics;
DROP TABLE IF EXISTS elements_pegs;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS state;

-- Create tables from scratch
-- Create state table with schema version 83
CREATE TABLE state (
    name varchar(25) NOT NULL,
    number int NULL,
    string varchar(100) NULL,
    CONSTRAINT name_unique UNIQUE (name)
) ENGINE=InnoDB;

INSERT INTO state VALUES('schema_version', 83, NULL);
INSERT INTO state VALUES('last_elements_block', 0, NULL);

-- Create pools table first (referenced by blocks)
CREATE TABLE pools (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name varchar(50) NOT NULL,
    link varchar(255) NOT NULL,
    addresses text NOT NULL,
    regexes text NOT NULL
) ENGINE=InnoDB;

-- Insert default pool
INSERT INTO pools (id, name, link, addresses, regexes) VALUES (-1, 'Unknown', '', '', '');

-- Create blocks table with explicit foreign key name
CREATE TABLE blocks (
    height int unsigned NOT NULL,
    hash varchar(65) NOT NULL,
    blockTimestamp timestamp NOT NULL,
    size int unsigned NOT NULL,
    weight int unsigned NOT NULL,
    tx_count smallint unsigned NOT NULL,
    coinbase_raw text,
    difficulty double NOT NULL,
    pool_id int DEFAULT -1,
    fees double unsigned NOT NULL,
    reward double unsigned NOT NULL DEFAULT 0,
    fee_span json NOT NULL,
    median_fee double unsigned NOT NULL,
    PRIMARY KEY (height),
    INDEX pool_idx (pool_id),
    CONSTRAINT blocks_pool_fk FOREIGN KEY (pool_id) REFERENCES pools(id)
) ENGINE=InnoDB;

-- Create statistics and prices tables
-- ...rest of table creation code...
