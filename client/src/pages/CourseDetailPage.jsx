import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, isStudent } = useAuth();

  const { data, isLoading, error } = useQuery(
    ['course', id],
    () => axios.get(`/courses/${id}`).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card card-body text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const { course, enrollment, enrollmentRequest } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Course Header */}
        <div className="card mb-8">
          {course.thumbnail && (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.type === 'live' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {course.type === 'live' ? 'Live Sessions' : 'Self-Paced'}
                  </span>
                  {course.price && (
                    <span className="text-2xl font-bold text-blue-600">
                      {course.price} EGP
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {enrollment ? (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    ✓ Enrolled
                  </div>
                ) : enrollmentRequest ? (
                  <div className={`px-4 py-2 rounded-lg ${
                    enrollmentRequest.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : enrollmentRequest.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Request {enrollmentRequest.status}
                  </div>
                ) : isAuthenticated && isStudent ? (
                  <button className="btn btn-primary">
                    Request Enrollment
                  </button>
                ) : !isAuthenticated ? (
                  <a href="/register" className="btn btn-primary">
                    Sign Up to Enroll
                  </a>
                ) : null}
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Lessons */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Lessons</h2>
            </div>
            <div className="card-body">
              {course.courseLessons.length === 0 ? (
                <p className="text-gray-500">No lessons available</p>
              ) : (
                <ul className="space-y-2">
                  {course.courseLessons.map((courseLesson, index) => (
                    <li key={courseLesson.id} className="flex items-center p-2 rounded border">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className={enrollment ? 'text-gray-900' : 'text-gray-500'}>
                        {courseLesson.lesson.title}
                      </span>
                      {!enrollment && (
                        <span className="ml-auto text-xs text-gray-400">🔒</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Homework */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Homework</h2>
            </div>
            <div className="card-body">
              {course.courseHomeworks.length === 0 ? (
                <p className="text-gray-500">No homework assigned</p>
              ) : (
                <ul className="space-y-2">
                  {course.courseHomeworks.map((courseHomework, index) => (
                    <li key={courseHomework.id} className="flex items-center p-2 rounded border">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className={enrollment ? 'text-gray-900' : 'text-gray-500'}>
                        {courseHomework.homework.title}
                      </span>
                      {!enrollment && (
                        <span className="ml-auto text-xs text-gray-400">🔒</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Tests */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Tests</h2>
            </div>
            <div className="card-body">
              {course.courseTests.length === 0 ? (
                <p className="text-gray-500">No tests available</p>
              ) : (
                <ul className="space-y-2">
                  {course.courseTests.map((courseTest, index) => (
                    <li key={courseTest.id} className="flex items-center p-2 rounded border">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className={enrollment ? 'text-gray-900' : 'text-gray-500'}>
                        {courseTest.test.title}
                      </span>
                      {!enrollment && (
                        <span className="ml-auto text-xs text-gray-400">🔒</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Instructor Info */}
        <div className="card mt-8">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">About the Instructor</h2>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">👨‍🏫</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mr. Amir Nagy</h3>
                <p className="text-gray-600 mb-2">SAT & English Specialist</p>
                <p className="text-sm text-gray-700">
                  With over 10 years of experience in SAT preparation, Mr. Amir has helped 
                  hundreds of students achieve their target scores and gain admission to 
                  top universities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;