"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { NUTRIENT_LABELS, type Nutrients } from "@/lib/meal"
import { useSaveRecipe } from "../hooks/useSaveRecipe"

type ManualEntryProps = {
  onSaved: () => void
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
  const [recipeName, setRecipeName] = useState("")
  const [nutrients, setNutrients] = useState<Nutrients>(emptyNutrients)
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    saveRecipe,
    loading: saving,
    error: saveError,
    resetError,
  } = useSaveRecipe()

  async function handleSave() {
    const name = recipeName.trim()
    if (!name) {
      setValidationError("Enter a recipe name")
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
      name,
      foods: [name],
      nutrients: {
        calories: parsed[0]!,
        protein: parsed[1]!,
        carbs: parsed[2]!,
        fat: parsed[3]!,
      },
    }

    const saved = await saveRecipe(payload)
    if (saved) onSaved()
  }

  const error = validationError ?? saveError

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="manual-recipe-name">Recipe name</Label>
        <Input
          id="manual-recipe-name"
          placeholder="e.g. Grilled chicken salad"
          value={recipeName}
          disabled={saving}
          onChange={(e) => setRecipeName(e.target.value)}
        />
      </div>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Nutrition
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {NUTRIENT_LABELS.map(({ key, label, unit }) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`recipe-manual-${key}`}>
                {label} ({unit})
              </Label>
              <Input
                id={`recipe-manual-${key}`}
                min={0}
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
        {saving ? "Saving…" : "Save recipe"}
      </Button>
    </div>
  )
}
