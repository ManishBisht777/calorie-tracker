import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { getAuthUser, unauthorized } from "@/lib/auth"
import {
  calculateMacros,
  isValidBodyParams,
  type ProteinAdjustment,
} from "@/lib/calorie-calculator"
import { db, userGoals } from "@/lib/db"
import type { Nutrients } from "@/lib/meal"

const PROTEIN_ADJUSTMENTS: ProteinAdjustment[] = ["low", "normal", "high"]

function toNutrients(row: {
  calories: number
  protein: number
  carbs: number
  fat: number
}): Nutrients {
  return {
    calories: Math.round(row.calories),
    protein: Math.round(row.protein),
    carbs: Math.round(row.carbs),
    fat: Math.round(row.fat),
  }
}

function parseSaveBody(body: unknown) {
  if (!body || typeof body !== "object") return null

  const v = body as Record<string, unknown>
  const { proteinAdjustment: rawAdjustment, ...rest } = v

  if (!isValidBodyParams(rest)) return null

  if (
    rawAdjustment !== undefined &&
    (typeof rawAdjustment !== "string" ||
      !PROTEIN_ADJUSTMENTS.includes(rawAdjustment as ProteinAdjustment))
  ) {
    return null
  }

  const adjustment = (rawAdjustment as ProteinAdjustment | undefined) ?? "normal"
  const macros = calculateMacros(rest, adjustment)

  return {
    body: rest,
    proteinAdjustment: adjustment,
    macros,
  }
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const [goal] = await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, user.id))
      .limit(1)

    if (!goal) {
      return NextResponse.json({ goal: null })
    }

    return NextResponse.json({
      goal: {
        id: goal.id,
        gender: goal.gender,
        age: goal.age,
        weightKg: goal.weightKg,
        heightCm: goal.heightCm,
        activityLevel: goal.activityLevel,
        goalType: goal.goalType,
        proteinAdjustment: goal.proteinAdjustment,
        nutrients: toNutrients(goal),
        updatedAt: goal.updatedAt,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to load goal" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const parsed = parseSaveBody(await req.json())
    if (!parsed) {
      return NextResponse.json({ error: "Invalid goal data" }, { status: 400 })
    }

    const filter = eq(userGoals.userId, user.id)
    const [existing] = await db
      .select({ id: userGoals.id })
      .from(userGoals)
      .where(filter)
      .limit(1)

    const values = {
      userId: user.id,
      gender: parsed.body.gender,
      age: parsed.body.age,
      weightKg: parsed.body.weightKg,
      heightCm: parsed.body.heightCm,
      activityLevel: parsed.body.activityLevel,
      goalType: parsed.body.goalType,
      proteinAdjustment: parsed.proteinAdjustment,
      calories: parsed.macros.calories,
      protein: parsed.macros.protein,
      carbs: parsed.macros.carbs,
      fat: parsed.macros.fat,
      updatedAt: new Date(),
    }

    if (existing) {
      const [updated] = await db
        .update(userGoals)
        .set(values)
        .where(and(filter, eq(userGoals.id, existing.id)))
        .returning()

      return NextResponse.json({
        id: updated.id,
        nutrients: toNutrients(updated),
      })
    }

    const [created] = await db.insert(userGoals).values(values).returning()

    return NextResponse.json({
      id: created.id,
      nutrients: toNutrients(created),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to save goal" }, { status: 500 })
  }
}
