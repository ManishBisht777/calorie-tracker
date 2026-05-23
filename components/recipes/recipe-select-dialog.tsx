"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { RecipeQuickAdd } from "./recipe-quick-add"

type RecipeSelectDialogProps = {
  selectedDate: string
  refreshKey?: number
  onMealLogged?: (mealDate: string) => void
  trigger: React.ReactNode
}

export function RecipeSelectDialog({
  selectedDate,
  refreshKey = 0,
  onMealLogged,
  trigger,
}: RecipeSelectDialogProps) {
  const [open, setOpen] = useState(false)
  const [contentKey, setContentKey] = useState(0)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setContentKey((key) => key + 1)
    }
  }

  function handleMealLogged(mealDate: string) {
    onMealLogged?.(mealDate)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="min-w-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono font-semibold tracking-wide">
            Select a recipe
          </DialogTitle>
          <DialogDescription>
            Search your saved recipes and log one to this day.
          </DialogDescription>
        </DialogHeader>

        <RecipeQuickAdd
          key={contentKey}
          selectedDate={selectedDate}
          refreshKey={refreshKey}
          onMealLogged={handleMealLogged}
        />
      </DialogContent>
    </Dialog>
  )
}
