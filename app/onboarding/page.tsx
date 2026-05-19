"use client"

import { IconGauge } from "@tabler/icons-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ACTIVITY_DESCRIPTIONS,
  calculateMacros,
  type ActivityLevel,
  type BodyParams,
  type Gender,
  type GoalType,
  type MacroResult,
  type ProteinAdjustment,
} from "@/lib/calorie-calculator"
import { cn } from "@/lib/utils"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "middle", label: "Middle" },
  { id: "high", label: "High" },
  { id: "very_high", label: "Very high" },
]

const GOAL_TYPES: { id: GoalType; label: string }[] = [
  { id: "lose", label: "Lose" },
  { id: "lose_10", label: "Lose 10%" },
  { id: "maintain", label: "Maintain" },
  { id: "gain", label: "Gain" },
]

const PROTEIN_LEVELS: { id: ProteinAdjustment; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
]

const DEFAULT_FORM: BodyParams = {
  gender: "male",
  age: 28,
  weightKg: 78,
  heightCm: 181,
  activityLevel: "middle",
  goalType: "lose_10",
}

function SegmentedButton({
  selected,
  onClick,
  children,
  className,
  inverted,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  inverted?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg px-3 py-3 text-xs font-semibold tracking-widest uppercase transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        "active:scale-[0.97] motion-reduce:active:scale-100",
        inverted
          ? selected
            ? "bg-primary-foreground text-primary shadow-sm"
            : "bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/15 hover:text-primary-foreground"
          : selected
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        className
      )}
      aria-pressed={selected}
    >
      {children}
    </button>
  )
}

