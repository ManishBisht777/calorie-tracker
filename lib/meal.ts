export type Nutrients = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type AnalyzeResult = {
  foods: string[]
  nutrients: Nutrients
}

export const NUTRIENT_LABELS: {
  key: keyof Nutrients
  label: string
  unit: string
}[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
]

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function toLocalDateString(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function isValidMealDate(value: string) {
  if (!DATE_RE.test(value)) return false
  const [y, m, d] = value.split("-").map(Number)
  const parsed = new Date(y, m - 1, d)
  return (
    parsed.getFullYear() === y &&
    parsed.getMonth() === m - 1 &&
    parsed.getDate() === d
  )
}

export function formatMealDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export type DayTotals = Nutrients

export function parseMealDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function getWeekDates(anchorDate: string) {
  const anchor = parseMealDate(anchorDate)
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - anchor.getDay())

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return toLocalDateString(day)
  })
}

export function isToday(dateStr: string) {
  return dateStr === toLocalDateString()
}

export function formatCalendarDay(dateStr: string) {
  const date = parseMealDate(dateStr)
  return date.toLocaleDateString(undefined, { weekday: "short" })
}

export function formatCalendarMonthDay(dateStr: string) {
  const date = parseMealDate(dateStr)
  return {
    month: date.toLocaleDateString(undefined, { month: "short" }),
    day: date.getDate(),
  }
}
