"use client"

import { type RecipePayload } from "@/lib/recipe"
import { useCallback, useState } from "react"

export function useSaveRecipe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveRecipe = useCallback(
    async (payload: RecipePayload): Promise<{ id: string } | null> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? "Failed to save recipe")
          return null
        }

        return { id: data.recipe?.id ?? "" }
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

  return { saveRecipe, loading, error, resetError }
}
