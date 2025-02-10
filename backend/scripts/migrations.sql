-- First drop foreign keys safely
SET @db_name = DATABASE();
SET @table_name = 'blocks';

SELECT CONCAT('ALTER TABLE ', @table_name, ' DROP FOREIGN KEY ', CONSTRAINT_NAME, ';')
INTO @drop_fk_sql
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = @db_name
  AND TABLE_NAME = @table_name
  AND REFERENCED_TABLE_NAME = 'pools'
LIMIT 1;

SET @drop_sql = IFNULL(@drop_fk_sql, 'SELECT 1');
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop and recreate tables
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS pools;
DROP TABLE IF EXISTS statistics;
DROP TABLE IF EXISTS elements_pegs;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS state;

-- Create state table first
CREATE TABLE state (
    name varchar(25) NOT NULL,
    number int(11) NULL,
    string varchar(100) NULL,
    CONSTRAINT name_unique UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial state
INSERT INTO state VALUES('schema_version', 0, NULL);
INSERT INTO state VALUES('last_elements_block', 0, NULL);

-- Create pools table
CREATE TABLE pools (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    link varchar(255) NOT NULL,
    addresses text NOT NULL,
    regexes text NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create base blocks table
CREATE TABLE blocks (
    height int(11) unsigned NOT NULL,
    hash varchar(65) NOT NULL,
    blockTimestamp timestamp NOT NULL,
    size int(11) unsigned NOT NULL,
    weight int(11) unsigned NOT NULL,
    tx_count int(11) unsigned NOT NULL,
    coinbase_raw text,
    difficulty bigint(20) unsigned NOT NULL,
    pool_id int(11) DEFAULT -1,
    fees double unsigned NOT NULL,
    fee_span json NOT NULL,
    median_fee double unsigned NOT NULL,
    reward double unsigned NOT NULL DEFAULT 0,
    PRIMARY KEY (height),
    INDEX (pool_id),
    FOREIGN KEY (pool_id) REFERENCES pools (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create statistics table
CREATE TABLE statistics (
    id int(11) NOT NULL AUTO_INCREMENT,
    added datetime NOT NULL,
    unconfirmed_transactions int(11) UNSIGNED NOT NULL,
    tx_per_second float UNSIGNED NOT NULL,
    vbytes_per_second int(10) UNSIGNED NOT NULL,
    mempool_byte_weight int(10) UNSIGNED NOT NULL,
    fee_data longtext NOT NULL,
    total_fee double UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    INDEX added_idx (added)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default pool
INSERT INTO pools (id, name, link, addresses, regexes)
VALUES (-1, 'Unknown', '', '', '');

-- Set schema version to skip migrations
UPDATE state SET number = 83 WHERE name = 'schema_version';
