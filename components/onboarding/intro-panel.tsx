"use client"

import { IconGauge } from "@tabler/icons-react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

import { EASE_OUT } from "./constants"

const FEATURES = [
  {
    title: "Based on Mifflin–St Jeor",
    description: "Most accurate BMR formula for daily use",
    dotColor: "#8BC34A",
  },
  {
    title: "Macros included",
    description: "Protein, carbs & fat targets calculated",
    dotColor: "#FFAB91",
  },
  {
    title: "Goal-adjusted",
    description: "Calorie targets shift based on your goal",
    dotColor: "#9575CD",
  },
] as const

function FeatureCard({
  title,
  description,
  dotColor,
  delay,
}: {
  title: string
  description: string
  dotColor: string
  delay: number
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
        duration: 0.22,
        ease: EASE_OUT,
        delay: shouldReduceMotion ? 0 : delay,
      }}
      className="flex gap-3 border bg-card p-6"
    >
      <span
        className="mt-1.5 size-2.5 shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

export function IntroPanel({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{
        opacity: 0,
        transform: shouldReduceMotion ? "none" : "translateX(-16px)",
      }}
      animate={{ opacity: 1, transform: "translateX(0)" }}
      exit={{
        opacity: 0,
        transform: shouldReduceMotion ? "none" : "translateX(-16px)",
      }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className={cn("flex flex-col gap-8 p-8", className)}
    >
      <div className="space-y-6">
        <div className="flex size-12 items-center justify-center rounded-md bg-primary/10">
          <IconGauge className="size-6 text-primary" stroke={1.75} />
        </div>
        <div className="space-y-3">
          <h1 className="font-mono text-xl font-bold tracking-wide uppercase lg:text-2xl">
            Calories calculator
          </h1>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Calculate optimal macronutrient ratios for your body. Enter your
            age, height, weight, gender, and activity level.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            dotColor={feature.dotColor}
            delay={0.08 + index * 0.06}
          />
        ))}
      </div>
    </motion.div>
  )
}
