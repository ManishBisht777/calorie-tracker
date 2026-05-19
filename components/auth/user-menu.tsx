"use client"

import { IconLogout } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function UserMenu({ email }: { email: string }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[200px] truncate text-xs text-muted-foreground sm:inline">
        {email}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="gap-1.5"
      >
        <IconLogout className="size-3.5" aria-hidden />
        Sign out
      </Button>
    </div>
  )
}
