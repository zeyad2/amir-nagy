import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselItem } from '@/components/ui/carousel'
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation'
import { Star, TrendingUp } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    initialScore: 980,
    finalScore: 1520,
    image: '/images/6044139903673026698.jpg',
    review: "Mr. Amir's teaching methods are exceptional. His dedication and proven strategies helped me improve my SAT score by 540 points! I couldn't have achieved my dream score without his guidance.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Ahmed K.',
    initialScore: 1100,
    finalScore: 1450,
    image: '/images/6044139903673026699.jpg',
    review: "The practice tests and detailed explanations helped me understand my mistakes and improve significantly. Mr. Amir's personalized approach made all the difference.",
    rating: 5,
  },
  {
    id: 3,
    name: 'Layla H.',
    initialScore: 1050,
    finalScore: 1480,
    image: '/images/6044139903673026701.jpg',
    review: "I was struggling with the reading section, but Mr. Amir's strategies and continuous support helped me boost my score by 430 points. Highly recommend!",
    rating: 5,
  },
  {
    id: 4,
    name: 'Omar F.',
    initialScore: 1200,
    finalScore: 1560,
    image: '/images/6044139903673026702.jpg',
    review: "Mr. Amir doesn't just teach you the material; he teaches you how to think critically and approach each question strategically. That's what made the biggest difference for me.",
    rating: 5,
  },
]

function TestimonialCard({ testimonial, style }) {
  return (
    <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-200" style={style}>
      <CardContent className="p-6">
        {/* Student Image & Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.textContent = testimonial.name.charAt(0)
              }}
            />
          </div>

          <div className="flex-1">
            <div className="font-semibold text-lg text-gray-900">{testimonial.name}</div>
            <div className="flex gap-0.5">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Score Improvement */}
        <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Score Improvement</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{testimonial.initialScore}</div>
              <div className="text-xs text-gray-500">Initial</div>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{testimonial.finalScore}</div>
              <div className="text-xs text-gray-500">Final</div>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              +{testimonial.finalScore - testimonial.initialScore} points
            </span>
          </div>
        </div>

        {/* Review */}
        <div className="text-gray-700 leading-relaxed italic">
          "{testimonial.review}"
        </div>
      </CardContent>
    </Card>
  )
}

export default function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 ${getAnimationClasses(isVisible, 'fade')}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Student Success Stories
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Real students. Real results. See how Mr. Amir Nagy's proven methods have transformed
            students' scores and opened doors to their dream universities.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div ref={ref} className={`max-w-4xl mx-auto mb-12 ${getAnimationClasses(isVisible, 'scale-up')}`}>
          <Carousel
            autoPlay={true}
            autoPlayInterval={5000}
            showControls={true}
            showIndicators={true}
          >
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </Carousel>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-12 ${getAnimationClasses(isVisible, 'fade')}`}>
          <p className="text-lg text-gray-700 mb-4 font-medium">
            Ready to join these successful students?
          </p>
          <a
            href="#courses"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            View Available Courses
          </a>
        </div>
      </div>
    </section>
  )
}
