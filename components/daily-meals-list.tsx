"use client"

import { IconPencil, IconTrash } from "@tabler/icons-react"
import { useState } from "react"

import { useDeleteMeal } from "@/components/hooks/useDeleteMeal"
import { useMeals } from "@/components/hooks/useMeals"
import SaveRecipe from "@/components/save-recipe/SaveRecipe"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatFoodsLabel, NUTRIENT_LABELS, type MealEntry } from "@/lib/meal"
import { cn } from "@/lib/utils"

type DailyMealsListProps = {
  selectedDate: string
  refreshKey?: number
  onEdit: (meal: MealEntry) => void
  onMealsChanged?: () => void
  onRecipeSaved?: () => void
  className?: string
}

function MealCard({
  meal,
  onEdit,
  onDeleted,
}: {
  meal: MealEntry
  onEdit: (meal: MealEntry) => void
  onDeleted: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { deleteMeal, loading: deleting, error } = useDeleteMeal()

  async function handleDelete() {
    const deleted = await deleteMeal(meal.id)
    setConfirmDelete(false)

    if (deleted) {
      onDeleted()
    }
  }

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="leading-snug font-medium">
            {formatFoodsLabel(meal.foods)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${formatFoodsLabel(meal.foods)}`}
            disabled={deleting}
            onClick={() => onEdit(meal)}
          >
            <IconPencil className="size-4" stroke={1.75} />
          </Button>
          {!confirmDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${formatFoodsLabel(meal.foods)}`}
              disabled={deleting}
              onClick={() => setConfirmDelete(true)}
            >
              <IconTrash className="size-4 text-destructive" stroke={1.75} />
            </Button>
          ) : null}
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-4 gap-2">
        {NUTRIENT_LABELS.map(({ key, label, unit }) => (
          <div key={key} className="bg-muted/40 px-2 py-1.5 text-center">
            <dt className="text-[10px] text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums">
              {Math.round(meal.nutrients[key])}
              <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                {unit}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {confirmDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="flex-1 text-sm">Delete this meal?</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={() => void handleDelete()}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function MealCardSkeleton() {
  return (
    <div className="border border-border bg-card p-4" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="flex shrink-0 gap-1">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    </div>
  )
}

function MealsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-label="Loading meals"
    >
      {Array.from({ length: count }).map((_, index) => (
        <MealCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function DailyMealsList({
  selectedDate,
  refreshKey = 0,
  onEdit,
  onMealsChanged,
  onRecipeSaved,
  className,
}: DailyMealsListProps) {
  const { meals, loading, error, loadMeals } = useMeals({
    date: selectedDate,
    refreshKey,
  })
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false)

  function handleDeleted() {
    void loadMeals()
    onMealsChanged?.()
  }

  function handleRecipeSaved() {
    onRecipeSaved?.()
  }

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Meals
        </h2>
        <SaveRecipe
          open={recipeDialogOpen}
          onOpenChange={setRecipeDialogOpen}
          onRecipeSaved={handleRecipeSaved}
          trigger={
            <Button size="sm" variant="outline">
              Create Recipe
            </Button>
          }
        />
      </div>

      <div aria-busy={loading}>
        {loading ? (
          <MealsListSkeleton />
        ) : meals.length === 0 && !error ? (
          <p className="border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No meals logged for this day yet.
          </p>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onEdit={onEdit}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
