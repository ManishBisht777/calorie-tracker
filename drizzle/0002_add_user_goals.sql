CREATE TABLE "user_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"gender" text NOT NULL,
	"age" integer NOT NULL,
	"weight_kg" real NOT NULL,
	"height_cm" real NOT NULL,
	"activity_level" text NOT NULL,
	"goal_type" text NOT NULL,
	"protein_adjustment" text DEFAULT 'normal' NOT NULL,
	"calories" real NOT NULL,
	"protein" real NOT NULL,
	"carbs" real NOT NULL,
	"fat" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
