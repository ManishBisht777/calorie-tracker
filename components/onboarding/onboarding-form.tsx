"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ACTIVITY_DESCRIPTIONS, type BodyParams } from "@/lib/calorie-calculator"
import { cn } from "@/lib/utils"

import { ACTIVITY_LEVELS, GOAL_TYPES } from "./constants"
import { DiscreteSlider } from "./discrete-slider"

export function OnboardingForm({
  form,
  onChange,
  onClear,
  onCalculate,
  showResults = false,
  inverted,
}: {
  form: BodyParams
  onChange: (next: BodyParams) => void
  onClear: () => void
  onCalculate: () => void
  showResults?: boolean
  inverted?: boolean
  compact?: boolean
}) {
  const activityDescription = ACTIVITY_DESCRIPTIONS[form.activityLevel]
  const canCalculate =
    form.age >= 13 && form.weightKg >= 30 && form.heightCm >= 100

  const labelClass = inverted
    ? "text-primary-foreground/80"
    : "text-muted-foreground"
  const inputClass = inverted
    ? "border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:border-primary-foreground"
    : ""

  return (
    <div className={cn("flex flex-col space-y-8")}>
      <div>
        <h2 className="text-xl font-bold tracking-wide uppercase">
          Body parameters
        </h2>
      </div>

      <div className="flex gap-2">
        <Button
          className={cn("flex-1")}
          variant={form.gender === "male" ? "default" : "outline"}
          onClick={() => onChange({ ...form, gender: "male" })}
        >
          Male
        </Button>
        <Button
          className={cn("flex-1")}
          variant={form.gender === "female" ? "default" : "outline"}
          onClick={() => onChange({ ...form, gender: "female" })}
        >
          Female
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(
          [
            { key: "age", label: "Age", placeholder: "Age" },
            { key: "weightKg", label: "Weight", placeholder: "78 kg" },
            { key: "heightCm", label: "Height", placeholder: "181 cm" },
          ] as const
        ).map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label
              className={cn(
                "text-xs font-semibold tracking-widest uppercase",
                labelClass
              )}
            >
              {label}
            </label>
            <Input
              type="text"
              min={key === "age" ? 13 : undefined}
              placeholder={placeholder}
              value={form[key] || ""}
              onChange={(e) => {
                const parsed = Number(e.target.value)
                onChange({
                  ...form,
                  [key]: Number.isFinite(parsed) ? parsed : 0,
                })
              }}
              className={cn("", inputClass)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p
            className={cn(
              "text-xs font-semibold tracking-widest uppercase",
              labelClass
            )}
          >
            Activity level
          </p>
          <p
            key={form.activityLevel}
            className={cn("text-xs leading-relaxed text-muted-foreground")}
          >
            {activityDescription}
          </p>
        </div>

        <DiscreteSlider
          options={ACTIVITY_LEVELS}
          value={form.activityLevel}
          onChange={(activityLevel) => onChange({ ...form, activityLevel })}
        />
      </div>

      <div className="space-y-3">
        <p
          className={cn(
            "text-xs font-semibold tracking-widest uppercase",
            labelClass
          )}
        >
          Goals
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GOAL_TYPES.map((goal) => (
            <Button
              key={goal.id}
              variant={form.goalType === goal.id ? "default" : "outline"}
              onClick={() => onChange({ ...form, goalType: goal.id })}
            >
              {goal.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "text-xs font-semibold tracking-widest uppercase transition-opacity duration-150 hover:opacity-70",
            inverted ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          Clear
        </button>
        {!showResults && (
          <Button
            type="button"
            onClick={onCalculate}
            disabled={!canCalculate}
          >
            <span className="inline-block">Calculate</span>
          </Button>
        )}
      </div>
    </div>
  )
}
