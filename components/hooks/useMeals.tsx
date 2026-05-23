"use client"

import { type MealEntry } from "@/lib/meal"
import { useCallback, useEffect, useState } from "react"

type UseMealsOptions = {
  date: string
  refreshKey?: number
}

export function useMeals({ date, refreshKey = 0 }: UseMealsOptions) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMeals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/meals?date=${date}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to load meals")
        return
      }

      setMeals(data.meals ?? [])
    } catch {
      setError("Could not load meals for this day.")
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    void loadMeals()
  }, [loadMeals, refreshKey])

  const resetError = useCallback(() => setError(null), [])

  return { meals, loading, error, loadMeals, resetError }
}
