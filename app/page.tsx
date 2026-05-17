"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useEffect, useMemo, useState } from "react"

type Nutrients = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

type AnalyzeResult = {
  foods: string[]
  nutrients: Nutrients
}

const NUTRIENT_LABELS: { key: keyof Nutrients; label: string; unit: string }[] =
  [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbs", label: "Carbs", unit: "g" },
    { key: "fat", label: "Fat", unit: "g" },
  ]

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

function AnalyzeResults({
  data,
  imageSrc,
}: {
  data: AnalyzeResult
  imageSrc: string
}) {
  return (
    <div className="w-full space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
      <section>
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Your photo
        </h2>
        <div className="mt-3">
          <ImagePreview src={imageSrc} alt="Captured food" />
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Foods detected
        </h2>
        {data.foods.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {data.foods.map((food, index) => (
              <li
                key={`${food}-${index}`}
                className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                {food}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No foods detected in this image.
          </p>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Estimated nutrition
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          {NUTRIENT_LABELS.map(({ key, label, unit }) => (
            <div
              key={key}
              className="rounded-md border border-border bg-muted/40 px-3 py-3"
            >
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {Math.round(data.nutrients[key])}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)

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
    setError(null)
    setResult(null)

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
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
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
          disabled={loading}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setError(null)
            setResult(null)
          }}
        />

        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? "Analyzing…" : "Analyze Food"}
        </Button>
      </div>

      {previewUrl && !loading && !result && (
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

      {!loading && result && previewUrl && (
        <AnalyzeResults data={result} imageSrc={previewUrl} />
      )}
    </div>
  )
}
