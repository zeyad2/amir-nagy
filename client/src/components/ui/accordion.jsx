import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext({})

const Accordion = React.forwardRef(({ className, children, type = "single", collapsible = true, ...props }, ref) => {
  const [openItems, setOpenItems] = React.useState([])

  const toggleItem = (value) => {
    if (type === "single") {
      setOpenItems((prev) => {
        if (prev.includes(value)) {
          return collapsible ? [] : prev
        }
        return [value]
      })
    } else {
      setOpenItems((prev) => {
        if (prev.includes(value)) {
          return prev.filter((item) => item !== value)
        }
        return [...prev, value]
      })
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef(({ className, value, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("border rounded-lg", className)} {...props} data-value={value}>
      {children}
    </div>
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { openItems, toggleItem } = React.useContext(AccordionContext)
  const isOpen = openItems.includes(value)

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-gray-50",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg",
        className
      )}
      onClick={() => toggleItem(value)}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = openItems.includes(value)

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      )}
      {...props}
    >
      <div className={cn("p-4 pt-0 text-gray-600", className)}>{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
