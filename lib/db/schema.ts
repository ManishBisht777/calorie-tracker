import {
  date,
  jsonb,
  pgTable,
  real,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const mealEntries = pgTable("meal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  mealDate: date("meal_date").notNull(),
  foods: jsonb("foods").$type<string[]>().notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})
