"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value: string
  onChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("Select components must be used within Select")
  return context
}

const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect()
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) => {
  const { value } = useSelect()
  return <span className="truncate">{children || value || placeholder || ""}</span>
}

const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { open } = useSelect()
  if (!open) return null
  return (
    <div className={cn(
      "absolute z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1",
      className
    )}>
      <div className="p-1 max-h-60 overflow-auto">{children}</div>
    </div>
  )
}

const SelectItem = ({ value, children, disabled }: { value: string; children: React.ReactNode; disabled?: boolean }) => {
  const { value: selectedValue, onChange, setOpen } = useSelect()
  const isSelected = selectedValue === value

  return (
    <div
      onClick={() => {
        if (!disabled) {
          onChange(value)
          setOpen(false)
        }
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "opacity-50 pointer-events-none",
        isSelected && "bg-accent text-accent-foreground"
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
