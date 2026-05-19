import { UserMenu } from "@/components/auth/user-menu"
import { getAuthUser } from "@/lib/auth"

export async function AppHeader() {
  const user = await getAuthUser()

  if (!user) return null

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Calorie tracker
        </p>
        <UserMenu email={user.email ?? "Signed in"} />
      </div>
    </header>
  )
}
