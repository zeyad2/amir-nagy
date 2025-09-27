import { useState, useRef, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

const PullToRefresh = ({
  onRefresh,
  children,
  refreshThreshold = 60,
  resistance = 2.5,
  enabled = true,
  className = ''
}) => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  const containerRef = useRef(null)
  const pullIndicatorRef = useRef(null)

  // Check if element is scrolled to top
  const isAtTop = () => {
    const container = containerRef.current
    if (!container) return true

    // Check if we're at the very top of the scroll container
    return container.scrollTop === 0
  }

  // Handle touch start
  const handleTouchStart = (e) => {
    if (!enabled || !isAtTop()) return

    const touch = e.touches[0]
    setStartY(touch.clientY)
    setCurrentY(touch.clientY)
  }

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!enabled || !isAtTop() || isRefreshing) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY

    // Only pull if moving downward and we're at the top
    if (deltaY > 0 && isAtTop()) {
      e.preventDefault() // Prevent scrolling

      setCurrentY(touch.clientY)
      const distance = Math.max(0, deltaY / resistance)
      setPullDistance(distance)

      if (distance > 10) {
        setIsPulling(true)
      }
    }
  }

  // Handle touch end
  const handleTouchEnd = () => {
    if (!enabled || isRefreshing) return

    if (isPulling && pullDistance >= refreshThreshold) {
      // Trigger refresh
      setIsRefreshing(true)

      // Call onRefresh and handle promise
      const refreshPromise = onRefresh?.()

      if (refreshPromise && typeof refreshPromise.then === 'function') {
        refreshPromise
          .finally(() => {
            setTimeout(() => {
              setIsRefreshing(false)
              setIsPulling(false)
              setPullDistance(0)
            }, 300)
          })
      } else {
        // No promise returned, auto-complete after delay
        setTimeout(() => {
          setIsRefreshing(false)
          setIsPulling(false)
          setPullDistance(0)
        }, 1000)
      }
    } else {
      // Reset if threshold not met
      setIsPulling(false)
      setPullDistance(0)
    }

    setStartY(0)
    setCurrentY(0)
  }

  // Mouse events for desktop testing (optional)
  const handleMouseDown = (e) => {
    if (!enabled || !isAtTop()) return
    setStartY(e.clientY)
    setCurrentY(e.clientY)
  }

  const handleMouseMove = (e) => {
    if (!enabled || !isAtTop() || startY === 0 || isRefreshing) return

    const deltaY = e.clientY - startY

    if (deltaY > 0) {
      e.preventDefault()
      setCurrentY(e.clientY)
      const distance = Math.max(0, deltaY / resistance)
      setPullDistance(distance)

      if (distance > 10) {
        setIsPulling(true)
      }
    }
  }

  const handleMouseUp = () => {
    if (startY !== 0) {
      handleTouchEnd()
    }
  }

  // Calculate rotation and scale for pull indicator
  const indicatorRotation = Math.min(pullDistance * 3, 360)
  const indicatorScale = Math.min(0.5 + (pullDistance / refreshThreshold) * 0.5, 1)
  const indicatorOpacity = Math.min(pullDistance / (refreshThreshold * 0.5), 1)

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        transform: isPulling ? `translateY(${Math.min(pullDistance, refreshThreshold)}px)` : 'translateY(0)',
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        ref={pullIndicatorRef}
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full
                   flex flex-col items-center justify-center p-4 text-gray-600 z-50
                   transition-all duration-200 ${isPulling ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translateX(-50%) translateY(${pullDistance - refreshThreshold}px)`,
          opacity: indicatorOpacity
        }}
      >
        {/* Refresh icon with rotation and scaling */}
        <div
          className={`mb-2 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: `rotate(${indicatorRotation}deg) scale(${indicatorScale})`
          }}
        >
          <RefreshCw
            className={`h-6 w-6 ${
              pullDistance >= refreshThreshold
                ? 'text-sat-primary'
                : 'text-gray-400'
            }`}
          />
        </div>

        {/* Status text */}
        <div className="text-xs font-medium text-center">
          {isRefreshing ? (
            <span className="text-sat-primary">Refreshing...</span>
          ) : pullDistance >= refreshThreshold ? (
            <span className="text-sat-primary">Release to refresh</span>
          ) : isPulling ? (
            <span className="text-gray-600">Pull to refresh</span>
          ) : null}
        </div>

        {/* Progress indicator */}
        {isPulling && !isRefreshing && (
          <div className="mt-2 w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sat-primary transition-all duration-100 rounded-full"
              style={{
                width: `${Math.min((pullDistance / refreshThreshold) * 100, 100)}%`
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

export default PullToRefresh