CREATE TABLE IF NOT EXISTS "waitlist" (
    id BIGSERIAL PRIMARY KEY,
    stall_id INT,
    stall_ident VARCHAR(50) NOT NULL,
    market_id INT,
    market_name VARCHAR(255),
    project_name VARCHAR(255),
    tenant_id INT NOT NULL REFERENCES "user"(id),
    tenant_name VARCHAR(255),
    tenant_phone VARCHAR(50),
    position INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'waiting',
    offered_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    near_expiry_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_waitlist_stall_position ON "waitlist"(stall_ident, position);
CREATE INDEX IF NOT EXISTS idx_waitlist_tenant ON "waitlist"(tenant_id);

ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC DEFAULT 1800;
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS deposit_fee NUMERIC DEFAULT 1800;
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL;
ALTER TABLE "market" ADD COLUMN IF NOT EXISTS lease_application_deadline_days INT DEFAULT 3;
ALTER TABLE "market" ADD COLUMN IF NOT EXISTS waitlist_offer_hours INT DEFAULT 48;

CREATE TABLE IF NOT EXISTS "booking_stall" (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    sub_booking_id BIGINT NOT NULL,
    booking_no VARCHAR(50),
    appointment_group_id VARCHAR(100),
    market_id BIGINT DEFAULT 1,
    market_name VARCHAR(255),
    project_name VARCHAR(255),
    stall_id BIGINT,
    stall_ident VARCHAR(50) NOT NULL,
    monthly_rent NUMERIC DEFAULT 1800,
    deposit_fee NUMERIC DEFAULT 1800,
    status VARCHAR(50) DEFAULT 'pending_approval',
    cancel_reason TEXT,
    cancelled_by VARCHAR(50),
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_stall_sub_booking ON "booking_stall"(sub_booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_stall_group ON "booking_stall"(appointment_group_id);
CREATE INDEX IF NOT EXISTS idx_booking_stall_ident ON "booking_stall"(stall_ident);
