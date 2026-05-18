"use client"

import { ConfirmMealDialog } from "@/components/confirm-meal-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type AnalyzeResult,
  formatMealDateLabel,
  NUTRIENT_LABELS,
  toLocalDateString,
} from "@/lib/meal"
import { useEffect, useMemo, useState } from "react"

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="size-full object-cover" />
    </div>
  )
}

function Loader({ imageSrc }: { imageSrc?: string }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
      {imageSrc && <ImagePreview src={imageSrc} alt="Food being analyzed" />}
      <div
        role="status"
        aria-live="polite"
        aria-label="Analyzing food image"
        className="flex flex-col items-center gap-4 p-4"
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

function SavedMealSummary({
  data,
  mealDate,
  onLogAnother,
}: {
  data: AnalyzeResult
  mealDate: string
  onLogAnother: () => void
}) {
  return (
    <div className="w-full space-y-4 rounded-lg border border-border bg-card p-6 text-card-foreground">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Saved
        </p>
        <p className="text-sm">
          Meal logged for{" "}
          <span className="font-medium">{formatMealDateLabel(mealDate)}</span>.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        {NUTRIENT_LABELS.map(({ key, label, unit }) => (
          <div
            key={key}
            className="rounded-md border border-border bg-muted/40 px-3 py-2.5"
          >
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums">
              {Math.round(data.nutrients[key])}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {unit}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <Button type="button" variant="outline" className="w-full" onClick={onLogAnother}>
        Log another meal
      </Button>
    </div>
  )
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [mealDate, setMealDate] = useState(() => toLocalDateString())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedMealDate, setSavedMealDate] = useState<string | null>(null)

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  )

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function resetForNewMeal() {
    setFile(null)
    setResult(null)
    setConfirmOpen(false)
    setError(null)
    setSaveError(null)
    setSavedMealDate(null)
    setMealDate(toLocalDateString())
  }

  async function handleUpload() {
    if (!file || loading) return

    setLoading(true)
    setError(null)
    setResult(null)
    setSaveError(null)
    setSavedMealDate(null)
    setConfirmOpen(false)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Request failed")
        return
      }

      setResult(data as AnalyzeResult)
      setMealDate(toLocalDateString())
      setConfirmOpen(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveMeal() {
    if (!result || saving) return

    setSaving(true)
    setSaveError(null)

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foods: result.foods,
          nutrients: result.nutrients,
          mealDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save meal")
        return
      }

      setSavedMealDate(data.mealDate ?? mealDate)
      setConfirmOpen(false)
    } catch {
      setSaveError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col gap-8 p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Calorie Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Upload a food photo to estimate calories and macros.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Input
          type="file"
          accept="image/*"
          disabled={loading || saving}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setError(null)
            setResult(null)
            setSaveError(null)
            setSavedMealDate(null)
            setConfirmOpen(false)
          }}
        />

        <Button
          onClick={handleUpload}
          disabled={!file || loading || saving}
          className="w-full"
        >
          {loading ? "Analyzing…" : "Analyze Food"}
        </Button>
      </div>

      {previewUrl && !loading && !result && !savedMealDate && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Preview
          </h2>
          <ImagePreview src={previewUrl} alt="Selected food" />
        </section>
      )}

      {loading && <Loader imageSrc={previewUrl ?? undefined} />}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
          {previewUrl && (
            <div className="mt-4">
              <ImagePreview src={previewUrl} alt="Selected food" />
            </div>
          )}
        </div>
      )}

      {savedMealDate && result && (
        <SavedMealSummary
          data={result}
          mealDate={savedMealDate}
          onLogAnother={resetForNewMeal}
        />
      )}

      {result && previewUrl && !savedMealDate && (
        <>
          <section className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Analysis ready — review in the dialog, or{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-2"
              onClick={() => setConfirmOpen(true)}
            >
              open it again
            </button>
            .
          </section>

          <ConfirmMealDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            data={result}
            imageSrc={previewUrl}
            mealDate={mealDate}
            onMealDateChange={setMealDate}
            onSave={handleSaveMeal}
            saving={saving}
            saveError={saveError}
          />
        </>
      )}
    </div>
  )
}
