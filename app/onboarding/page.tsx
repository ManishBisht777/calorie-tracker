"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useSaveGoal } from "@/components/hooks/useSaveGoal"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { ResultsPanel } from "@/components/onboarding/results-panel"
import { DEFAULT_FORM } from "@/components/onboarding/constants"
import {
  calculateMacros,
  type BodyParams,
  type GoalIntensity,
  type ProteinAdjustment,
} from "@/lib/calorie-calculator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { IntroPanel } from "@/components/onboarding/intro-panel"

export default function OnboardingPage() {
  const router = useRouter()

  const [form, setForm] = useState<BodyParams>(DEFAULT_FORM)
  const [showResults, setShowResults] = useState(false)
  const [proteinAdjustment, setProteinAdjustment] =
    useState<ProteinAdjustment>("normal")
  const [goalIntensity, setGoalIntensity] = useState<GoalIntensity>("moderate")
  const { saveGoal, loading: saving } = useSaveGoal()

  const macros = useMemo(
    () => calculateMacros(form, proteinAdjustment, goalIntensity),
    [form, proteinAdjustment, goalIntensity]
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

        // const data = await res.json()
        // if (data.goal) {
        //   router.replace("/")
        // }
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
  }

  function handleClear() {
    setForm(DEFAULT_FORM)
    setProteinAdjustment("normal")
    setGoalIntensity("moderate")
    setShowResults(false)
  }

  async function handleSave() {
    const result = await saveGoal({ ...form, proteinAdjustment, goalIntensity })
    if (!result) return

    toast.success("Goal saved")
    router.push("/")
    router.refresh()
  }

  return (
    <div className="grid h-[calc(100vh-100px)] gap-18 p-8 lg:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {!showResults && (
          <IntroPanel key="intro" className="lg:col-start-1 lg:row-start-1" />
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "p-8 lg:row-start-1",
          showResults ? "lg:col-start-1" : "lg:col-start-2"
        )}
      >
        <OnboardingForm
          form={form}
          showResults={showResults}
          onChange={(next) => {
            setForm(next)
          }}
          onClear={handleClear}
          onCalculate={handleCalculate}
        />
      </motion.div>

      <AnimatePresence mode="popLayout">
        {showResults && (
          <ResultsPanel
            key="results"
            macros={macros}
            goalType={form.goalType}
            goalIntensity={goalIntensity}
            proteinAdjustment={proteinAdjustment}
            onGoalIntensityChange={setGoalIntensity}
            onProteinChange={setProteinAdjustment}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
