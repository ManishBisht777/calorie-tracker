ALTER TABLE "meal_entries" ADD COLUMN "meal_date" date;

UPDATE "meal_entries"
SET "meal_date" = ("created_at" AT TIME ZONE 'UTC')::date
WHERE "meal_date" IS NULL;

ALTER TABLE "meal_entries" ALTER COLUMN "meal_date" SET NOT NULL;
