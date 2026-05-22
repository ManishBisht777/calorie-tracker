"use client"

import { type AnalyzeResult } from "@/lib/meal"
import { useCallback, useState } from "react"

type SaveMealPayload = AnalyzeResult & { mealDate: string }

export function useSaveMeal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveMeal = useCallback(
    async (payload: SaveMealPayload): Promise<{ mealDate: string } | null> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            foods: payload.foods,
            nutrients: payload.nutrients,
            mealDate: payload.mealDate,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? "Failed to save meal")
          return null
        }

        return { mealDate: data.mealDate ?? payload.mealDate }
      } catch {
        setError("Something went wrong. Please try again.")
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const resetError = useCallback(() => setError(null), [])

  return { saveMeal, loading, error, resetError }
}
