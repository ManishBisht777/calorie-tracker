import { and, eq } from "drizzle-orm"
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
      return NextResponse.json({ error: "Invalid recipe data" }, { status: 400 })
    }

    const userFilter = eq(recipes.userId, user.id)

    const [entry] = await db
      .update(recipes)
      .set({
        name: parsed.name,
        foods: parsed.foods,
        calories: parsed.nutrients.calories,
        protein: parsed.nutrients.protein,
        carbs: parsed.nutrients.carbs,
        fat: parsed.nutrients.fat,
        updatedAt: new Date(),
      })
      .where(and(eq(recipes.id, id), userFilter))
      .returning({ id: recipes.id })

    if (!entry) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json({ id: entry.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to update recipe" },
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
    const userFilter = eq(recipes.userId, user.id)

    const [entry] = await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), userFilter))
      .returning({ id: recipes.id })

    if (!entry) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json({ id: entry.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    )
  }
}
