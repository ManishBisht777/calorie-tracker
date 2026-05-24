"use client"

import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { type AnalyzeResult, formatFoodsLabel } from "@/lib/meal"
import { useSaveRecipe } from "../hooks/useSaveRecipe"
import { NutrientsGrid } from "../log-meal/NutrientsGrid"
import { toast } from "sonner"
import { IconInfoCircle } from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type TextAnalysisProps = {
  onSaved: () => void
}

export default function TextAnalysis({ onSaved }: TextAnalysisProps) {
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [recipeName, setRecipeName] = useState("")
  const {
    saveRecipe,
    loading: saving,
    error: saveError,
    resetError,
  } = useSaveRecipe()

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

      const analyzed = data as AnalyzeResult
      setResult(analyzed)
      setRecipeName(formatFoodsLabel(analyzed.foods))
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result || saving) return

    const name = recipeName.trim() || formatFoodsLabel(result.foods)
    if (!name) {
      toast.error("Enter a recipe name")
      return
    }

    const saved = await saveRecipe({
      name,
      foods: result.foods,
      nutrients: result.nutrients,
    })
    if (saved) onSaved()
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
          <Label htmlFor="recipe-name-text">Recipe name</Label>
          <Input
            id="recipe-name-text"
            value={recipeName}
            disabled={saving}
            onChange={(e) => setRecipeName(e.target.value)}
          />
        </div>

        {saveError && (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving…" : "Save recipe"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="recipe-description">What&apos;s in this recipe?</Label>
        <Input
          id="recipe-description"
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
