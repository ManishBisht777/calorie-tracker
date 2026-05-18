import { NextRequest, NextResponse } from "next/server"

import { db, mealEntries } from "@/lib/db"
import { isValidMealDate, type AnalyzeResult } from "@/lib/meal"
import { createClient } from "@/lib/supabase/server"

function parseBody(body: unknown): AnalyzeResult & { mealDate: string } | null {
  if (!body || typeof body !== "object") return null

  const { foods, nutrients, mealDate } = body as Record<string, unknown>

  if (!Array.isArray(foods) || foods.some((f) => typeof f !== "string")) {
    return null
  }

  if (!nutrients || typeof nutrients !== "object") return null

  const n = nutrients as Record<string, unknown>
  const keys = ["calories", "protein", "carbs", "fat"] as const
  if (keys.some((k) => typeof n[k] !== "number" || !Number.isFinite(n[k]))) {
    return null
  }

  if (typeof mealDate !== "string" || !isValidMealDate(mealDate)) {
    return null
  }

  return {
    foods,
    nutrients: {
      calories: n.calories as number,
      protein: n.protein as number,
      carbs: n.carbs as number,
      fat: n.fat as number,
    },
    mealDate,
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = parseBody(await req.json())
    if (!parsed) {
      return NextResponse.json({ error: "Invalid meal data" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const [entry] = await db
      .insert(mealEntries)
      .values({
        userId: user?.id ?? null,
        mealDate: parsed.mealDate,
        foods: parsed.foods,
        calories: parsed.nutrients.calories,
        protein: parsed.nutrients.protein,
        carbs: parsed.nutrients.carbs,
        fat: parsed.nutrients.fat,
      })
      .returning({ id: mealEntries.id, mealDate: mealEntries.mealDate })

    return NextResponse.json({ id: entry.id, mealDate: entry.mealDate })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to save meal" },
      { status: 500 }
    )
  }
}
