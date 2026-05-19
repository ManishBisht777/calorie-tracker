import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <AuthPageShell>
        <SignupForm />
      </AuthPageShell>
    </div>
  )
}
