"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
  type AnalyzeResult,
  formatMealDateLabel,
  toLocalDateString,
} from "@/lib/meal"
import { toast } from "sonner"
import { useSaveMeal } from "../hooks/useSaveMeal"
import { NutrientsGrid } from "./NutrientsGrid"

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="size-full object-cover" />
    </div>
  )
}

type PhotoAnalysisProps = {
  onSaved: (mealDate: string) => void
}

export default function PhotoAnalysis({ onSaved }: PhotoAnalysisProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [mealDate, setMealDate] = useState(() => toLocalDateString())
  const {
    saveMeal,
    loading: saving,
    error: saveError,
    resetError,
  } = useSaveMeal()

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  )

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  async function handleUpload() {
    if (!file || loading) return

    setLoading(true)
    setResult(null)
    resetError()

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
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
      <div className="space-y-4">
        {previewUrl && (
          <ImagePreview src={previewUrl} alt="Food being analyzed" />
        )}
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 py-4"
        >
          <span
            className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
            aria-hidden
          />
          <div className="text-center">
            <p className="text-sm font-medium">Analyzing your meal</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Detecting foods and estimating nutrition…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!result && (
        <Input
          type="file"
          accept="image/*"
          disabled={loading || saving}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setResult(null)
            resetError()
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-6">
        {previewUrl && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Food preview
            </h2>
            <ImagePreview src={previewUrl} alt="Selected food" />
          </section>
        )}

        {result && (
          <div className="w-full space-y-4 bg-card text-card-foreground">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Analysed nutrients
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-meal-date">Log for</Label>
              <Input
                id="photo-meal-date"
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
          </div>
        )}
      </div>

      {result ? (
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving…" : "Save meal"}
        </Button>
      ) : (
        <Button
          onClick={handleUpload}
          disabled={!file || loading || saving}
          className="w-full"
        >
          Analyze food
        </Button>
      )}
    </div>
  )
}
