"use client"

import { useCallback, useState } from "react"

export function useDeleteMeal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteMeal = useCallback(async (mealId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/meals/${mealId}`, { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to delete meal")
        return false
      }

      return true
    } catch {
      setError("Something went wrong. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const resetError = useCallback(() => setError(null), [])

  return { deleteMeal, loading, error, resetError }
}
