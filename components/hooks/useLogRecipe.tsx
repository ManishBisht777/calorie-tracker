"use client"

import { useCallback, useState } from "react"

export function useLogRecipe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const logRecipe = useCallback(
    async (
      recipeId: string,
      mealDate: string
    ): Promise<{ mealDate: string } | null> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/recipes/${recipeId}/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealDate }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? "Failed to log recipe")
          return null
        }

        return { mealDate: data.mealDate ?? mealDate }
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

  return { logRecipe, loading, error, resetError }
}
