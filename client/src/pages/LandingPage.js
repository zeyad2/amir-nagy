import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const { data: coursesData, isLoading } = useQuery(
    'public-courses',
    () => axios.get('/courses').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const courses = coursesData?.courses || [];

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
                <div key={course.id} className="card">
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="card-body">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        course.type === 'live' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {course.type === 'live' ? 'Live Sessions' : 'Self-Paced'}
                      </span>
                      {course.price && (
                        <span className="text-lg font-bold text-blue-600">
                          {course.price} EGP
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      {course._count.courseLessons} lessons • 
                      {course._count.courseHomeworks} homework • 
                      {course._count.courseTests} tests
                    </div>

                    <Link 
                      to={`/courses/${course.id}`}
                      className="btn btn-primary w-full"
                    >
                      View Details
                    </Link>
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