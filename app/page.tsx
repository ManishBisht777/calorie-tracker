"use client"

import { DailyMealsList } from "@/components/daily-meals-list"
import { DailySummary } from "@/components/daily-summary"
import LogMeal from "@/components/log-meal/LogMeal"
import { RecipeSelectDialog } from "@/components/recipes/recipe-select-dialog"
import { ManualMealDialog } from "@/components/manual-meal-dialog"
import { Button } from "@/components/ui/button"
import { type MealEntry, toLocalDateString } from "@/lib/meal"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
  const router = useRouter()
  const [checkingGoal, setCheckingGoal] = useState(true)
  const [manualOpen, setManualOpen] = useState(false)
  const [dashboardDate, setDashboardDate] = useState(() => toLocalDateString())
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0)
  const [recipeRefreshKey, setRecipeRefreshKey] = useState(0)
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null)
  const [editMealDate, setEditMealDate] = useState(() => toLocalDateString())

  useEffect(() => {
    let cancelled = false

    async function checkGoal() {
      try {
        const res = await fetch("/api/goals")

        if (!cancelled && res.status === 401) {
          router.replace("/login")
          return
        }

        const data = await res.json()

        if (!cancelled && !data.goal) {
          router.replace("/onboarding")
          return
        }
      } catch {
        // Allow dashboard if goal check fails
      } finally {
        if (!cancelled) setCheckingGoal(false)
      }
    }

    void checkGoal()

    return () => {
      cancelled = true
    }
  }, [router])

  function handleMealSaved(date: string) {
    setDashboardDate(date)
    setSummaryRefreshKey((k) => k + 1)
  }

  if (checkingGoal) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg items-center justify-center p-6">
        <span
          className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-label="Loading"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col p-6">
      <div className="space-y-8">
        <DailySummary
          selectedDate={dashboardDate}
          onDateChange={setDashboardDate}
          refreshKey={summaryRefreshKey}
        />

        <DailyMealsList
          selectedDate={dashboardDate}
          refreshKey={summaryRefreshKey}
          onEdit={(meal) => {
            setEditingMeal(meal)
            setEditMealDate(meal.mealDate)
            setManualOpen(true)
          }}
          onMealsChanged={() => setSummaryRefreshKey((k) => k + 1)}
          onRecipeSaved={() => setRecipeRefreshKey((k) => k + 1)}
        />

        <div className="grid grid-cols-2 gap-4">
          <LogMeal onMealSaved={handleMealSaved} />
          <RecipeSelectDialog
            selectedDate={dashboardDate}
            refreshKey={recipeRefreshKey}
            onMealLogged={handleMealSaved}
            trigger={<Button variant="secondary">Select a recipe</Button>}
          />
        </div>
      </div>

      <ManualMealDialog
        open={manualOpen}
        onOpenChange={(open) => {
          if (!open) setEditingMeal(null)
          setManualOpen(open)
        }}
        mealDate={editMealDate}
        onMealDateChange={setEditMealDate}
        editMeal={editingMeal}
        onSaved={() => {}}
        onUpdated={(date) => {
          setDashboardDate(date)
          setSummaryRefreshKey((k) => k + 1)
          setEditingMeal(null)
        }}
      />
    </div>
  )
}
