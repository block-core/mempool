-- Drop foreign keys safely using information_schema
SET @table_name = 'blocks';
SET @constraints = (
    SELECT GROUP_CONCAT(CONSTRAINT_NAME)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_NAME = @table_name
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND TABLE_SCHEMA = DATABASE()
);

SET @drop_fk_stmt = IF(@constraints IS NOT NULL,
    CONCAT('ALTER TABLE ', @table_name, ' DROP FOREIGN KEY ', @constraints),
    'SELECT 1');

PREPARE stmt FROM @drop_fk_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop and recreate tables with proper MySQL 8 syntax
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS pools;
DROP TABLE IF EXISTS statistics;
DROP TABLE IF EXISTS elements_pegs;
DROP TABLE IF EXISTS state;

-- Create state table
CREATE TABLE state (
    name varchar(25) NOT NULL,
    number int NULL,
    string varchar(100) NULL,
    CONSTRAINT name_unique UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create pools table
CREATE TABLE pools (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    link varchar(255) NOT NULL,
    addresses text NOT NULL,
    regexes text NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create blocks table
CREATE TABLE blocks (
    height int unsigned NOT NULL DEFAULT 0,
    hash varchar(65) NOT NULL,
    blockTimestamp timestamp NOT NULL,
    size int unsigned NOT NULL DEFAULT 0,
    weight int unsigned NOT NULL DEFAULT 0,
    tx_count smallint unsigned NOT NULL DEFAULT 0,
    coinbase_raw text,
    difficulty double NOT NULL DEFAULT 0,
    pool_id int DEFAULT -1,
    fees double unsigned NOT NULL DEFAULT 0,
    reward double unsigned NOT NULL DEFAULT 0,
    fee_span json NOT NULL,
    median_fee double unsigned NOT NULL DEFAULT 0,
    INDEX height_idx (height),
    INDEX pool_idx (pool_id),
    CONSTRAINT blocks_pool_fk FOREIGN KEY (pool_id) REFERENCES pools(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create prices table
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    USD DECIMAL(24,8) NOT NULL DEFAULT 0,
    EUR DECIMAL(24,8) NOT NULL DEFAULT 0,
    GBP DECIMAL(24,8) NOT NULL DEFAULT 0,
    CAD DECIMAL(24,8) NOT NULL DEFAULT 0,
    CHF DECIMAL(24,8) NOT NULL DEFAULT 0,
    AUD DECIMAL(24,8) NOT NULL DEFAULT 0,
    JPY DECIMAL(24,8) NOT NULL DEFAULT 0,
    INDEX time_index (time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add initial price data to prevent query errors
INSERT INTO prices (time, USD, EUR, GBP, CAD, CHF, AUD, JPY)
VALUES (CURRENT_TIMESTAMP, 0, 0, 0, 0, 0, 0, 0);

-- Initialize state
INSERT INTO state VALUES('schema_version', 83, NULL);
INSERT INTO state VALUES('last_elements_block', 0, NULL);
