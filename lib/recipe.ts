import type { Nutrients } from "@/lib/meal"

export type RecipePayload = {
  name: string
  foods: string[]
  nutrients: Nutrients
}

export type Recipe = {
  id: string
  name: string
  foods: string[]
  nutrients: Nutrients
  createdAt: string
  updatedAt: string
}

export function formatRecipeLabel(recipe: Pick<Recipe, "name" | "foods">) {
  const trimmed = recipe.name.trim()
  if (trimmed) return trimmed
  if (recipe.foods.length === 0) return "Recipe"
  return recipe.foods.join(", ")
}

export function matchesRecipeSearch(
  recipe: Recipe,
  query: string
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  return (
    recipe.name.toLowerCase().includes(q) ||
    recipe.foods.some((food) => food.toLowerCase().includes(q))
  )
}
