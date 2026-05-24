"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  formatFoodsLabel,
  formatMealDateLabel,
  NUTRIENT_LABELS,
  type MealEntry,
  type Nutrients,
} from "@/lib/meal"

type ManualMealDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealDate: string
  onMealDateChange: (date: string) => void
  editMeal?: MealEntry | null
  onSaved: (
    mealDate: string,
    data: { foods: string[]; nutrients: Nutrients }
  ) => void
  onUpdated?: (mealDate: string) => void
}

const emptyNutrients = (): Nutrients => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
})

function parseNutrient(value: string) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function ManualMealDialog({
  open,
  onOpenChange,
  mealDate,
  onMealDateChange,
  editMeal = null,
  onSaved,
  onUpdated,
}: ManualMealDialogProps) {
  const isEditing = Boolean(editMeal)
  const [foodName, setFoodName] = useState("")
  const [nutrients, setNutrients] = useState<Nutrients>(emptyNutrients)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editMeal) {
      setFoodName(formatFoodsLabel(editMeal.foods))
      setNutrients(editMeal.nutrients)
      onMealDateChange(editMeal.mealDate)
    } else {
      setFoodName("")
      setNutrients(emptyNutrients())
    }
    setError(null)
  }, [open, editMeal, onMealDateChange])

  function resetForm() {
    setFoodName("")
    setNutrients(emptyNutrients())
    setError(null)
  }

  function handleOpenChange(next: boolean) {
    if (saving && !next) return
    if (!next) resetForm()
    onOpenChange(next)
  }

  async function handleSave() {
    const name = foodName.trim()
    if (!name) {
      setError("Enter a meal or food name")
      return
    }

    const parsed = NUTRIENT_LABELS.map(({ key }) =>
      parseNutrient(String(nutrients[key]))
    )
    if (parsed.some((v) => v === null)) {
      setError("Enter valid numbers for all nutrients")
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      foods: [name],
      nutrients: {
        calories: parsed[0]!,
        protein: parsed[1]!,
        carbs: parsed[2]!,
        fat: parsed[3]!,
      },
      mealDate,
    }

    try {
      const res = await fetch(
        isEditing ? `/api/meals/${editMeal!.id}` : "/api/meals",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error ??
            (isEditing ? "Failed to update meal" : "Failed to save meal")
        )
        return
      }

      const savedDate = data.mealDate ?? mealDate
      resetForm()
      onOpenChange(false)

      if (isEditing) {
        onUpdated?.(savedDate)
      } else {
        onSaved(savedDate, {
          foods: payload.foods,
          nutrients: payload.nutrients,
        })
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[min(90vh,40rem)] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="font-mono font-semibold tracking-wide">
            {isEditing ? "Edit meal" : "Log meal manually"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditing
              ? "Update this meal's name, date, and nutrition."
              : "Enter nutrition details yourself — no AI estimate."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="manual-food-name">Meal or food</Label>
            <Input
              id="manual-food-name"
              placeholder="e.g. Grilled chicken salad"
              value={foodName}
              disabled={saving}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-meal-date">Log for</Label>
            <Input
              id="manual-meal-date"
              type="date"
              value={mealDate}
              disabled={saving}
              onChange={(e) => onMealDateChange(e.target.value)}
            />
          </div>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Nutrition
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {NUTRIENT_LABELS.map(({ key, label, unit }) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`manual-${key}`}>
                    {label} ({unit})
                  </Label>
                  <Input
                    id={`manual-${key}`}
                    type="number"
                    min={0}
                    step={key === "calories" ? 1 : 0.1}
                    inputMode="decimal"
                    value={nutrients[key] === 0 ? "" : nutrients[key]}
                    placeholder="0"
                    disabled={saving}
                    onChange={(e) =>
                      setNutrients((prev) => ({
                        ...prev,
                        [key]:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving
              ? isEditing
                ? "Saving…"
                : "Saving…"
              : isEditing
                ? "Save changes"
                : "Save meal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
