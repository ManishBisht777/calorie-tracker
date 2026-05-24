import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { getAuthUser, unauthorized } from "@/lib/auth"
import { db, recipes } from "@/lib/db"
import type { RecipePayload } from "@/lib/recipe"

function parseBody(body: unknown): RecipePayload | null {
  if (!body || typeof body !== "object") return null

  const { name, foods, nutrients } = body as Record<string, unknown>

  if (typeof name !== "string" || !name.trim()) return null

  if (!Array.isArray(foods) || foods.some((f) => typeof f !== "string")) {
    return null
  }

  if (!nutrients || typeof nutrients !== "object") return null

  const n = nutrients as Record<string, unknown>
  const keys = ["calories", "protein", "carbs", "fat"] as const
  if (keys.some((k) => typeof n[k] !== "number" || !Number.isFinite(n[k]))) {
    return null
  }

  return {
    name: name.trim(),
    foods,
    nutrients: {
      calories: n.calories as number,
      protein: n.protein as number,
      carbs: n.carbs as number,
      fat: n.fat as number,
    },
  }
}

function mapRecipe(row: {
  id: string
  name: string
  foods: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: row.id,
    name: row.name,
    foods: row.foods,
    nutrients: {
      calories: Number(row.calories),
      protein: Number(row.protein),
      carbs: Number(row.carbs),
      fat: Number(row.fat),
    },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")?.trim()

    const userFilter = eq(recipes.userId, user.id)
    const searchFilter = query
      ? or(
          ilike(recipes.name, `%${query}%`),
          sql`${recipes.foods}::text ilike ${`%${query}%`}`
        )
      : undefined

    const rows = await db
      .select({
        id: recipes.id,
        name: recipes.name,
        foods: recipes.foods,
        calories: recipes.calories,
        protein: recipes.protein,
        carbs: recipes.carbs,
        fat: recipes.fat,
        createdAt: recipes.createdAt,
        updatedAt: recipes.updatedAt,
      })
      .from(recipes)
      .where(searchFilter ? and(userFilter, searchFilter) : userFilter)
      .orderBy(desc(recipes.updatedAt))

    return NextResponse.json({
      recipes: rows.map(mapRecipe),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to load recipes" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const parsed = parseBody(await req.json())
    if (!parsed) {
      return NextResponse.json({ error: "Invalid recipe data" }, { status: 400 })
    }

    const [entry] = await db
      .insert(recipes)
      .values({
        userId: user.id,
        name: parsed.name,
        foods: parsed.foods,
        calories: parsed.nutrients.calories,
        protein: parsed.nutrients.protein,
        carbs: parsed.nutrients.carbs,
        fat: parsed.nutrients.fat,
      })
      .returning({
        id: recipes.id,
        name: recipes.name,
        foods: recipes.foods,
        calories: recipes.calories,
        protein: recipes.protein,
        carbs: recipes.carbs,
        fat: recipes.fat,
        createdAt: recipes.createdAt,
        updatedAt: recipes.updatedAt,
      })

    return NextResponse.json({ recipe: mapRecipe(entry) })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 }
    )
  }
}
