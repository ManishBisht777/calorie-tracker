"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

import { InstallButton } from "@/components/pwa/install-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const STATS = [
  { value: "< 30s", label: "Average time to log a meal" },
  { value: "3", label: "Ways to add food to your day" },
  { value: "7", label: "Days visible on your dashboard" },
] as const

const BENTO_ITEMS = [
  {
    title: "Text logging",
    description:
      'Type what you ate — "two eggs, toast, black coffee" — and get an instant calorie estimate.',
    className: "col-span-2 row-span-2 min-h-44",
    accent: "bg-gray-50",
  },
  {
    title: "Calorie ring",
    description: "See remaining calories at a glance.",
    className: "col-span-1 row-span-1",
    accent: "bg-gray-50",
  },
  {
    title: "Macro split",
    description: "Protein, carbs, and fat tracked together.",
    className: "col-span-1 row-span-1",
    accent: "bg-gray-50",
  },
  {
    title: "Edit any meal",
    description: "Tap to fix portions or numbers after logging.",
    className: "col-span-1 row-span-1",
    accent: "bg-gray-50",
  },
  {
    title: "Pick any date",
    description: "Log yesterday's dinner or plan ahead.",
    className: "col-span-1 row-span-1",
    accent: "bg-gray-50",
  },
  // {
  //   title: "Goal calculator",
  //   description:
  //     "Set targets from your body stats using the Mifflin–St Jeor formula. Lose, maintain, or gain with adjusted macros.",
  //   className: "col-span-2 row-span-1",
  //   accent: "bg-primary/5",
  // },
] as const

const FEATURES = [
  {
    title: "Log by text",
    description:
      "Describe what you ate in plain language. The app estimates calories and macros for you.",
  },
  {
    title: "Manual entry",
    description:
      "Prefer precision? Enter meals yourself with full control over every number.",
  },
  {
    title: "Daily dashboard",
    description:
      "See calories eaten, remaining, and your macro breakdown for any day at a glance.",
  },
] as const

const STEPS = [
  {
    step: "01",
    title: "Set your goal",
    description:
      "Enter your stats and pick a target. We calculate your daily calorie budget.",
  },
  {
    step: "02",
    title: "Log your meals",
    description:
      "Add breakfast, lunch, dinner, and snacks as you go through the day.",
  },
  {
    step: "03",
    title: "Stay on track",
    description:
      "Watch your progress update in real time and adjust before the day ends.",
  },
] as const

const MACROS = [
  { label: "Protein", detail: "Supports muscle and recovery targets" },
  { label: "Carbs", detail: "Fuel for training and daily energy" },
  { label: "Fat", detail: "Balanced intake alongside your goal" },
] as const

const FAQ = [
  {
    q: "Do I need to weigh every ingredient?",
    a: "No. Text logging works for quick estimates. Switch to manual entry when you want exact numbers.",
  },
  {
    q: "Can I log meals from previous days?",
    a: "Yes. Change the date on any log screen and add or edit meals for that day.",
  },
  {
    q: "How are my calorie targets calculated?",
    a: "During onboarding we use your age, height, weight, activity level, and goal to set a daily budget.",
  },
  {
    q: "Is it free to start?",
    a: "Yes. Create an account, complete onboarding, and start tracking immediately.",
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
          <SectionLabel>Calorie tracker</SectionLabel>
          <h1 className="text-4xl leading-tight font-bold tracking-wide md:text-5xl">
            Know what you eat. Hit your goals.
          </h1>
          <p className="mx-auto text-sm leading-relaxed text-muted-foreground md:text-base">
            A simple way to log meals, track calories, and stay accountable
            without spreadsheets or guesswork.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <InstallButton />
          </div>
        </FadeIn>

        {/* Stats strip */}
        <section className="w-full max-w-2xl">
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
              The app is built around a single daily view — log fast, review
              often, adjust when you need to.
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

        {/* Feature list — stacked cards */}
        <section className="w-full max-w-xl space-y-6">
          <FadeIn delay={0.08}>
            <SectionLabel>What you get</SectionLabel>
          </FadeIn>
          <div className="space-y-3 text-left">
            {FEATURES.map((feature, index) => (
              <FadeIn
                key={feature.title}
                delay={0.1 + index * 0.06}
                className="border border-border bg-card p-5"
              >
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
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
            <SectionLabel>Macros, not just calories</SectionLabel>
            <p className="mx-auto max-w-lg text-sm text-muted-foreground">
              Your goal includes protein, carbs, and fat — not a single number
              in isolation.
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
              Built for people who want clarity without the friction.
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
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              No clutter. No distractions. Open the app, log a meal, and move on
              with your day.
            </p>
          </FadeIn>
          <FadeIn
            delay={0.12}
            className="flex flex-col justify-center border border-border p-6"
          >
            <p className="text-xs font-semibold uppercase">Works on any day</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Scroll through the week, jump to a date, and see how each day
              compared to your target.
            </p>
          </FadeIn>
        </section>

        {/* FAQ — accordion-style list */}
        <section className="w-full max-w-2xl space-y-6 text-left">
          <FadeIn delay={0.08} className="text-center">
            <SectionLabel>Common questions</SectionLabel>
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
          <p className="text-lg font-semibold">Ready to start tracking?</p>
          <p className="text-sm text-muted-foreground">
            Create a free account and set your first goal in under a minute.
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
            <InstallButton alwaysShow size="lg" variant="secondary" />
          </motion.div>
        </FadeIn>
      </div>
    </main>
  )
}
