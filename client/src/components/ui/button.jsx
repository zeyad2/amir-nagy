import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  sat: "bg-sat-primary text-white hover:bg-blue-700",
  "sat-secondary": "bg-sat-secondary text-white hover:bg-green-700",
  "sat-outline": "border border-sat-primary text-sat-primary hover:bg-sat-primary hover:text-white"
}

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const safeVariant = buttonVariants[variant] || buttonVariants.default
  const safeSize = buttonSizes[size] || buttonSizes.default

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        safeVariant,
        safeSize,
        className
      )}
      ref={ref}
      {...(!asChild && { type: "button" })}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }