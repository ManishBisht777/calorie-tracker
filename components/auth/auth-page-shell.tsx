"use client"

import { motion, useReducedMotion } from "motion/react"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
