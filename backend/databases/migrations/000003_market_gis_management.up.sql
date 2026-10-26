ALTER TABLE "stall" ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE "stall" ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE "stall" ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS "market_gis_config" (
    id BIGSERIAL PRIMARY KEY,
    market_id INT NOT NULL UNIQUE REFERENCES "market"(id),
    projects_json TEXT NOT NULL DEFAULT '[]',
    facilities_json TEXT NOT NULL DEFAULT '[]',
    published BOOLEAN DEFAULT FALSE,
    created_by INT REFERENCES "user"(id),
    updated_by INT REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "stall_audit_log" (
    id BIGSERIAL PRIMARY KEY,
    stall_id INT NOT NULL REFERENCES "stall"(id),
    action VARCHAR(50) NOT NULL,
    changes TEXT,
    actor_id INT REFERENCES "user"(id),
    actor_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stall_audit_log_stall_id ON "stall_audit_log"(stall_id);
CREATE INDEX IF NOT EXISTS idx_stall_audit_log_actor_id ON "stall_audit_log"(actor_id);
CREATE INDEX IF NOT EXISTS idx_stall_audit_log_created_at ON "stall_audit_log"(created_at);
