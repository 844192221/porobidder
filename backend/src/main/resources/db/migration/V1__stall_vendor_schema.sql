CREATE TABLE IF NOT EXISTS vendors (
    vendor_id VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_vendors_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS stalls (
    stall_id VARCHAR(36) NOT NULL PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(16) NOT NULL,
    title VARCHAR(100) NOT NULL,
    manager_count INT NOT NULL,
    team_size INT NOT NULL,
    starting_budget INT NOT NULL,
    is_open TINYINT(1) NOT NULL,
    invite_code VARCHAR(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_stalls_vendor_id (vendor_id),
    INDEX idx_stalls_invite_code (invite_code)
);

CREATE TABLE IF NOT EXISTS stall_player_lots (
    lot_id VARCHAR(36) NOT NULL PRIMARY KEY,
    stall_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(50) NOT NULL,
    rank_level VARCHAR(30) NOT NULL,
    starting_bid INT NOT NULL,
    enabled TINYINT(1) NOT NULL,
    sort_order INT NOT NULL,
    game_profile JSON NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_stall_player_lots_stall_id (stall_id)
);

CREATE TABLE IF NOT EXISTS stall_joins (
    stall_id VARCHAR(36) NOT NULL,
    manager_id VARCHAR(50) NOT NULL,
    joined_at DATETIME(6) NOT NULL,
    PRIMARY KEY (stall_id, manager_id)
);
