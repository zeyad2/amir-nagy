import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useStaggerAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation'
import { Users, TrendingUp, Award, Target } from 'lucide-react'

// Counter component for animating numbers
const Counter = ({ target, duration = 2000, suffix = '', shouldStart }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return

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
  }, [target, duration, shouldStart])

  return <>{count}{suffix}</>
}

const stats = [
  {
    id: 1,
    icon: Users,
    target: 200,
    suffix: '+',
    label: 'Students Taught',
    description: 'Successfully guided through SAT preparation',
    color: 'blue',
  },
  {
    id: 2,
    icon: TrendingUp,
    target: 1400,
    suffix: '+',
    label: 'Average Score',
    description: 'Consistent high performance across all students',
    color: 'green',
  },
  {
    id: 3,
    icon: Award,
    target: 95,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Students recommend our courses to others',
    color: 'purple',
  },
  {
    id: 4,
    icon: Target,
    target: 350,
    suffix: '+',
    label: 'Avg Improvement',
    description: 'Points gained from initial to final score',
    color: 'red',
  },
]

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    value: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    value: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    value: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    value: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
  },
}

export default function StatsSection() {
  const { ref, isVisible, getItemStyle } = useStaggerAnimation(stats.length, 100)

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Proven Track Record
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Numbers don't lie. See the impact of our teaching methods on student success.
          </p>
        </div>

        {/* Stats Grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const colors = colorClasses[stat.color]

            return (
              <div
                key={stat.id}
                className={getAnimationClasses(isVisible, 'scale-up')}
                style={getItemStyle(index)}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-200 h-full">
                  <CardContent className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${colors.icon}`} />
                    </div>

                    {/* Value */}
                    <div className={`text-4xl md:text-5xl font-bold mb-2 ${colors.value}`}>
                      <Counter target={stat.target} suffix={stat.suffix} shouldStart={isVisible} />
                    </div>

                    {/* Label */}
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      {stat.label}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-12">
          <p className="text-gray-700 text-lg max-w-3xl mx-auto italic">
            "These aren't just numbers — they represent real students who achieved their
            dreams through hard work, dedication, and the right guidance."
          </p>
          <p className="text-blue-600 font-semibold mt-2">— Mr. Amir Nagy</p>
        </div>
      </div>
    </section>
  )
}
