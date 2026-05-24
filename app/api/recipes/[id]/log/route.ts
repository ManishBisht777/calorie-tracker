import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { getAuthUser, unauthorized } from "@/lib/auth"
import { db, mealEntries, recipes } from "@/lib/db"
import { isValidMealDate } from "@/lib/meal"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const { id } = await params
    const body = await req.json()
    const mealDate =
      body && typeof body === "object" && "mealDate" in body
        ? (body as { mealDate: unknown }).mealDate
        : null

    if (typeof mealDate !== "string" || !isValidMealDate(mealDate)) {
      return NextResponse.json({ error: "Invalid meal date" }, { status: 400 })
    }

    const userFilter = eq(recipes.userId, user.id)

    const [recipe] = await db
      .select({
        foods: recipes.foods,
        calories: recipes.calories,
        protein: recipes.protein,
        carbs: recipes.carbs,
        fat: recipes.fat,
      })
      .from(recipes)
      .where(and(eq(recipes.id, id), userFilter))

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    const [entry] = await db
      .insert(mealEntries)
      .values({
        userId: user.id,
        mealDate,
        foods: recipe.foods,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
      })
      .returning({ id: mealEntries.id, mealDate: mealEntries.mealDate })

    return NextResponse.json({ id: entry.id, mealDate: entry.mealDate })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to log recipe" },
      { status: 500 }
    )
  }
}
