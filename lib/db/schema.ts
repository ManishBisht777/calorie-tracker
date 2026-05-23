import {
  date,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import type {
  ActivityLevel,
  Gender,
  GoalIntensity,
  GoalType,
  ProteinAdjustment,
} from "@/lib/calorie-calculator"

export const userGoals = pgTable("user_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  gender: text("gender").$type<Gender>().notNull(),
  age: integer("age").notNull(),
  weightKg: real("weight_kg").notNull(),
  heightCm: real("height_cm").notNull(),
  activityLevel: text("activity_level").$type<ActivityLevel>().notNull(),
  goalType: text("goal_type").$type<GoalType>().notNull(),
  proteinAdjustment: text("protein_adjustment")
    .$type<ProteinAdjustment>()
    .notNull()
    .default("normal"),
  goalIntensity: text("goal_intensity")
    .$type<GoalIntensity>()
    .notNull()
    .default("moderate"),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

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
