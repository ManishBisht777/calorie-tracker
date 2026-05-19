"use client"

import { IconFlame } from "@tabler/icons-react"
import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

export function LoginForm({ className }: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shouldReduceMotion = useReducedMotion()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "Could not sign you in. Please try again."
      : null
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    const next = searchParams.get("next") ?? "/"
    router.push(next)
    router.refresh()
  }

  async function handleGoogleSignIn() {
    setError(null)
    const supabase = createClient()
    const next = searchParams.get("next") ?? "/"

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (oauthError) {
      setError(oauthError.message)
    }
  }

  return (
    <div className="grid h-svh grid-cols-2">
      <div className="col-span-1 bg-gray-50"></div>
      <div className="col-span-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-sm">
          <FieldGroup>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0.5, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IconFlame className="size-5" aria-hidden />
              </div>
              <h1 className="text-xl font-bold">Welcome back</h1>
              <FieldDescription>
                Track smarter. Stay consistent.
              </FieldDescription>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0.5, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.04, ease: EASE_OUT }}
              className="space-y-4"
            >
              <Field className="gap-1">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </Field>
            </motion.div>

            <FieldSeparator>Or</FieldSeparator>

            <Field>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </Button>
            </Field>

            <FieldDescription className="text-center">
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
