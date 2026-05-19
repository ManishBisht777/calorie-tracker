import { Suspense } from "react"

import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <AuthPageShell>
        <Suspense>
          <LoginForm />
        </Suspense>
      </AuthPageShell>
    </div>
  )
}
