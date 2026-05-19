import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { getAuthUser, unauthorized } from "@/lib/auth"
import { db, mealEntries } from "@/lib/db"
import { isValidMealDate, type AnalyzeResult } from "@/lib/meal"

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const { id } = await params
    const parsed = parseBody(await req.json())
    if (!parsed) {
      return NextResponse.json({ error: "Invalid meal data" }, { status: 400 })
    }

    const userFilter = eq(mealEntries.userId, user.id)

    const [entry] = await db
      .update(mealEntries)
      .set({
        mealDate: parsed.mealDate,
        foods: parsed.foods,
        calories: parsed.nutrients.calories,
        protein: parsed.nutrients.protein,
        carbs: parsed.nutrients.carbs,
        fat: parsed.nutrients.fat,
      })
      .where(and(eq(mealEntries.id, id), userFilter))
      .returning({ id: mealEntries.id, mealDate: mealEntries.mealDate })

    if (!entry) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    return NextResponse.json({ id: entry.id, mealDate: entry.mealDate })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const { id } = await params
    const userFilter = eq(mealEntries.userId, user.id)

    const [entry] = await db
      .delete(mealEntries)
      .where(and(eq(mealEntries.id, id), userFilter))
      .returning({ id: mealEntries.id, mealDate: mealEntries.mealDate })

    if (!entry) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 })
    }

    return NextResponse.json({ id: entry.id, mealDate: entry.mealDate })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    )
  }
}
