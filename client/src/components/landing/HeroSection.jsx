import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation'

// Counter component for animating numbers
const Counter = ({ target, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime = null
    const startValue = 0

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return <>{count}{suffix}</>
}

export default function HeroSection() {
  const { ref: heroRef, isVisible } = useScrollAnimation({ threshold: 0.2 })
  const [displayedText, setDisplayedText] = useState('')
  const fullText = "Scores Speak Louder Than Words."

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 80)

    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className={getAnimationClasses(isVisible, 'slide-right')}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight min-h-[4.5rem] md:min-h-[5.5rem] lg:min-h-[6.5rem]">
              {displayedText}
              <span className="animate-pulse">|</span>
            </h1>

            <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed">
              Your score = Your dream. Behind every great result is a great teacher.
              With Mr. Amir Nagy's proven methods and dedication, students don't just
              prepare — they succeed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
              >
                <Link to="/register">Get Started</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 font-semibold text-lg px-8 py-6 shadow-xl"
              >
                <Link to="#testimonials">View Success Stories</Link>
              </Button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className={getAnimationClasses(isVisible, 'slide-left')}>
            <div className="relative max-w-md mx-auto">
              {/* Decorative Circle Background */}
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-3xl transform scale-110" />

              {/* Image Container */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-3">
                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {/* Placeholder for Mr. Amir's Image */}
                  <img
                    src="/images/amir-nagy-pic.png"
                    alt="Mr. Amir Nagy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full text-blue-600">
                          <svg class="w-32 h-32 mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                          </svg>
                          <p class="text-2xl font-semibold">Mr. Amir Nagy</p>
                          <p class="text-sm text-blue-500">SAT Expert Instructor</p>
                        </div>
                      `
                    }}
                  />
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-3 -right-3 bg-red-600 text-white px-4 py-2 rounded-xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="text-xl font-bold">10+ Years</div>
                  <div className="text-xs">Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
