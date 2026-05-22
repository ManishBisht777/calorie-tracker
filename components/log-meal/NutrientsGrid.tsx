import { NUTRIENT_LABELS, type Nutrients } from "@/lib/meal"

export function NutrientsGrid({ nutrients }: { nutrients: Nutrients }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {NUTRIENT_LABELS.map(({ key, label, unit }) => (
        <div
          key={key}
          className="border border-border bg-muted/40 px-3 py-2.5"
        >
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums">
            {Math.round(nutrients[key])}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {unit}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
