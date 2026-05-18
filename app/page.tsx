"use client"

import { ConfirmMealDialog } from "@/components/confirm-meal-dialog"
import { DailySummary } from "@/components/daily-summary"
import { ManualMealDialog } from "@/components/manual-meal-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type AnalyzeResult,
  formatMealDateLabel,
  NUTRIENT_LABELS,
  toLocalDateString,
} from "@/lib/meal"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"

type LogMode = "photo" | "text" | "manual"

const LOG_MODES: { id: LogMode; label: string; description: string }[] = [
  {
    id: "photo",
    label: "Photo",
    description: "Upload a food photo for AI analysis",
  },
  {
    id: "text",
    label: "By name",
    description: "Describe the meal and AI estimates macros",
  },
  {
    id: "manual",
    label: "Manual",
    description: "Enter all nutrition details yourself",
  },
]

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="size-full object-cover" />
    </div>
  )
}

function Loader({ message, imageSrc }: { message?: string; imageSrc?: string }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
      {imageSrc && <ImagePreview src={imageSrc} alt="Food being analyzed" />}
      <div
        role="status"
        aria-live="polite"
        aria-label="Analyzing meal"
        className="flex flex-col items-center gap-4 p-4"
      >
        <span
          className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-hidden
        />
        <div className="text-center">
          <p className="text-sm font-medium">Analyzing your meal</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {message ?? "Detecting foods and estimating nutrition…"}
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
  const [logMode, setLogMode] = useState<LogMode>("photo")
  const [file, setFile] = useState<File | null>(null)
  const [mealDescription, setMealDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [mealDate, setMealDate] = useState(() => toLocalDateString())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedMealDate, setSavedMealDate] = useState<string | null>(null)
  const [dashboardDate, setDashboardDate] = useState(() => toLocalDateString())
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0)

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
    setMealDescription("")
    setResult(null)
    setConfirmOpen(false)
    setError(null)
    setSaveError(null)
    setSavedMealDate(null)
    setMealDate(toLocalDateString())
  }

  function clearPendingAnalysis() {
    setError(null)
    setResult(null)
    setSaveError(null)
    setSavedMealDate(null)
    setConfirmOpen(false)
  }

  function handleModeChange(mode: LogMode) {
    if (loading || saving) return
    setLogMode(mode)
    clearPendingAnalysis()
    if (mode === "manual") {
      setManualOpen(true)
    }
  }

  function handleMealSaved(date: string, data: AnalyzeResult) {
    setResult(data)
    setSavedMealDate(date)
    setDashboardDate(date)
    setSummaryRefreshKey((k) => k + 1)
    setConfirmOpen(false)
    setManualOpen(false)
  }

  async function handleUpload() {
    if (!file || loading) return

    setLoading(true)
    clearPendingAnalysis()

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

  async function handleAnalyzeText() {
    const description = mealDescription.trim()
    if (!description || loading) return

    setLoading(true)
    clearPendingAnalysis()

    try {
      const res = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
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

      const savedDate = data.mealDate ?? mealDate
      handleMealSaved(savedDate, result)
    } catch {
      setSaveError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const showConfirm =
    result && !savedMealDate && (logMode === "text" || (logMode === "photo" && previewUrl))

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col gap-8 p-6">
      <DailySummary
        selectedDate={dashboardDate}
        onDateChange={(date) => {
          setDashboardDate(date)
          setMealDate(date)
        }}
        refreshKey={summaryRefreshKey}
      />

      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Log meal
          </h2>
          <p className="text-sm text-muted-foreground">
            Photo, describe by name, or enter nutrition manually.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Log meal method"
          className="grid grid-cols-3 gap-2"
        >
          {LOG_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={logMode === mode.id}
              disabled={loading || saving}
              onClick={() => handleModeChange(mode.id)}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-left transition-colors",
                logMode === mode.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <span className="block text-xs font-semibold">{mode.label}</span>
              <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                {mode.description}
              </span>
            </button>
          ))}
        </div>

        {logMode === "photo" && (
          <div className="flex flex-col gap-4">
            <Input
              type="file"
              accept="image/*"
              disabled={loading || saving}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                clearPendingAnalysis()
              }}
            />

            <Button
              onClick={handleUpload}
              disabled={!file || loading || saving}
              className="w-full"
            >
              {loading ? "Analyzing…" : "Analyze food"}
            </Button>
          </div>
        )}

        {logMode === "text" && (
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-description">What did you eat?</Label>
              <Input
                id="meal-description"
                placeholder="e.g. 2 eggs, toast with butter, black coffee"
                value={mealDescription}
                disabled={loading || saving}
                onChange={(e) => {
                  setMealDescription(e.target.value)
                  clearPendingAnalysis()
                }}
              />
            </div>

            <Button
              onClick={handleAnalyzeText}
              disabled={!mealDescription.trim() || loading || saving}
              className="w-full"
            >
              {loading ? "Estimating…" : "Estimate nutrition"}
            </Button>
          </div>
        )}

        {logMode === "manual" && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            <p>Enter meal name and macros yourself — no AI.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              disabled={loading || saving}
              onClick={() => setManualOpen(true)}
            >
              Open manual entry
            </Button>
          </div>
        )}
      </section>

      {previewUrl && logMode === "photo" && !loading && !result && !savedMealDate && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Preview
          </h2>
          <ImagePreview src={previewUrl} alt="Selected food" />
        </section>
      )}

      {loading && (
        <Loader
          imageSrc={logMode === "photo" ? (previewUrl ?? undefined) : undefined}
          message={
            logMode === "text"
              ? "Estimating calories and macros from your description…"
              : undefined
          }
        />
      )}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
          {previewUrl && logMode === "photo" && (
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

      {showConfirm && (
        <>
          <section className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {logMode === "photo" ? "Analysis ready" : "Estimate ready"} — review in the
            dialog, or{" "}
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
            imageSrc={logMode === "photo" ? previewUrl ?? undefined : undefined}
            mealDate={mealDate}
            onMealDateChange={setMealDate}
            onSave={handleSaveMeal}
            saving={saving}
            saveError={saveError}
          />
        </>
      )}

      <ManualMealDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        mealDate={mealDate}
        onMealDateChange={setMealDate}
        onSaved={(date, data) => handleMealSaved(date, data)}
      />
    </div>
  )
}
