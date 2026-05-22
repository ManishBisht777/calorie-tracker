"use client"

import { IconPencil, IconTrash } from "@tabler/icons-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  formatFoodsLabel,
  formatMealDateLabel,
  NUTRIENT_LABELS,
  type MealEntry,
} from "@/lib/meal"
import { cn } from "@/lib/utils"
import { ScrollArea } from "./ui/scroll-area"

type DailyMealsListProps = {
  selectedDate: string
  refreshKey?: number
  onEdit: (meal: MealEntry) => void
  onMealsChanged?: () => void
  className?: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
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
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to delete meal")
        return
      }

      onDeleted()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="leading-snug font-medium">
            {formatFoodsLabel(meal.foods)}
          </p>
          {/* <p className="text-xs text-muted-foreground">
            {formatTime(meal.createdAt)}
          </p> */}
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

export function DailyMealsList({
  selectedDate,
  refreshKey = 0,
  onEdit,
  onMealsChanged,
  className,
}: DailyMealsListProps) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMeals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/meals?date=${selectedDate}`)
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
  }, [selectedDate])

  useEffect(() => {
    void loadMeals()
  }, [loadMeals, refreshKey])

  function handleDeleted() {
    void loadMeals()
    onMealsChanged?.()
  }

  return (
    <section className={cn("space-y-3", className)}>
      <header className="space-y-0.5">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Meals
        </h2>
        <p className="text-xs text-muted-foreground">
          {formatMealDateLabel(selectedDate)}
        </p>
      </header>

      <div
        className={cn(
          "transition-opacity duration-200",
          loading && "opacity-60"
        )}
        aria-busy={loading}
      >
        {!loading && meals.length === 0 && !error && (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No meals logged for this day yet.
          </p>
        )}

        {meals.length > 0 && (
          <ScrollArea className="h-[350px] pr-3">
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
          </ScrollArea>
        )}
      </div>
    </section>
  )
}
