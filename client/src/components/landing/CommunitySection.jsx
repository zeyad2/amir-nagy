import React from 'react'
import { Carousel, CarouselItem } from '@/components/ui/carousel'
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation'
import { Users, Heart, Sparkles } from 'lucide-react'

const communityImages = [
  {
    id: 1,
    src: '/images/6044139903673026703.jpg',
    alt: 'Students collaborating in study group',
    caption: 'Collaborative Learning',
  },
  {
    id: 2,
    src: '/images/6044139903673026704.jpg',
    alt: 'Students celebrating success',
    caption: 'Celebrating Success Together',
  },
  {
    id: 3,
    src: '/images/6044139903673026705.jpg',
    alt: 'Interactive classroom session',
    caption: 'Interactive Sessions',
  },
  {
    id: 4,
    src: '/images/6044139903673026706.jpg',
    alt: 'Students working on practice problems',
    caption: 'Dedicated Practice',
  },
]

export default function CommunitySection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section
      id="community"
      ref={ref}
      className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 ${getAnimationClasses(isVisible, 'fade')}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-600" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Join Our Thriving Community
            </h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            You're not just enrolling in a course — you're joining a supportive community
            of ambitious students working together toward their dream scores. Learn, grow,
            and succeed alongside peers who share your goals.
          </p>
        </div>

        {/* Carousel */}
        <div className={`max-w-5xl mx-auto mb-12 ${getAnimationClasses(isVisible, 'scale-up')}`}>
          <Carousel
            autoPlay={true}
            autoPlayInterval={4000}
            showControls={true}
            showIndicators={true}
          >
            {communityImages.map((image) => (
              <CarouselItem key={image.id}>
                <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-200 to-purple-200">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback placeholder if image doesn't exist
                      e.target.style.display = 'none'
                      const placeholder = document.createElement('div')
                      placeholder.className = 'w-full h-full flex flex-col items-center justify-center text-blue-600'
                      placeholder.innerHTML = `
                        <svg class="w-24 h-24 mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        <p class="text-2xl font-semibold">${image.caption}</p>
                      `
                      e.target.parentElement.appendChild(placeholder)
                    }}
                  />
                  {/* Caption Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <p className="text-white text-xl font-semibold">{image.caption}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </Carousel>
        </div>

        {/* Community Features */}
        <div className={`grid md:grid-cols-3 gap-8 max-w-5xl mx-auto ${getAnimationClasses(isVisible, 'slide-up')}`}>
          {/* Feature 1 */}
          <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Peer Support</h3>
            <p className="text-gray-600">
              Connect with fellow students, share study tips, and motivate each other
              throughout your SAT journey.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dedicated Support</h3>
            <p className="text-gray-600">
              Mr. Amir and our team are committed to your success, providing guidance
              and support every step of the way.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Proven Success</h3>
            <p className="text-gray-600">
              Join hundreds of students who have achieved their target scores and
              gained admission to their dream universities.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-12 ${getAnimationClasses(isVisible, 'fade')}`}>
          <p className="text-lg text-gray-700 mb-4 font-medium">
            Ready to be part of our success story?
          </p>
          <a
            href="#courses"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Enroll Now
          </a>
        </div>
      </div>
    </section>
  )
}
