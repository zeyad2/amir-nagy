import { cn } from "@/lib/utils"

export function LoadingSpinner({ className, size = "default" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-sat-primary",
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingCard({ className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="skeleton h-4 w-3/4"></div>
      <div className="skeleton h-4 w-1/2"></div>
      <div className="skeleton h-20 w-full"></div>
    </div>
  )
}

export function LoadingTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="skeleton h-4 flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  )
}