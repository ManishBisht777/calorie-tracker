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

type LogMode = "photo" | "text" | "manual"

const LOG_MODES: { id: LogMode; label: string; description: string }[] = [
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

type LogMealProps = {
  onMealSaved?: (mealDate: string) => void
}

export default function LogMeal({ onMealSaved }: LogMealProps) {
  const [open, setOpen] = useState(false)
  const [logMode, setLogMode] = useState<LogMode>("photo")
  const [flowKey, setFlowKey] = useState(0)

  function handleModeChange(mode: LogMode) {
    setLogMode(mode)
    setFlowKey((k) => k + 1)
  }

  function handleMealSaved(mealDate: string) {
    toast.success("Meal saved")
    onMealSaved?.(mealDate)
    setOpen(false)
    setFlowKey((k) => k + 1)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setFlowKey((k) => k + 1)
      setLogMode("photo")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full">Log meal</Button>
      </DialogTrigger>
      <DialogContent className="min-w-xl">
        <DialogHeader>
          <DialogTitle className="font-mono font-semibold tracking-wide">
            Log meal
          </DialogTitle>
          <DialogDescription>
            Photo, describe by name, or enter nutrition manually.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {LOG_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={logMode === mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={cn(
                "border px-2 py-2.5 text-left transition-colors",
                logMode === mode.id
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
          {logMode === "photo" && (
            <PhotoAnalysis key={flowKey} onSaved={handleMealSaved} />
          )}
          {logMode === "text" && (
            <TextAnalysis key={flowKey} onSaved={handleMealSaved} />
          )}
          {logMode === "manual" && (
            <ManualEntry key={flowKey} onSaved={handleMealSaved} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
