import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['public-courses'],
    queryFn: () => axios.get('/api/courses').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const courses = coursesData?.data?.courses || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Master the SAT with 
                <span className="block text-blue-200">Mr. Amir Nagy</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Achieve your target score with personalized instruction, 
                proven strategies, and comprehensive practice materials.
              </p>
              <div className="space-x-4">
                <Link to="#courses" className="btn btn-primary bg-white text-blue-600 hover:bg-blue-50">
                  View Courses
                </Link>
                <Link to="/register" className="btn btn-outline border-white text-white hover:bg-white hover:text-blue-600">
                  Get Started
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="w-64 h-64 bg-white rounded-full mx-auto flex items-center justify-center">
                <span className="text-6xl">👨‍🏫</span>
              </div>
              <p className="mt-4 text-blue-200">
                Expert SAT Instructor with 10+ Years Experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="card card-body">
              <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-700">Students Taught</div>
            </div>
            <div className="card card-body">
              <div className="text-3xl font-bold text-green-600 mb-2">1400+</div>
              <div className="text-gray-700">Average Score Improvement</div>
            </div>
            <div className="card card-body">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-700">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available Courses
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive SAT preparation courses designed 
              to help you achieve your target score.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No courses available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Course Thumbnail */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {course.thumbnail ? (
                      <img
                        src={`http://localhost:5000${course.thumbnail}`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-6xl">📚</span>
                      </div>
                    )}
                    {/* Course Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                        course.type === 'live'
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {course.type === 'live' ? '🔴 Live Sessions' : '📼 Self-Paced'}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>📖</span>
                        <span>{course._count.courseLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📝</span>
                        <span>{course._count.courseHomeworks} HW</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📊</span>
                        <span>{course._count.courseTests} tests</span>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {course.price && (
                        <div className="text-2xl font-bold text-blue-600">
                          {course.price} <span className="text-sm font-normal text-gray-500">EGP</span>
                        </div>
                      )}
                      <Link
                        to={`/courses/${course.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card card-body">
              <div className="mb-4">
                <span className="text-4xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 mb-4">
                "Mr. Amir's teaching methods are exceptional. I improved my SAT score 
                by 300 points in just 3 months!"
              </p>
              <div className="font-semibold">Sarah M.</div>
              <div className="text-sm text-gray-500">Score: 1200 → 1500</div>
            </div>

            <div className="card card-body">
              <div className="mb-4">
                <span className="text-4xl">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 mb-4">
                "The practice tests and detailed explanations helped me understand 
                my mistakes and improve significantly."
              </p>
              <div className="font-semibold">Ahmed K.</div>
              <div className="text-sm text-gray-500">Score: 1100 → 1450</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card card-body">
              <h3 className="font-semibold mb-2">How long are the courses?</h3>
              <p className="text-gray-600">
                Course duration varies. Live courses typically run for 8-12 weeks, 
                while recorded courses can be completed at your own pace.
              </p>
            </div>

            <div className="card card-body">
              <h3 className="font-semibold mb-2">Can I get a refund if I'm not satisfied?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee for all our courses. 
                Contact us within the first week if you're not completely satisfied.
              </p>
            </div>

            <div className="card card-body">
              <h3 className="font-semibold mb-2">Do you provide practice tests?</h3>
              <p className="text-gray-600">
                Yes! All courses include multiple practice tests, detailed answer 
                explanations, and personalized performance tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your SAT Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of students who have achieved their target scores with our help.
          </p>
          <Link to="/register" className="btn btn-primary bg-white text-blue-600 hover:bg-blue-50">
            Enroll Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;