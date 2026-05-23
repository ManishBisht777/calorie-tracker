import type {
  ActivityLevel,
  BodyParams,
  GoalIntensity,
  GoalType,
  ProteinAdjustment,
} from "@/lib/calorie-calculator"

export const EASE_OUT = [0.23, 1, 0.32, 1] as const

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "middle", label: "Middle" },
  { id: "high", label: "High" },
  { id: "very_high", label: "Very high" },
]

export const GOAL_TYPES: { id: GoalType; label: string }[] = [
  { id: "lose", label: "Lose" },
  { id: "lose_10", label: "Lose 10%" },
  { id: "maintain", label: "Maintain" },
  { id: "gain", label: "Gain" },
]

export const PROTEIN_LEVELS: { id: ProteinAdjustment; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
]

export const GOAL_INTENSITY_LEVELS: { id: GoalIntensity; label: string }[] = [
  { id: "mild", label: "Mild" },
  { id: "moderate", label: "Moderate" },
  { id: "aggressive", label: "Aggressive" },
]

export const DEFAULT_FORM: BodyParams = {
  gender: "male",
  age: 28,
  weightKg: 78,
  heightCm: 181,
  activityLevel: "middle",
  goalType: "lose_10",
}
