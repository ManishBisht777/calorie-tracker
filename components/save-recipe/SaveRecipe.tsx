"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "../ui/dialog"
import { cn } from "@/lib/utils"
import PhotoAnalysis from "./PhotoAnalysis"
import TextAnalysis from "./TextAnalysis"
import ManualEntry from "./ManualEntry"
import { toast } from "sonner"
import If from "../ui/If"

type SaveMode = "photo" | "text" | "manual"

const SAVE_MODES: { id: SaveMode; label: string; description: string }[] = [
  {
    id: "photo",
    label: "Photo",
    description: "Upload a food photo for AI analysis",
  },
  {
    id: "text",
    label: "By name",
    description: "Describe the meal and AI estimates macros",
  },
  {
    id: "manual",
    label: "Manual",
    description: "Enter all nutrition details yourself",
  },
]

type SaveRecipeProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onRecipeSaved?: () => void
  trigger?: React.ReactNode
}

export default function SaveRecipe({
  open: controlledOpen,
  onOpenChange,
  onRecipeSaved,
  trigger,
}: SaveRecipeProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [saveMode, setSaveMode] = useState<SaveMode>("photo")
  const [flowKey, setFlowKey] = useState(0)

  const open = controlledOpen ?? internalOpen

  function handleModeChange(mode: SaveMode) {
    setSaveMode(mode)
    setFlowKey((k) => k + 1)
  }

  function handleRecipeSaved() {
    toast.success("Recipe saved")
    onRecipeSaved?.()
    handleOpenChange(false)
  }

  function handleOpenChange(next: boolean) {
    if (onOpenChange) {
      onOpenChange(next)
    } else {
      setInternalOpen(next)
    }

    if (!next) {
      setFlowKey((k) => k + 1)
      setSaveMode("photo")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : null}
      <DialogContent className="min-w-xl">
        <DialogHeader>
          <DialogTitle className="font-mono font-semibold tracking-wide">
            Save recipe
          </DialogTitle>
          <DialogDescription>
            Photo, describe by name, or enter nutrition manually.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {SAVE_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={saveMode === mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={cn(
                "border px-2 py-2.5 text-left transition-colors",
                saveMode === mode.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <span className="block text-sm font-semibold">{mode.label}</span>
              <span className="mt-0.5 block text-xs leading-tight text-muted-foreground">
                {mode.description}
              </span>
            </button>
          ))}
        </div>

        <div>
          <If condition={saveMode === "photo"}>
            <PhotoAnalysis key={flowKey} onSaved={handleRecipeSaved} />
          </If>
          <If condition={saveMode === "text"}>
            <TextAnalysis key={flowKey} onSaved={handleRecipeSaved} />
          </If>
          <If condition={saveMode === "manual"}>
            <ManualEntry key={flowKey} onSaved={handleRecipeSaved} />
          </If>
        </div>
      </DialogContent>
    </Dialog>
  )
}
