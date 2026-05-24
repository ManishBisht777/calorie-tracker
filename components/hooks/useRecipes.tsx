"use client"

import { type Recipe } from "@/lib/recipe"
import { useCallback, useEffect, useState } from "react"

type UseRecipesOptions = {
  search?: string
  refreshKey?: number
}

export function useRecipes({ search = "", refreshKey = 0 }: UseRecipesOptions = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      const trimmed = search.trim()
      if (trimmed) params.set("q", trimmed)

      const query = params.toString()
      const res = await fetch(`/api/recipes${query ? `?${query}` : ""}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to load recipes")
        return
      }

      setRecipes(data.recipes ?? [])
    } catch {
      setError("Could not load recipes.")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    void loadRecipes()
  }, [loadRecipes, refreshKey])

  const resetError = useCallback(() => setError(null), [])

  return { recipes, loading, error, loadRecipes, resetError }
}
