-- src/db/schema.sql

-- Drop tables if they exist
DROP TABLE IF EXISTS product_units CASCADE;
DROP TABLE IF EXISTS inventory_details CASCADE;
DROP TABLE IF EXISTS inventory_counts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS units CASCADE;

-- Create Units table
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    symbol VARCHAR(10) NOT NULL
);

-- Create Products table
CREATE TABLE products (
    code VARCHAR(20) PRIMARY KEY,
    code_int INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    pack_size DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    base_weekly_usage DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ProductUnits table
CREATE TABLE product_units (
    product_code VARCHAR(20) REFERENCES products(code),
    walk_unit_id INTEGER REFERENCES units(id),
    order_unit_id INTEGER REFERENCES units(id),
    weekly_usage_unit_id INTEGER REFERENCES units(id),
    conversion_factor DECIMAL(10,3) NOT NULL,
    PRIMARY KEY (product_code, walk_unit_id, order_unit_id)
);

-- Create InventoryCounts table
CREATE TABLE inventory_counts (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT gen_random_uuid(),
    count_date TIMESTAMP NOT NULL,
    sales_level INTEGER NOT NULL,
    scale_factor DECIMAL(5,2) NOT NULL,
    counted_by VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id)
);

-- Create InventoryDetails table
CREATE TABLE inventory_details (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES inventory_counts(session_id),
    product_code VARCHAR(20) REFERENCES products(code),
    instock_walk_unit DECIMAL(10,2) NOT NULL,
    calculated_order DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, product_code)
);

-- Insert basic units
INSERT INTO units (name, symbol) VALUES
('box', 'box'),
('bag', 'bag'),
('kilogram', 'kg'),
('each', 'ea'),
('bottle', 'bottle'),
('tub', 'tub'),
('tin', 'tin'),
('pack', 'pack'),
('can', 'can');