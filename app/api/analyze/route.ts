import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GOOGLE_API_KEY?.trim()
const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite"

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is missing in .env" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    const model = genAI.getGenerativeModel({ model: modelName })

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

    const text = result.response.text()

    // ⚠️ Gemini sometimes returns extra text → clean it
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    const data = JSON.parse(cleaned)

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    const message =
      err instanceof Error ? err.message : "Failed to analyze image"
    const status = message.includes("429") ? 429 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
