export type Gender = "male" | "female"
export type ActivityLevel = "low" | "middle" | "high" | "very_high"
export type GoalType = "lose" | "lose_10" | "maintain" | "gain"
export type GoalIntensity = "mild" | "moderate" | "aggressive"
export type ProteinAdjustment = "low" | "normal" | "high"

export type BodyParams = {
  gender: Gender
  age: number
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  goalType: GoalType
}

export type MacroResult = {
  calories: number
  protein: number
  carbs: number
  fat: number
  proteinPercent: number
  carbsPercent: number
  fatPercent: number
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  low: 1.2,
  middle: 1.55,
  high: 1.725,
  very_high: 1.9,
}

const PROTEIN_G_PER_KG: Record<ProteinAdjustment, number> = {
  low: 1.6,
  normal: 2.0,
  high: 2.4,
}

const CALORIE_SURPLUS: Record<GoalIntensity, number> = {
  mild: 200,
  moderate: 300,
  aggressive: 500,
}

const CALORIE_DEFICIT: Record<GoalIntensity, number> = {
  mild: 250,
  moderate: 500,
  aggressive: 750,
}

const WEIGHT_LOSS_PERCENT: Record<GoalIntensity, number> = {
  mild: 0.05,
  moderate: 0.1,
  aggressive: 0.15,
}

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  low: "Little or no exercise — desk job, minimal daily movement.",
  middle:
    "Moderate activity — exercise 3–5 days per week or an active job.",
  high: "Very active — hard exercise 6–7 days per week.",
  very_high:
    "Extremely active — intense daily training or physical labor.",
}

export function calculateBmr(params: Pick<BodyParams, "gender" | "age" | "weightKg" | "heightCm">) {
  const { gender, age, weightKg, heightCm } = params
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === "male" ? base + 5 : base - 161
}

export function calculateTdee(params: BodyParams) {
  const bmr = calculateBmr(params)
  return bmr * ACTIVITY_MULTIPLIERS[params.activityLevel]
}

export function calculateTargetCalories(
  params: BodyParams,
  goalIntensity: GoalIntensity = "moderate"
) {
  const tdee = calculateTdee(params)

  switch (params.goalType) {
    case "lose":
      return Math.max(1200, tdee - CALORIE_DEFICIT[goalIntensity])
    case "lose_10":
      return Math.max(1200, tdee * (1 - WEIGHT_LOSS_PERCENT[goalIntensity]))
    case "maintain":
      return tdee
    case "gain":
      return tdee + CALORIE_SURPLUS[goalIntensity]
  }
}

export function getGoalAdjustmentLabel(
  goalType: GoalType,
  goalIntensity: GoalIntensity
): string {
  switch (goalType) {
    case "lose":
      return `Weight loss (-${CALORIE_DEFICIT[goalIntensity]} kcal)`
    case "lose_10":
      return `Weight loss (-${Math.round(WEIGHT_LOSS_PERCENT[goalIntensity] * 100)}%)`
    case "maintain":
      return "Maintenance"
    case "gain":
      return `Lean bulk (+${CALORIE_SURPLUS[goalIntensity]} kcal)`
  }
}

export function calculateMacros(
  params: BodyParams,
  proteinAdjustment: ProteinAdjustment = "normal",
  goalIntensity: GoalIntensity = "moderate"
): MacroResult {
  const calories = Math.round(calculateTargetCalories(params, goalIntensity))
  const protein = Math.round(params.weightKg * PROTEIN_G_PER_KG[proteinAdjustment])
  const proteinCalories = protein * 4

  const fatCalories = calories * 0.25
  const fat = Math.round(fatCalories / 9)

  const carbsCalories = Math.max(0, calories - proteinCalories - fatCalories)
  const carbs = Math.round(carbsCalories / 4)

  const totalMacroCalories = protein * 4 + carbs * 4 + fat * 9
  const denominator = totalMacroCalories || 1

  return {
    calories,
    protein,
    carbs,
    fat,
    proteinPercent: Math.round(((protein * 4) / denominator) * 1000) / 10,
    carbsPercent: Math.round(((carbs * 4) / denominator) * 1000) / 10,
    fatPercent: Math.round(((fat * 9) / denominator) * 1000) / 10,
  }
}

export function isValidBodyParams(value: unknown): value is BodyParams {
  if (!value || typeof value !== "object") return false

  const v = value as Record<string, unknown>

  if (v.gender !== "male" && v.gender !== "female") return false
  if (typeof v.age !== "number" || v.age < 13 || v.age > 120) return false
  if (typeof v.weightKg !== "number" || v.weightKg < 30 || v.weightKg > 300)
    return false
  if (typeof v.heightCm !== "number" || v.heightCm < 100 || v.heightCm > 250)
    return false

  const activityLevels: ActivityLevel[] = ["low", "middle", "high", "very_high"]
  const goalTypes: GoalType[] = ["lose", "lose_10", "maintain", "gain"]

  if (!activityLevels.includes(v.activityLevel as ActivityLevel)) return false
  if (!goalTypes.includes(v.goalType as GoalType)) return false

  return true
}
