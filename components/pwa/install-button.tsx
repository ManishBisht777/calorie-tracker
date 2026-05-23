"use client"

import { IconDownload } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  )
}

function isIosSafari() {
  if (typeof window === "undefined") return false

  const ua = window.navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(ua) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  )
}

function showManualInstallInstructions() {
  if (isIosSafari()) {
    toast("Add to Home Screen", {
      description: "Tap Share, then choose Add to Home Screen.",
    })
    return
  }

  toast("Install this app", {
    description:
      "Open your browser menu and choose Install app or Add to Home Screen.",
  })
}

export function InstallButton({
  className,
  size = "default",
  variant = "outline",
  alwaysShow = false,
}: {
  className?: string
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline" | "secondary" | "ghost"
  alwaysShow?: boolean
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isStandaloneDisplayMode()) return

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [mounted])

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setDeferredPrompt(null)
      }

      return
    }

    showManualInstallInstructions()
  }

  if (!mounted) return null
  if (isStandaloneDisplayMode()) return null
  if (!alwaysShow && !deferredPrompt && !isIosSafari()) return null

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void handleInstall()}
    >
      <IconDownload data-icon="inline-start" />
      Install app
    </Button>
  )
}
