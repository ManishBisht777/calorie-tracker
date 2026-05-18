import { and, eq, gte, lte, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db, mealEntries } from "@/lib/db"
import { isValidMealDate, type AnalyzeResult, type DayTotals } from "@/lib/meal"
import { createClient } from "@/lib/supabase/server"

const emptyTotals = (): DayTotals => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
})

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (date && (!isValidMealDate(date) || from || to)) {
      return NextResponse.json({ error: "Invalid date query" }, { status: 400 })
    }

    if ((from && !isValidMealDate(from)) || (to && !isValidMealDate(to))) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 })
    }

    if (!date && !(from && to)) {
      return NextResponse.json(
        { error: "Provide date or from and to" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const userFilter = user?.id
      ? eq(mealEntries.userId, user.id)
      : sql`${mealEntries.userId} IS NULL`

    if (date) {
      const [row] = await db
        .select({
          calories: sql<number>`coalesce(sum(${mealEntries.calories}), 0)`,
          protein: sql<number>`coalesce(sum(${mealEntries.protein}), 0)`,
          carbs: sql<number>`coalesce(sum(${mealEntries.carbs}), 0)`,
          fat: sql<number>`coalesce(sum(${mealEntries.fat}), 0)`,
        })
        .from(mealEntries)
        .where(and(userFilter, eq(mealEntries.mealDate, date)))

      const totals: DayTotals = row
        ? {
            calories: Number(row.calories),
            protein: Number(row.protein),
            carbs: Number(row.carbs),
            fat: Number(row.fat),
          }
        : emptyTotals()

      return NextResponse.json({ date, totals })
    }

    const rows = await db
      .select({
        mealDate: mealEntries.mealDate,
        calories: sql<number>`coalesce(sum(${mealEntries.calories}), 0)`,
        protein: sql<number>`coalesce(sum(${mealEntries.protein}), 0)`,
        carbs: sql<number>`coalesce(sum(${mealEntries.carbs}), 0)`,
        fat: sql<number>`coalesce(sum(${mealEntries.fat}), 0)`,
      })
      .from(mealEntries)
      .where(
        and(
          userFilter,
          gte(mealEntries.mealDate, from!),
          lte(mealEntries.mealDate, to!)
        )
      )
      .groupBy(mealEntries.mealDate)

    const byDate: Record<string, DayTotals> = {}
    for (const row of rows) {
      byDate[row.mealDate] = {
        calories: Number(row.calories),
        protein: Number(row.protein),
        carbs: Number(row.carbs),
        fat: Number(row.fat),
      }
    }

    return NextResponse.json({ from, to, byDate })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to load meals" },
      { status: 500 }
    )
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
