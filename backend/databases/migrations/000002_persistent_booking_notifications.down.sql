DROP TABLE IF EXISTS "notification";
ALTER TABLE "booking" DROP COLUMN IF EXISTS appointment_group_id;
ALTER TABLE "booking" DROP COLUMN IF EXISTS project_name;
ALTER TABLE "booking" DROP COLUMN IF EXISTS market_name;
ALTER TABLE "booking" DROP COLUMN IF EXISTS market_id;
