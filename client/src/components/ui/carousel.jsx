import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const Carousel = React.forwardRef(({
  className,
  children,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  ...props
}, ref) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const items = React.Children.toArray(children)
  const itemCount = items.length

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % itemCount)
  }, [itemCount])

  const goToPrev = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount)
  }, [itemCount])

  const goToIndex = React.useCallback((index) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || isHovered || itemCount <= 1) return

    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isHovered, goToNext, itemCount])

  if (itemCount === 0) return null

  return (
    <div
      ref={ref}
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Carousel Content */}
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="min-w-full">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && itemCount > 1 && (
        <>
          <button
            onClick={goToPrev}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2",
              "shadow-lg transition-all opacity-0 group-hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          <button
            onClick={goToNext}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2",
              "shadow-lg transition-all opacity-0 group-hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && itemCount > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
})
Carousel.displayName = "Carousel"

const CarouselItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
})
CarouselItem.displayName = "CarouselItem"

export { Carousel, CarouselItem }
