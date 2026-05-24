"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const STATS = [
  { value: "< 30 seconds", label: "Average time to log a meal" },
  { value: "1 tap", label: "Log a saved recipe to your day" },
  { value: "7-day view", label: "Track your progress across the week" },
] as const

const BENTO_ITEMS = [
  {
    title: "Text logging",
    description:
      'Describe your meal naturally—"two eggs, toast, black coffee"—and get an instant calorie estimate.',
    className: "col-span-2 row-span-2 min-h-44",
    accent: "bg-gray-50",
  },
  {
    title: "Saved recipes",
    description:
      "Save meals you eat often—by photo, text, or manual entry—then log them again with one tap.",
    className: "col-span-2 row-span-1 min-h-24",
    accent: "bg-primary/5",
  },
  {
    title: "Calorie ring",
    description: "See your remaining calories at a glance.",
    className: "col-span-1 row-span-1",
    accent: "bg-gray-50",
  },
  {
    title: "Macro tracking",
    description: "Protein, carbs, and fats—clearly visualized.",
    className: "col-span-1 row-span-1",
    accent: "bg-gray-50",
  },
  // {
  //   title: "Edit anytime",
  //   description: "Update portions or values with a tap.",
  //   className: "col-span-1 row-span-1",
  //   accent: "bg-gray-50",
  // },
  // {
  //   title: "Flexible dates",
  //   description: "Log past meals or plan ahead with ease.",
  //   className: "col-span-1 row-span-1",
  //   accent: "bg-gray-50",
  // },
] as const

const STEPS = [
  {
    step: "01",
    title: "Set your goal",
    description:
      "Enter your details and choose your target. We calculate your daily calorie budget.",
  },
  {
    step: "02",
    title: "Log your meals",
    description:
      "Track meals as you go—or save recipes for dishes you repeat and add them in one tap.",
  },
  {
    step: "03",
    title: "Stay on track",
    description:
      "Monitor your progress in real time and adjust before the day ends.",
  },
] as const

const MACROS = [
  { label: "Protein", detail: "Supports muscle growth and recovery" },
  { label: "Carbohydrates", detail: "Fuels your workouts and daily energy" },
  { label: "Fats", detail: "Maintains balance and overall health" },
] as const

const FAQ = [
  {
    q: "Do I need to weigh every ingredient?",
    a: "No. Use text logging for quick estimates, switch to manual entry for precision, or save a recipe once and reuse it.",
  },
  {
    q: "How do recipes work?",
    a: "Create a recipe from a photo, description, or manual entry. Search your saved recipes anytime and log one to your day instantly.",
  },
  {
    q: "Can I log meals from previous days?",
    a: "Yes. Simply select a date and add or edit entries anytime.",
  },
  {
    q: "How are calorie targets calculated?",
    a: "We use your age, height, weight, activity level, and goal during onboarding.",
  },
  {
    q: "Is it free to start?",
    a: "Yes. Create an account and begin tracking immediately.",
  },
] as const

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{
        opacity: 0,
        transform: shouldReduceMotion ? "none" : "translateY(8px)",
      }}
      animate={{ opacity: 1, transform: "translateY(0)" }}
      transition={{
        duration: 0.24,
        ease: EASE_OUT,
        delay: shouldReduceMotion ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  )
}

