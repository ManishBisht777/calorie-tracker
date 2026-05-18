import { GoogleGenerativeAI } from "@google/generative-ai"

import type { AnalyzeResult } from "@/lib/meal"

const apiKey = process.env.GOOGLE_API_KEY?.trim()
const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite"

export function getGeminiApiKey() {
  return apiKey
}

export function getGeminiModel() {
  if (!apiKey) return null
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: modelName })
}

export function parseGeminiJson(text: string): unknown {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()
  return JSON.parse(cleaned)
}

export function parseAnalyzeResult(data: unknown): AnalyzeResult | null {
  if (!data || typeof data !== "object") return null

  const { foods, nutrients } = data as Record<string, unknown>

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
    foods,
    nutrients: {
      calories: n.calories as number,
      protein: n.protein as number,
      carbs: n.carbs as number,
      fat: n.fat as number,
    },
  }
}

export function geminiErrorResponse(err: unknown, fallback: string) {
  console.error(err)
  const message = err instanceof Error ? err.message : fallback
  const status = message.includes("429") ? 429 : 500
  return { message, status }
}
