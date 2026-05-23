"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  type AnalyzeResult,
  formatMealDateLabel,
  toLocalDateString,
} from "@/lib/meal"
import { useSaveMeal } from "../hooks/useSaveMeal"
import { NutrientsGrid } from "./NutrientsGrid"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { IconInfoCircle } from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type TextAnalysisProps = {
  onSaved: (mealDate: string) => void
}

export default function TextAnalysis({ onSaved }: TextAnalysisProps) {
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [mealDate, setMealDate] = useState(() => toLocalDateString())
  const {
    saveMeal,
    loading: saving,
    error: saveError,
    resetError,
  } = useSaveMeal()

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
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Estimated nutrition
          </p>

          <Tooltip>
            <TooltipTrigger>
              <IconInfoCircle className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                All calories will estimated and not represent the exact values
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-2">
          {result.foods.length > 0 && (
            <p className="text-sm capitalize">{result.foods.join(", ")}</p>
          )}

          <NutrientsGrid nutrients={result.nutrients} />
        </div>

        <div className="space-y-2">
          <DatePicker
            value={new Date(mealDate)}
            onChange={(date) =>
              setMealDate(date?.toISOString() ?? toLocalDateString())
            }
          />
          <p className="text-xs text-muted-foreground">
            Saves to{" "}
            <span className="text-foreground">
              {formatMealDateLabel(mealDate)}
            </span>
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
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
