"use client"

import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
  type AnalyzeResult,
  formatMealDateLabel,
  toLocalDateString,
} from "@/lib/meal"
import { useSaveMeal } from "../hooks/useSaveMeal"
import { NutrientsGrid } from "./NutrientsGrid"
import { toast } from "sonner"

type TextAnalysisProps = {
  onSaved: (mealDate: string) => void
}

export default function TextAnalysis({ onSaved }: TextAnalysisProps) {
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [mealDate, setMealDate] = useState(() => toLocalDateString())
  const { saveMeal, loading: saving, error: saveError, resetError } = useSaveMeal()

  async function handleAnalyze() {
    const trimmed = description.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setResult(null)
    resetError()

    try {
      const res = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Request failed")
        return
      }

      setResult(data as AnalyzeResult)
      setMealDate(toLocalDateString())
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result || saving) return

    const saved = await saveMeal({ ...result, mealDate })
    if (saved) onSaved(saved.mealDate)
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 py-8"
      >
        <span
          className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-hidden
        />
        <div className="text-center">
          <p className="text-sm font-medium">Analyzing your meal</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimating calories and macros from your description…
          </p>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Estimated nutrition
          </p>
          <p className="text-sm">
            Log for{" "}
            <span className="font-medium">
              {formatMealDateLabel(mealDate)}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-meal-date">Log for</Label>
          <Input
            id="text-meal-date"
            type="date"
            value={mealDate}
            disabled={saving}
            onChange={(e) => setMealDate(e.target.value)}
          />
        </div>

        {result.foods.length > 0 && (
          <ul className="space-y-1.5">
            {result.foods.map((food, index) => (
              <li
                key={`${food}-${index}`}
                className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                {food}
              </li>
            ))}
          </ul>
        )}

        <NutrientsGrid nutrients={result.nutrients} />

        {saveError && (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? "Saving…" : "Save meal"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="meal-description">What did you eat?</Label>
        <Input
          id="meal-description"
          placeholder="e.g. 2 eggs, toast with butter, black coffee"
          value={description}
          disabled={loading || saving}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!description.trim() || loading || saving}
        className="w-full"
      >
        Estimate nutrition
      </Button>
    </div>
  )
}
