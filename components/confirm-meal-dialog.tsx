"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  type AnalyzeResult,
  formatMealDateLabel,
  NUTRIENT_LABELS,
} from "@/lib/meal"

function MealPreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-muted/30"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="size-full object-cover" />
    </div>
  )
}

type ConfirmMealDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AnalyzeResult
  imageSrc: string
  mealDate: string
  onMealDateChange: (date: string) => void
  onSave: () => void
  saving: boolean
  saveError: string | null
}

export function ConfirmMealDialog({
  open,
  onOpenChange,
  data,
  imageSrc,
  mealDate,
  onMealDateChange,
  onSave,
  saving,
  saveError,
}: ConfirmMealDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving && !next) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[min(90vh,40rem)] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle>Confirm your meal</DialogTitle>
          <DialogDescription>
            Review the estimate below, then save it to{" "}
            <span className="text-foreground">{formatMealDateLabel(mealDate)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <MealPreview src={imageSrc} alt="Meal to confirm" />

          <div className="space-y-2">
            <Label htmlFor="meal-date">Log for</Label>
            <Input
              id="meal-date"
              type="date"
              value={mealDate}
              disabled={saving}
              onChange={(e) => onMealDateChange(e.target.value)}
            />
          </div>

          <section>
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Foods detected
            </h3>
            {data.foods.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
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
              <p className="mt-2 text-sm text-muted-foreground">
                No foods detected — you can still save the nutrition estimate.
              </p>
            )}
          </section>

          <Separator />

          <section>
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Estimated nutrition
            </h3>
            <dl className="mt-2 grid grid-cols-2 gap-2">
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
          </section>

          {saveError && (
            <p role="alert" className="text-sm text-destructive">
              {saveError}
            </p>
          )}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={onSave}>
            {saving ? "Saving…" : "Save meal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
