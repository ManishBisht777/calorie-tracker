"use client"

import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  getGoalAdjustmentLabel,
  type GoalIntensity,
  type GoalType,
  type MacroResult,
  type ProteinAdjustment,
} from "@/lib/calorie-calculator"

import { EASE_OUT, GOAL_INTENSITY_LEVELS, PROTEIN_LEVELS } from "./constants"
import { DiscreteSlider } from "./discrete-slider"

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
      initial={{
        opacity: 0,
        transform: shouldReduceMotion ? "none" : "translateY(8px)",
      }}
      animate={{ opacity: 1, transform: "translateY(0)" }}
      transition={{
        duration: 0.22,
        ease: EASE_OUT,
        delay: shouldReduceMotion ? 0 : delay,
      }}
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

export function ResultsPanel({
  macros,
  goalType,
  goalIntensity,
  proteinAdjustment,
  onGoalIntensityChange,
  onProteinChange,
  onSave,
  saving,
}: {
  macros: MacroResult
  goalType: GoalType
  goalIntensity: GoalIntensity
  proteinAdjustment: ProteinAdjustment
  onGoalIntensityChange: (value: GoalIntensity) => void
  onProteinChange: (value: ProteinAdjustment) => void
  onSave: () => void
  saving: boolean
}) {
  const shouldReduceMotion = useReducedMotion()
  const showGoalIntensity = goalType !== "maintain"
  const goalLabel = getGoalAdjustmentLabel(goalType, goalIntensity)

  return (
    <motion.div
      initial={{
        opacity: 0,
        transform: shouldReduceMotion ? "none" : "translateX(16px)",
      }}
      animate={{ opacity: 1, transform: "translateX(0)" }}
      exit={{
        opacity: 0,
        transform: shouldReduceMotion ? "none" : "translateX(16px)",
      }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="flex flex-col gap-8 p-8 lg:col-start-2 lg:row-start-1"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Your result
        </p>

        <div className="flex items-center justify-between">
          <motion.p
            initial={{
              opacity: 0,
              transform: shouldReduceMotion ? "none" : "scale(0.98)",
            }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ duration: 0.25, ease: EASE_OUT, delay: 0.05 }}
            className="text-5xl font-bold tracking-wide tabular-nums lg:text-6xl"
          >
            {macros.calories}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              kcal/day
            </span>
          </motion.p>

          <span className="text-sm text-muted-foreground">{goalLabel}</span>
        </div>

        <p className="text-sm text-muted-foreground">
          Suggested amount of calories per day.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Macronutrients
        </p>
        <div className="space-y-1">
          <MacroRow
            label="Carbohydrate"
            grams={macros.carbs}
            percent={macros.carbsPercent}
            delay={0.08}
          />
          <MacroRow
            label="Protein"
            grams={macros.protein}
            percent={macros.proteinPercent}
            delay={0.12}
          />
          <MacroRow
            label="Fat"
            grams={macros.fat}
            percent={macros.fatPercent}
            delay={0.16}
          />
        </div>
      </div>

      {showGoalIntensity && (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {goalType === "gain" ? "Bulk pace" : "Cut pace"}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {goalType === "gain"
                ? "Higher surplus builds muscle faster but adds more fat."
                : "A larger deficit speeds weight loss but can be harder to sustain."}
            </p>
          </div>
          <DiscreteSlider
            options={GOAL_INTENSITY_LEVELS}
            value={goalIntensity}
            onChange={onGoalIntensityChange}
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Adjust protein
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Higher protein supports muscle recovery. Lower protein leaves more
            room for carbs and fat.
          </p>
        </div>
        <DiscreteSlider
          options={PROTEIN_LEVELS}
          value={proteinAdjustment}
          onChange={onProteinChange}
        />
      </div>

      <div className="mt-auto flex justify-end pt-2">
        <Button
          type="button"
          onClick={onSave}
          disabled={saving}
          size="lg"
          className="min-w-40 rounded-none"
        >
          <span className="inline-block">
            {saving ? "Saving…" : "Save goal"}
          </span>
        </Button>
      </div>
    </motion.div>
  )
}
