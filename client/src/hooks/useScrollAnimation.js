import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Percentage of element visibility to trigger (0-1)
 * @param {string} options.rootMargin - Margin around root (e.g., '0px')
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once
 * @returns {Object} - { ref, isVisible }
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options

  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Skip if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            setHasTriggered(true)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return { ref, isVisible }
}

/**
 * Get animation classes based on visibility state and animation type
 * @param {boolean} isVisible - Whether element is visible
 * @param {string} animationType - Type of animation (fade, slide, scale, etc.)
 * @returns {string} - Animation class names
 */
export function getAnimationClasses(isVisible, animationType = 'fade') {
  const animations = {
    fade: isVisible
      ? 'opacity-100 transition-opacity duration-1000 ease-out'
      : 'opacity-0',

    'slide-up': isVisible
      ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out'
      : 'opacity-0 translate-y-10',

    'slide-down': isVisible
      ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out'
      : 'opacity-0 -translate-y-10',

    'slide-left': isVisible
      ? 'opacity-100 translate-x-0 transition-all duration-700 ease-out'
      : 'opacity-0 translate-x-10',

    'slide-right': isVisible
      ? 'opacity-100 translate-x-0 transition-all duration-700 ease-out'
      : 'opacity-0 -translate-x-10',

    scale: isVisible
      ? 'opacity-100 scale-100 transition-all duration-700 ease-out'
      : 'opacity-0 scale-95',

    'scale-up': isVisible
      ? 'opacity-100 scale-100 transition-all duration-700 ease-out'
      : 'opacity-0 scale-90',
  }

  return animations[animationType] || animations.fade
}

/**
 * Hook for staggered animations (for lists)
 * @param {number} itemCount - Number of items to animate
 * @param {number} staggerDelay - Delay between each item (in ms)
 * @returns {Object} - { ref, getItemStyle }
 */
export function useStaggerAnimation(itemCount, staggerDelay = 100) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  const getItemStyle = (index) => ({
    transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
  })

  return { ref, isVisible, getItemStyle }
}
