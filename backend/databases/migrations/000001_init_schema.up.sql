-- 000001_init_schema.up.sql

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'tenant',
    email VARCHAR(255),
    phone VARCHAR(50),
    status CHAR(1) DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "market" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    total_stalls INT DEFAULT 0,
    description TEXT,
    status CHAR(1) DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "zone" (
    id SERIAL PRIMARY KEY,
    market_id INT NOT NULL REFERENCES "market"(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    total_stalls INT DEFAULT 0,
    status CHAR(1) DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "stall" (
    id SERIAL PRIMARY KEY,
    zone_id INT REFERENCES "zone"(id),
    ident VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    width DECIMAL(5, 2) NOT NULL,
    depth DECIMAL(5, 2) NOT NULL,
    area_sqm DECIMAL(6, 2) NOT NULL,
    daily_rent DECIMAL(10, 2) DEFAULT 0,
    monthly_rent DECIMAL(10, 2) DEFAULT 0,
    stall_status VARCHAR(50) DEFAULT 'available',
    floor VARCHAR(20) DEFAULT '1',
    coordinates_geojson TEXT,
    status CHAR(1) DEFAULT 'A',
    created_by INT REFERENCES "user"(id),
    updated_by INT REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "booking" (
    id SERIAL PRIMARY KEY,
    booking_no VARCHAR(50) UNIQUE NOT NULL,
    stall_id INT REFERENCES "stall"(id),
    stall_ident VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    applicant_email VARCHAR(255),
    business_type VARCHAR(255),
    visit_date VARCHAR(20) NOT NULL,
    visit_time VARCHAR(20) NOT NULL,
    note TEXT,
    booking_status VARCHAR(50) DEFAULT 'pending',
    queue_number INT DEFAULT 1,
    expires_at TIMESTAMP,
    status CHAR(1) DEFAULT 'A',
    created_by INT REFERENCES "user"(id),
    updated_by INT REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "application" (
    id SERIAL PRIMARY KEY,
    application_no VARCHAR(50) UNIQUE NOT NULL,
    stall_id INT REFERENCES "stall"(id),
    stall_ident VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    applicant_id_card VARCHAR(50),
    shop_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(255),
    lease_term_months INT DEFAULT 12,
    monthly_rate DECIMAL(10, 2) DEFAULT 0,
    application_state VARCHAR(50) DEFAULT 'submitted',
    reviewed_at TIMESTAMP,
    review_note TEXT,
    status CHAR(1) DEFAULT 'A',
    created_by INT REFERENCES "user"(id),
    updated_by INT REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "contract" (
    id SERIAL PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    application_id INT REFERENCES "application"(id),
    stall_id INT REFERENCES "stall"(id),
    stall_ident VARCHAR(50) NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_phone VARCHAR(50) NOT NULL,
    tenant_id_card VARCHAR(50),
    shop_name VARCHAR(255) NOT NULL,
    start_date VARCHAR(20) NOT NULL,
    end_date VARCHAR(20) NOT NULL,
    monthly_rental DECIMAL(10, 2) NOT NULL,
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    contract_state VARCHAR(50) DEFAULT 'active',
    status CHAR(1) DEFAULT 'A',
    created_by INT REFERENCES "user"(id),
    updated_by INT REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "item" (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status CHAR(1) DEFAULT 'A',
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
