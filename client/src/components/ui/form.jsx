import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

const FormField = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {children}
  </div>
))
FormField.displayName = "FormField"

const FormLabel = React.forwardRef(({ className, error, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(
      "text-sm font-medium",
      error && "text-destructive",
      className
    )}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative", className)} {...props} />
))
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef(({ className, error, ...props }, ref) => {
  if (!error) return null

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {error}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}