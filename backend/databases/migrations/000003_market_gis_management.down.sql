DROP TABLE IF EXISTS "stall_audit_log";
DROP TABLE IF EXISTS "market_gis_config";
ALTER TABLE "stall" DROP COLUMN IF EXISTS published;
ALTER TABLE "stall" DROP COLUMN IF EXISTS category;
ALTER TABLE "stall" DROP COLUMN IF EXISTS description;
