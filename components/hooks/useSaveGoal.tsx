"use client"

import {
  type BodyParams,
  type GoalIntensity,
  type ProteinAdjustment,
} from "@/lib/calorie-calculator"
import type { Nutrients } from "@/lib/meal"
import { useCallback, useState } from "react"
import { toast } from "sonner"

type SaveGoalPayload = BodyParams & {
  proteinAdjustment: ProteinAdjustment
  goalIntensity: GoalIntensity
}

type SaveGoalResult = {
  id: string
  nutrients: Nutrients
}

export function useSaveGoal() {
  const [loading, setLoading] = useState(false)

  const saveGoal = useCallback(
    async (payload: SaveGoalPayload): Promise<SaveGoalResult | null> => {
      setLoading(true)

      try {
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error ?? "Failed to save goal")
          return null
        }

        return { id: data.id, nutrients: data.nutrients }
      } catch {
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { saveGoal, loading }
}
