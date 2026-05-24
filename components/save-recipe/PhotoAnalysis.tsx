"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { type AnalyzeResult } from "@/lib/meal"
import { toast } from "sonner"
import { useSaveRecipe } from "../hooks/useSaveRecipe"
import { NutrientsGrid } from "../log-meal/NutrientsGrid"
import { formatFoodsLabel } from "@/lib/meal"

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="size-full object-cover" />
    </div>
  )
}

type PhotoAnalysisProps = {
  onSaved: () => void
}

export default function PhotoAnalysis({ onSaved }: PhotoAnalysisProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [recipeName, setRecipeName] = useState("")
  const {
    saveRecipe,
    loading: saving,
    error: saveError,
    resetError,
  } = useSaveRecipe()

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

      {previewUrl && (
        <div className="grid grid-cols-2 gap-6">
          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Food preview
            </h2>
            <ImagePreview src={previewUrl} alt="Selected food" />
          </section>

          {result ? (
            <div className="w-full space-y-2 bg-card text-card-foreground">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Analysed nutrients
              </p>

              <div className="space-y-2">
                <Label htmlFor="recipe-name-photo">Recipe name</Label>
                <Input
                  id="recipe-name-photo"
                  value={recipeName}
                  disabled={saving}
                  onChange={(e) => setRecipeName(e.target.value)}
                />
              </div>

              {result.foods.length > 0 && (
                <p className="text-sm capitalize">{result.foods.join(", ")}</p>
              )}

              <NutrientsGrid nutrients={result.nutrients} />
            </div>
          ) : loading ? (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center gap-4 py-4"
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
          ) : (
            <div className="mt-5">
              <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                Note
              </p>
              <p className="text-xs">
                calories will be estimated and not exact values
              </p>
            </div>
          )}
        </div>
      )}

      {saveError && (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      )}

      {result ? (
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving…" : "Save recipe"}
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
