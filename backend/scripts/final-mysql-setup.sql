-- Drop tables in correct order to avoid foreign key constraints
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS pools;
DROP TABLE IF EXISTS statistics;
DROP TABLE IF EXISTS elements_pegs;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS state;

-- Create state table first
CREATE TABLE state (
    name varchar(25) NOT NULL,
    number int NULL,
    string varchar(100) NULL,
    CONSTRAINT name_unique UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert initial state values
INSERT INTO state VALUES('schema_version', 83, NULL);
INSERT INTO state VALUES('last_elements_block', 0, NULL);

-- Create pools table with all required columns
CREATE TABLE pools (
    id int NOT NULL AUTO_INCREMENT,
    unique_id varchar(100) NOT NULL,
    name varchar(50) NOT NULL,
    link varchar(255) NOT NULL,
    addresses json NOT NULL,
    regexes json NOT NULL,
    slug varchar(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_id_idx (unique_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default pool with all required fields
INSERT INTO pools (id, unique_id, name, link, addresses, regexes, slug)
VALUES (
    -1,
    'unknown',
    'Unknown',
    'https://learnmeabitcoin.com/technical/coinbase-transaction',
    '[]',
    '[]',
    'unknown'
);

-- Create blocks table with updated schema
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create other required tables
CREATE TABLE statistics (
    id int AUTO_INCREMENT PRIMARY KEY,
    added datetime NOT NULL,
    unconfirmed_transactions int unsigned NOT NULL,
    tx_per_second float unsigned NOT NULL,
    vbytes_per_second int unsigned NOT NULL,
    mempool_byte_weight int unsigned NOT NULL,
    fee_data longtext NOT NULL,
    total_fee double unsigned NOT NULL,
    INDEX added_idx (added)
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
    INDEX time_idx (time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add initial price data
INSERT INTO prices (time, USD, EUR, GBP, CAD, CHF, AUD, JPY)
VALUES (CURRENT_TIMESTAMP, 0, 0, 0, 0, 0, 0, 0);
