"use client"

import { IconFlame, IconToolsKitchen2 } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { DAILY_GOALS } from "@/lib/goals"
import {
  formatCalendarDay,
  formatCalendarMonthDay,
  getWeekDates,
  isToday,
  type DayTotals,
} from "@/lib/meal"
import { cn } from "@/lib/utils"

type DailySummaryProps = {
  selectedDate: string
  onDateChange: (date: string) => void
  refreshKey?: number
  className?: string
}

function formatKcal(value: number) {
  return Math.round(value).toLocaleString()
}

function CalorieRing({
  remaining,
  goal,
  eaten,
}: {
  remaining: number
  goal: number
  eaten: number
}) {
  const size = 140
  const stroke = 9
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = goal > 0 ? Math.min(eaten / goal, 1) : 0
  const dashOffset = circumference * (1 - progress)

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${formatKcal(Math.max(remaining, 0))} calories remaining`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {formatKcal(Math.max(remaining, 0))}
        </span>
        <span className="mt-0.5 text-xs text-muted-foreground">
          Calories left
        </span>
      </div>
    </div>
  )
}

function StatColumn({
  icon,
  iconClassName,
  iconBgClassName,
  value,
  unit,
  label,
}: {
  icon: React.ReactNode
  iconClassName: string
  iconBgClassName: string
  value: number
  unit: string
  label: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          iconBgClassName
        )}
      >
        <span className={iconClassName}>{icon}</span>
      </div>
      <div>
        <p className="text-base font-semibold tabular-nums">
          {formatKcal(value)}
          <span className="ml-0.5 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function MacroBar({
  label,
  current,
  goal,
  fillClassName,
}: {
  label: string
  current: number
  goal: number
  fillClassName: string
}) {
  const progress = goal > 0 ? Math.min(current / goal, 1) : 0

  return (
    <div className="flex flex-1 flex-col gap-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            fillClassName
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-sm tabular-nums">
        <span className="font-semibold">{Math.round(current)}</span>
        <span className="text-muted-foreground">/{goal} g</span>
      </p>
    </div>
  )
}

function CalendarStrip({
  weekDates,
  selectedDate,
  onSelect,
  caloriesByDate,
}: {
  weekDates: string[]
  selectedDate: string
  onSelect: (date: string) => void
  caloriesByDate: Record<string, DayTotals>
}) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-1">
        {weekDates.map((date) => {
          const selected = date === selectedDate
          const today = isToday(date)
          const { month, day } = formatCalendarMonthDay(date)
          const hasMeals = (caloriesByDate[date]?.calories ?? 0) > 0

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                "flex min-w-13 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 text-center transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                "active:scale-[0.97] motion-reduce:active:scale-100",
                selected && today && "min-h-[4.5rem] py-3",
                selected && !today && "py-2.5",
                !selected && "py-2.5",
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              aria-pressed={selected}
              aria-label={`${formatCalendarDay(date)} ${month} ${day}${today ? ", today" : ""}`}
            >
              {selected && today ? (
                <>
                  <span className="text-[10px] font-medium leading-none opacity-90">
                    Today
                  </span>
                  <span className="text-[10px] leading-none opacity-90">
                    {month}
                  </span>
                  <span className="text-xl font-semibold leading-none tabular-nums">
                    {day}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[11px] font-medium leading-none">
                    {formatCalendarDay(date)}
                  </span>
                  <span className="text-lg font-semibold leading-none tabular-nums">
                    {day}
                  </span>
                  {hasMeals && !selected && (
                    <span className="mt-0.5 size-1 rounded-full bg-primary/70" />
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DailySummary({
  selectedDate,
  onDateChange,
  refreshKey = 0,
  className,
}: DailySummaryProps) {
  const [totals, setTotals] = useState<DayTotals | null>(null)
  const [weekTotals, setWeekTotals] = useState<Record<string, DayTotals>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate])
  const weekFrom = weekDates[0]
  const weekTo = weekDates[6]

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [dayRes, weekRes] = await Promise.all([
        fetch(`/api/meals?date=${selectedDate}`),
        fetch(`/api/meals?from=${weekFrom}&to=${weekTo}`),
      ])

      const dayData = await dayRes.json()
      const weekData = await weekRes.json()

      if (!dayRes.ok) {
        setError(dayData.error ?? "Failed to load day")
        return
      }

      if (!weekRes.ok) {
        setError(weekData.error ?? "Failed to load week")
        return
      }

      setTotals(dayData.totals)
      setWeekTotals(weekData.byDate ?? {})
    } catch {
      setError("Could not load your daily summary.")
    } finally {
      setLoading(false)
    }
  }, [selectedDate, weekFrom, weekTo])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary, refreshKey])

  const eaten = totals?.calories ?? 0
  const burned = 0
  const remaining = DAILY_GOALS.calories - eaten + burned

  return (
    <section className={cn("space-y-5", className)}>
      <header className="space-y-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Calorie Tracker
        </h1>
        <CalendarStrip
          weekDates={weekDates}
          selectedDate={selectedDate}
          onSelect={onDateChange}
          caloriesByDate={weekTotals}
        />
      </header>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div
          className={cn(
            "flex flex-col gap-6 transition-opacity duration-200",
            loading && "opacity-60"
          )}
          aria-busy={loading}
        >
          <div className="flex items-center justify-between gap-3">
            <CalorieRing
              remaining={remaining}
              goal={DAILY_GOALS.calories}
              eaten={eaten}
            />
            <div className="flex flex-1 justify-around gap-2">
              <StatColumn
                icon={<IconToolsKitchen2 className="size-5" stroke={1.75} />}
                iconClassName="text-primary"
                iconBgClassName="bg-primary/10"
                value={eaten}
                unit="cal"
                label="Eaten"
              />
              <StatColumn
                icon={<IconFlame className="size-5" stroke={1.75} />}
                iconClassName="text-destructive"
                iconBgClassName="bg-destructive/10"
                value={burned}
                unit="cal"
                label="Burned"
              />
            </div>
          </div>

          <div className="flex gap-4 border-t border-border pt-5">
            <MacroBar
              label="Carbs"
              current={totals?.carbs ?? 0}
              goal={DAILY_GOALS.carbs}
              fillClassName="bg-chart-2"
            />
            <MacroBar
              label="Protein"
              current={totals?.protein ?? 0}
              goal={DAILY_GOALS.protein}
              fillClassName="bg-chart-4"
            />
            <MacroBar
              label="Fat"
              current={totals?.fat ?? 0}
              goal={DAILY_GOALS.fat}
              fillClassName="bg-foreground"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
