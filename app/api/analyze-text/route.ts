import { NextRequest, NextResponse } from "next/server"

import { getAuthUser, unauthorized } from "@/lib/auth"
import {
  geminiErrorResponse,
  getGeminiApiKey,
  getGeminiTextModel,
  parseAnalyzeResult,
  parseGeminiJson,
} from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    if (!getGeminiApiKey()) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is missing in .env" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const description =
      typeof body?.description === "string" ? body.description.trim() : ""

    if (!description) {
      return NextResponse.json(
        { error: "Meal description is required" },
        { status: 400 }
      )
    }

    const model = getGeminiTextModel()
    if (!model) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is missing in .env" },
        { status: 500 }
      )
    }

    const prompt = `
    You are an expert nutritionist. Given a meal or food description, estimate its macronutrients for a typical serving.

    Meal description: "${description}"

    Rules:
    - Break the description into distinct food items in the "foods" array.
    - Estimate macros conservatively (slightly overestimate calories if unsure).
    - Do not hallucinate exact precision. Round to nearest 5 or 10.
    - Do NOT list ingredients or cooking methods as separate items unless they are separate foods.
    - Ensure the response perfectly matches the requested JSON schema.

    Return ONLY valid JSON:
    {
      "foods": string[],
      "nutrients": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      }
    }
    `

    const result = await model.generateContent(prompt)
    const parsed = parseAnalyzeResult(parseGeminiJson(result.response.text()))

    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid response from AI" },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const { message, status } = geminiErrorResponse(
      err,
      "Failed to analyze meal"
    )
    return NextResponse.json({ error: message }, { status })
  }
}
