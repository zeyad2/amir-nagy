import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
// import { useStaggerAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation'
import { BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react'

export default function CoursesSection({ courses = [], isLoading = false }) {
  // const { ref, isVisible, getItemStyle } = useStaggerAnimation(courses.length, 100)

  return (
    <section id="courses" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Available Courses
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive SAT preparation courses designed to help you
            achieve your target score and unlock your dream university.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading courses...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No courses available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new courses!</p>
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && courses.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)] max-w-sm"
              >
                <Card className="group h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300">
                  {/* Course Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {course.thumbnail ? (
                      <img
                        src={`http://localhost:5000${course.thumbnail}`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-20 h-20 text-white/80" />
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Course Type and Title */}
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        {course.type === 'live' ? 'Live Course' : 'Finished Course'}
                      </span>
                      <h3 className="text-xl font-bold mt-1 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                        <BookOpen className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="font-semibold text-gray-900">{course._count?.courseLessons || 0}</span>
                        <span className="text-xs text-gray-600">Lessons</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mb-1" />
                        <span className="font-semibold text-gray-900">{course._count?.courseHomeworks || 0}</span>
                        <span className="text-xs text-gray-600">Homework</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600 mb-1" />
                        <span className="font-semibold text-gray-900">{course._count?.courseTests || 0}</span>
                        <span className="text-xs text-gray-600">Tests</span>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      {course.price && (
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {course.price}
                            <span className="text-sm font-normal text-gray-500 ml-1">EGP</span>
                          </div>
                        </div>
                      )}
                      <Link
                        to={`/courses/${course.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg group-hover:scale-105"
                      >
                        View Details →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!isLoading && courses.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-4">
              Not sure which course is right for you?
            </p>
            <a
              href="mailto:amir.nagy@example.com"
              className="inline-block bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Contact Us for Guidance
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