function DiscreteSlider<T extends string>({
  options,
  value,
  onChange,
  inverted,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
  inverted?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="relative px-1 pt-2">
        <div
          className={cn(
            "absolute top-[calc(50%-1px)] right-1 left-1 h-px",
            inverted ? "bg-primary-foreground/25" : "bg-border"
          )}
        />
        <div className="relative flex justify-between">
          {options.map((option) => {
            const selected = option.id === value
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className="group flex flex-col items-center gap-3"
                aria-pressed={selected}
              >
                <span
                  className={cn(
                    "relative z-10 block size-3.5 rounded-full border-2 transition-[transform,background-color,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                    "group-active:scale-[0.9] motion-reduce:group-active:scale-100",
                    inverted
                      ? selected
                        ? "border-primary-foreground bg-primary-foreground"
                        : "border-primary-foreground/50 bg-primary"
                      : selected
                        ? "border-primary bg-primary"
                        : "border-border bg-card"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-widest uppercase",
                    inverted
                      ? selected
                        ? "text-primary-foreground"
                        : "text-primary-foreground/60"
                      : selected
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function IntroPanel({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, transform: "translateX(-12px)" }}
      animate={{ opacity: 1, transform: "translateX(0)" }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className={cn(
        "flex flex-col justify-between gap-8 p-8 lg:p-12",
        className
      )}
    >
      <div className="space-y-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <IconGauge className="size-6 text-primary" stroke={1.75} />
        </div>
        <div className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight uppercase lg:text-4xl">
            Calories calculator
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Calculate optimal macronutrient ratios for your body. Enter your age,
            height, weight, gender, and activity level.
          </p>
        </div>
      </div>
      <p className="text-xs tracking-widest text-muted-foreground uppercase">
        Step 1 of 2
      </p>
    </motion.div>
  )
}

function OnboardingForm({
  form,
  onChange,
  onClear,
  onCalculate,
  inverted,
  compact,
}: {
  form: BodyParams
  onChange: (next: BodyParams) => void
  onClear: () => void
  onCalculate: () => void
  inverted?: boolean
  compact?: boolean
}) {
  const activityDescription = ACTIVITY_DESCRIPTIONS[form.activityLevel]
  const canCalculate =
    form.age >= 13 &&
    form.weightKg >= 30 &&
    form.heightCm >= 100

  const labelClass = inverted
    ? "text-primary-foreground/80"
    : "text-muted-foreground"
  const inputClass = inverted
    ? "border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:border-primary-foreground"
    : ""

  return (
    <div className={cn("flex flex-col gap-8", compact ? "p-6 lg:p-8" : "p-8 lg:p-10")}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <SegmentedButton
            selected={form.gender === "male"}
            onClick={() => onChange({ ...form, gender: "male" })}
            inverted={inverted}
          >
            Male
          </SegmentedButton>
          <SegmentedButton
            selected={form.gender === "female"}
            onClick={() => onChange({ ...form, gender: "female" })}
            inverted={inverted}
          >
            Female
          </SegmentedButton>
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
              <label className={cn("text-[10px] font-semibold tracking-widest uppercase", labelClass)}>
                {label}
              </label>
              <Input
                type="number"
                inputMode="decimal"
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
                className={cn("rounded-lg border px-3 py-2", inputClass)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className={cn("text-xs font-semibold tracking-widest uppercase", labelClass)}>
          Activity level
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={form.activityLevel}
            initial={{ opacity: 0, filter: "blur(2px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className={cn(
              "min-h-10 text-xs leading-relaxed",
              inverted ? "text-primary-foreground/75" : "text-muted-foreground"
            )}
          >
            {activityDescription}
          </motion.p>
        </AnimatePresence>
        <DiscreteSlider
          options={ACTIVITY_LEVELS}
          value={form.activityLevel}
          onChange={(activityLevel) => onChange({ ...form, activityLevel })}
          inverted={inverted}
        />
      </div>

      <div className="space-y-3">
        <p className={cn("text-xs font-semibold tracking-widest uppercase", labelClass)}>
          Goals
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GOAL_TYPES.map((goal) => (
            <SegmentedButton
              key={goal.id}
              selected={form.goalType === goal.id}
              onClick={() => onChange({ ...form, goalType: goal.id })}
              inverted={inverted}
              className="min-w-0 px-2"
            >
              {goal.label}
            </SegmentedButton>
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
        <Button
          type="button"
          onClick={onCalculate}
          disabled={!canCalculate}
          className={cn(
            "min-w-36 skew-x-[-8deg] rounded-none",
            inverted && "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          )}
        >
          <span className="inline-block skew-x-[8deg]">Calculate</span>
        </Button>
      </div>
    </div>
  )
}

function MacroRow({
  label,
  grams,
  percent,
  delay,
}: {
  label: string
  grams: number
  percent: number
  delay: number
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, transform: shouldReduceMotion ? "none" : "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0)" }}
      transition={{ duration: 0.22, ease: EASE_OUT, delay: shouldReduceMotion ? 0 : delay }}
      className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm tabular-nums">
        <span className="font-semibold">{grams}g</span>
        <span className="text-muted-foreground"> / {percent}%</span>
      </span>
    </motion.div>
  )
}

function ResultsPanel({
  macros,
  proteinAdjustment,
  onProteinChange,
  onSave,
  saving,
  saveError,
}: {
  macros: MacroResult
  proteinAdjustment: ProteinAdjustment
  onProteinChange: (value: ProteinAdjustment) => void
  onSave: () => void
  saving: boolean
  saveError: string | null
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, transform: shouldReduceMotion ? "none" : "translateX(16px)" }}
      animate={{ opacity: 1, transform: "translateX(0)" }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="flex flex-col gap-8 p-8 lg:p-12"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Your result
        </p>
        <motion.p
          initial={{ opacity: 0, transform: shouldReduceMotion ? "none" : "scale(0.98)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={{ duration: 0.25, ease: EASE_OUT, delay: 0.05 }}
          className="font-heading text-5xl font-semibold tracking-tight tabular-nums lg:text-6xl"
        >
          {macros.calories}
          <span className="ml-2 text-2xl font-normal text-muted-foreground lg:text-3xl">
            kcal
          </span>
        </motion.p>
        <p className="text-sm text-muted-foreground">
          Suggested amount of calories per day.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Macronutrients
        </p>
        <MacroRow label="Carbohydrate" grams={macros.carbs} percent={macros.carbsPercent} delay={0.08} />
        <MacroRow label="Protein" grams={macros.protein} percent={macros.proteinPercent} delay={0.12} />
        <MacroRow label="Fat" grams={macros.fat} percent={macros.fatPercent} delay={0.16} />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Adjust protein
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Higher protein supports muscle recovery. Lower protein leaves more room
            for carbs and fat.
          </p>
        </div>
        <DiscreteSlider
          options={PROTEIN_LEVELS}
          value={proteinAdjustment}
          onChange={onProteinChange}
        />
      </div>

      {saveError && (
        <p className="text-sm text-destructive" role="alert">
          {saveError}
        </p>
      )}

      <div className="mt-auto flex justify-end pt-2">
        <Button
          type="button"
          onClick={onSave}
          disabled={saving}
          size="lg"
          className="min-w-40 skew-x-[-8deg] rounded-none"
        >
          <span className="inline-block skew-x-[8deg]">
            {saving ? "Saving…" : "Save goal"}
          </span>
        </Button>
      </div>
    </motion.div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()

  const [form, setForm] = useState<BodyParams>(DEFAULT_FORM)
  const [showResults, setShowResults] = useState(false)
  const [proteinAdjustment, setProteinAdjustment] =
    useState<ProteinAdjustment>("normal")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const macros = useMemo(
    () => calculateMacros(form, proteinAdjustment),
    [form, proteinAdjustment]
  )

  useEffect(() => {
    let cancelled = false

    async function checkExistingGoal() {
      try {
        const res = await fetch("/api/goals")
        if (cancelled) return

        if (res.status === 401) {
          router.replace("/login")
          return
        }

        const data = await res.json()
        if (data.goal) {
          router.replace("/")
        }
      } catch {
        // Allow onboarding if check fails
      }
    }

    void checkExistingGoal()

    return () => {
      cancelled = true
    }
  }, [router])

  function handleCalculate() {
    setShowResults(true)
    setSaveError(null)
  }

  function handleClear() {
    setForm(DEFAULT_FORM)
    setProteinAdjustment("normal")
    setShowResults(false)
    setSaveError(null)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, proteinAdjustment }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error ?? "Failed to save goal")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setSaveError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="intro"
            initial={false}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: "translateX(-8px)" }
            }
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="flex flex-col border-b border-border bg-card lg:border-r lg:border-b-0"
          >
            <IntroPanel className="flex-1" />
          </motion.div>
        ) : (
          <motion.div
            key="form-left"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: "translateX(-16px)" }
            }
            animate={{ opacity: 1, transform: "translateX(0)" }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="flex flex-col border-b border-border bg-primary text-primary-foreground lg:border-r lg:border-b-0"
          >
            <OnboardingForm
              form={form}
              onChange={(next) => {
                setForm(next)
                setSaveError(null)
              }}
              onClear={handleClear}
              onCalculate={handleCalculate}
              inverted
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col bg-primary text-primary-foreground lg:min-h-svh">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="form-right"
              initial={{ opacity: 0, transform: shouldReduceMotion ? "none" : "translateX(16px)" }}
              animate={{ opacity: 1, transform: "translateX(0)" }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, transform: "translateX(-8px)" }
              }
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="flex flex-1 flex-col"
            >
              <OnboardingForm
                form={form}
                onChange={(next) => {
                  setForm(next)
                  setSaveError(null)
                }}
                onClear={handleClear}
                onCalculate={handleCalculate}
                inverted
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={false}
              className="absolute inset-0 flex flex-col bg-card text-card-foreground lg:relative"
            >
              <ResultsPanel
                macros={macros}
                proteinAdjustment={proteinAdjustment}
                onProteinChange={setProteinAdjustment}
                onSave={handleSave}
                saving={saving}
                saveError={saveError}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