export function LandingPage() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center px-6 py-20">
      <div className="flex w-full flex-col items-center gap-24 text-center">
        {/* Hero */}
        <FadeIn className="max-w-xl space-y-6">
          <SectionLabel>Calorie Tracker</SectionLabel>
          <h1 className="text-4xl leading-tight font-bold tracking-wide md:text-5xl">
            Know what you eat. Reach your goals.
          </h1>
          <p className="mx-auto text-sm leading-relaxed text-muted-foreground md:text-base">
            A simple, intuitive way to log meals, save recipes, track calories,
            and stay consistent—without spreadsheets or guesswork.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            {/* <InstallButton /> */}
          </div>
        </FadeIn>

        {/* Stats strip */}
        <section className="w-full max-w-2xl space-y-6">
          <FadeIn delay={0.06}>
            <SectionLabel>Built for speed and simplicity</SectionLabel>
          </FadeIn>
          <div className="grid grid-cols-3 divide-x divide-border border border-border">
            {STATS.map((stat, index) => (
              <FadeIn
                key={stat.label}
                delay={0.06 + index * 0.05}
                className="flex flex-col items-center gap-1 px-3 py-6"
              >
                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {stat.label}
                </p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Bento grid */}
        <section className="w-full space-y-6">
          <FadeIn delay={0.08} className="space-y-2">
            <SectionLabel>Everything in one place</SectionLabel>
            <p className="mx-auto max-w-lg text-sm text-muted-foreground">
              Designed around a focused daily view—log quickly, reuse saved
              recipes, review effortlessly, and adjust when needed.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 gap-3 text-left md:grid-cols-4">
            {BENTO_ITEMS.map((item, index) => (
              <FadeIn
                key={item.title}
                delay={0.1 + index * 0.05}
                className={cn(
                  "flex flex-col justify-between border border-border p-5",
                  item.accent,
                  item.className
                )}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* How it works — horizontal cards */}
        <section className="w-full space-y-6">
          <FadeIn delay={0.08}>
            <SectionLabel>How it works</SectionLabel>
          </FadeIn>
          <div className="grid gap-3 text-left md:grid-cols-3">
            {STEPS.map((item, index) => (
              <FadeIn
                key={item.step}
                delay={0.1 + index * 0.06}
                className="flex flex-col border border-border p-5"
              >
                <span className="text-xs font-semibold tracking-widest text-muted-foreground tabular-nums">
                  {item.step}
                </span>
                <p className="mt-4 text-sm font-semibold">{item.title}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Macros — pill row + wide card */}
        <section className="w-full space-y-4">
          <FadeIn delay={0.08} className="space-y-2">
            <SectionLabel>More than calories</SectionLabel>
            <p className="mx-auto max-w-lg text-sm text-muted-foreground">
              Your nutrition is more than a single number. Track the balance
              that matters.
            </p>
          </FadeIn>
          <FadeIn
            delay={0.12}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {MACROS.map((macro) => (
              <span
                key={macro.label}
                className="border border-border px-4 py-2 text-xs font-semibold tracking-wide uppercase"
              >
                {macro.label}
              </span>
            ))}
          </FadeIn>
          <div className="grid gap-3 md:grid-cols-3">
            {MACROS.map((macro, index) => (
              <FadeIn
                key={macro.label}
                delay={0.14 + index * 0.05}
                className="border border-border bg-muted/30 p-4 text-left"
              >
                <p className="text-xs font-semibold uppercase">{macro.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {macro.detail}
                </p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Pull quote — centered block */}
        <FadeIn
          delay={0.08}
          className="w-full max-w-2xl border-y border-border py-12"
        >
          <blockquote className="space-y-4">
            <p className="text-2xl leading-snug font-bold tracking-wide md:text-3xl">
              &ldquo;Tracking should take seconds, not minutes.&rdquo;
            </p>
            <footer className="text-xs text-muted-foreground">
              Built for clarity. Designed for consistency.
            </footer>
          </blockquote>
        </FadeIn>

        {/* Built for daily use — split two-column within centered container */}
        <section className="grid w-full max-w-2xl gap-3 text-left md:grid-cols-2">
          <FadeIn
            delay={0.08}
            className="border border-border bg-primary/5 p-6 md:col-span-1"
          >
            <SectionLabel>Built for daily use</SectionLabel>
            <p className="mt-4 text-sm font-semibold">No clutter</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Open the app, log your meal—or tap a saved recipe—and move on.
            </p>
          </FadeIn>
          <FadeIn
            delay={0.12}
            className="flex flex-col justify-center border border-border p-6"
          >
            <p className="text-xs font-semibold uppercase">Works across days</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Scroll through your week and compare progress effortlessly.
            </p>
          </FadeIn>
        </section>

        {/* FAQ — accordion-style list */}
        <section className="w-full max-w-2xl space-y-6 text-left">
          <FadeIn delay={0.08} className="text-center">
            <SectionLabel>Frequently asked questions</SectionLabel>
          </FadeIn>
          <div className="divide-y divide-border border border-border">
            {FAQ.map((item, index) => (
              <FadeIn
                key={item.q}
                delay={0.1 + index * 0.05}
                className="space-y-2 p-5"
              >
                <p className="text-sm font-semibold">{item.q}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <FadeIn
          delay={0.1}
          className="w-full max-w-xl space-y-4 border-t border-border pt-12"
        >
          <SectionLabel>Get started</SectionLabel>
          <p className="text-lg font-semibold">Start tracking today</p>
          <p className="text-sm text-muted-foreground">
            Create your free account and set your first goal in under a minute.
          </p>
          <motion.div
            initial={{
              opacity: 0,
              transform: shouldReduceMotion ? "none" : "translateY(8px)",
            }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{
              duration: 0.24,
              ease: EASE_OUT,
              delay: shouldReduceMotion ? 0 : 0.16,
            }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Button asChild size="lg">
              <Link href="/signup">Sign up free</Link>
            </Button>
            <Button variant="ghost" asChild size="lg">
              <Link href="/login">I already have an account</Link>
            </Button>
          </motion.div>
        </FadeIn>
      </div>
    </main>
  )
}
