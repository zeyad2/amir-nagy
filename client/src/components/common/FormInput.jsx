import React from "react"
import { Input } from "@/components/ui/input"
import { FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"

export const FormInput = React.forwardRef(function FormInput({
  label,
  error,
  className,
  required = false,
  ...props
}, ref) {
  return (
    <FormField className={className}>
      {label && (
        <FormLabel error={error} required={required}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <Input
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...props}
        />
      </FormControl>
      <FormMessage error={error} />
    </FormField>
  )
})