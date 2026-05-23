import { cn } from "@/lib/utils"

export function DiscreteSlider<T extends string>({
  options,
  value,
  onChange,
  inverted,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
  inverted?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="relative px-1 pt-2">
        <div
          className={cn(
            "absolute top-[calc(50%-10px)] right-0 left-0 h-px",
            inverted ? "bg-primary-foreground/25" : "bg-border"
          )}
        />
        <div className="relative flex justify-between">
          {options.map((option) => {
            const selected = option.id === value
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className="group flex flex-col items-center gap-3"
                aria-pressed={selected}
              >
                <span
                  className={cn(
                    "relative z-10 block size-3.5 border-2",
                    selected
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-widest uppercase",
                    inverted
                      ? selected
                        ? "text-primary-foreground"
                        : "text-primary-foreground/60"
                      : selected
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
