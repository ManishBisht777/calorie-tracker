import { NextRequest, NextResponse } from "next/server"

import { getAuthUser, unauthorized } from "@/lib/auth"
import {
  geminiErrorResponse,
  getGeminiApiKey,
  getGeminiModel,
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

    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    const model = getGeminiModel()
    if (!model) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is missing in .env" },
        { status: 500 }
      )
    }

    const prompt = `
    Identify the foods shown in this image.
    
     You are an expert nutritionist. Analyze this food image and estimate its macronutrients.
      - Identify the visible food items and portion sizes.
      - Estimate macros conservatively (slightly overestimate calories if unsure).
      - Do not hallucinate exact precision. Round to nearest 5 or 10.
      - Ensure the response perfectly matches the requested JSON schema.

    Rules:
    - Do NOT list ingredients
    - Do NOT describe components
    - Do NOT include adjectives like "no added sugar"
    
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
    ])

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
      "Failed to analyze image"
    )
    return NextResponse.json({ error: message }, { status })
  }
}
