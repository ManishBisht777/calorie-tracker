import type { Nutrients } from "@/lib/meal"

export type DailyGoals = Nutrients

export const FALLBACK_DAILY_GOALS: DailyGoals = {
  calories: 2500,
  protein: 100,
  carbs: 100,
  fat: 70,
}

export async function fetchDailyGoals(): Promise<DailyGoals | null> {
  try {
    const res = await fetch("/api/goals")
    if (!res.ok) return null

    const data = await res.json()
    return data.goal?.nutrients ?? null
  } catch {
    return null
  }
}
