"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  formatMealDateLabel,
  NUTRIENT_LABELS,
  type Nutrients,
  toLocalDateString,
} from "@/lib/meal"
import { useSaveMeal } from "../hooks/useSaveMeal"

type ManualEntryProps = {
  onSaved: (mealDate: string) => void
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

export default function ManualEntry({ onSaved }: ManualEntryProps) {
  const [foodName, setFoodName] = useState("")
  const [nutrients, setNutrients] = useState<Nutrients>(emptyNutrients)
  const [mealDate, setMealDate] = useState(() => toLocalDateString())
  const [validationError, setValidationError] = useState<string | null>(null)
  const { saveMeal, loading: saving, error: saveError, resetError } = useSaveMeal()

  async function handleSave() {
    const name = foodName.trim()
    if (!name) {
      setValidationError("Enter a meal or food name")
      return
    }

    const parsed = NUTRIENT_LABELS.map(({ key }) =>
      parseNutrient(String(nutrients[key]))
    )
    if (parsed.some((v) => v === null)) {
      setValidationError("Enter valid numbers for all nutrients")
      return
    }

    setValidationError(null)
    resetError()

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

    const saved = await saveMeal(payload)
    if (saved) onSaved(saved.mealDate)
  }

  const error = validationError ?? saveError

  return (
    <div className="space-y-5">
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
          onChange={(e) => setMealDate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Saves to{" "}
          <span className="text-foreground">
            {formatMealDateLabel(mealDate)}
          </span>
        </p>
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
                    [key]: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="w-full"
      >
        {saving ? "Saving…" : "Save meal"}
      </Button>
    </div>
  )
}
