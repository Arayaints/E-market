ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS market_id INT;
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS market_name VARCHAR(255);
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS project_name VARCHAR(255);
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS appointment_group_id VARCHAR(100);

CREATE TABLE IF NOT EXISTS "notification" (
    id BIGSERIAL PRIMARY KEY,
    recipient_role VARCHAR(30) NOT NULL,
    recipient_user_id INT REFERENCES "user"(id),
    recipient_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    status_code VARCHAR(50),
    status_label VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    message TEXT,
    booking_id INT REFERENCES "booking"(id),
    booking_number VARCHAR(50),
    stall_number VARCHAR(50),
    market_name VARCHAR(255),
    project_name VARCHAR(255),
    target_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_recipient_role ON "notification"(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notification_recipient_user_id ON "notification"(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON "notification"(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON "notification"(created_at);
