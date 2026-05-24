"use client"

import { IconPlus } from "@tabler/icons-react"
import { useEffect, useState } from "react"

import { useLogRecipe } from "@/components/hooks/useLogRecipe"
import { useRecipes } from "@/components/hooks/useRecipes"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatRecipeLabel } from "@/lib/recipe"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type RecipeQuickAddProps = {
  selectedDate: string
  refreshKey?: number
  onMealLogged?: (mealDate: string) => void
  className?: string
}

export function RecipeQuickAdd({
  selectedDate,
  refreshKey = 0,
  onMealLogged,
  className,
}: RecipeQuickAddProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loggingId, setLoggingId] = useState<string | null>(null)
  const { recipes, loading, error } = useRecipes({
    search: debouncedSearch,
    refreshKey,
  })
  const { logRecipe } = useLogRecipe()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  async function handleLogRecipe(recipeId: string, label: string) {
    if (loggingId) return

    setLoggingId(recipeId)
    const result = await logRecipe(recipeId, selectedDate)
    setLoggingId(null)

    if (result) {
      toast.success(`${label} logged`)
      onMealLogged?.(result.mealDate)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Input
        type="search"
        placeholder="Search recipes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search recipes"
      />

      <div aria-busy={loading}>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <span
              className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
              aria-label="Loading recipes"
            />
          </div>
        )}

        {!loading && recipes.length === 0 && !error && (
          <p className="border border-dashed border-border bg-muted/20 px-4 py-4 text-center text-sm text-muted-foreground">
            {debouncedSearch.trim()
              ? "No recipes match your search."
              : "Save a recipe to log it in one tap."}
          </p>
        )}

        {!loading && recipes.length > 0 && (
          <ScrollArea className="h-[min(50vh,320px)]">
            <div className="space-y-2 pr-3">
              {recipes.map((recipe) => {
                const label = formatRecipeLabel(recipe)
                const isLogging = loggingId === recipe.id

                return (
                  <button
                    key={recipe.id}
                    type="button"
                    disabled={Boolean(loggingId)}
                    onClick={() => void handleLogRecipe(recipe.id, label)}
                    className="flex w-full cursor-pointer items-center justify-between border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="min-w-0 space-y-1">
                      <span className="line-clamp-2 text-sm font-medium capitalize">
                        {label}
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(recipe.nutrients.calories)} kcal
                        </span>
                        <div className="size-1 bg-primary" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(recipe.nutrients.protein)} g protein
                        </span>
                        <div className="size-1 bg-primary" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(recipe.nutrients.carbs)} g carbohydrates
                        </span>
                        <div className="size-1 bg-primary" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(recipe.nutrients.fat)} g fat
                        </span>
                      </div>
                    </div>
                    <IconPlus
                      className={cn(
                        "size-3.5 shrink-0",
                        isLogging && "animate-pulse"
                      )}
                      stroke={1.75}
                    />
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {!loading && error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
