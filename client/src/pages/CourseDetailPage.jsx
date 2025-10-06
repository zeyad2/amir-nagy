import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.service';
import { useAuth } from '../utils/AuthContext';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import toast from 'react-hot-toast';
import LessonViewer from '../components/LessonViewer';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isStudent } = useAuth();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(res => res.data),
    enabled: !!id,
  });

  // Enrollment request mutation
  const enrollmentRequestMutation = useMutation({
    mutationFn: (courseId) => api.post('/student/enrollment-requests', { courseId }),
    onSuccess: () => {
      setShowSuccessAlert(true);
      queryClient.invalidateQueries(['course', id]);
      setTimeout(() => setShowSuccessAlert(false), 5000);
      toast.success('Enrollment request submitted successfully!');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to request enrollment';
      toast.error(errorMessage);
    }
  });

  const handleEnrollmentRequest = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    enrollmentRequestMutation.mutate(id);
  };

  // Auto-select first lesson when enrolled and lessons are available
  // Must be before early returns to comply with Rules of Hooks
  const { course, enrollment, enrollmentRequest } = data?.data || {};
  const isEnrolled = enrollment && enrollment.status === 'active';

  useEffect(() => {
    if (isEnrolled && course?.courseLessons?.length > 0 && !selectedLesson) {
      const firstLesson = course.courseLessons[0]?.lesson;
      if (firstLesson && firstLesson.videoLink) {
        setSelectedLesson(firstLesson);
      }
    }
  }, [isEnrolled, course, selectedLesson]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={isEnrolled ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'}>
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              ✓ Enrollment request submitted successfully! The admin will review your request shortly.
            </AlertDescription>
          </Alert>
        )}

        {/* Course Header */}
        <div className="card mb-8">
          {course.thumbnail && (
            <img
              src={`http://localhost:5000${course.thumbnail}`}
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
                {isEnrolled ? (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    ✓ Enrolled
                  </div>
                ) : enrollmentRequest ? (
                  <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    enrollmentRequest.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : enrollmentRequest.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {enrollmentRequest.status === 'pending' && '⏳'}
                    {enrollmentRequest.status === 'approved' && '✓'}
                    {enrollmentRequest.status === 'rejected' && '✗'}
                    Request {enrollmentRequest.status}
                  </div>
                ) : isAuthenticated && isStudent ? (
                  <Button
                    onClick={handleEnrollmentRequest}
                    disabled={enrollmentRequestMutation.isLoading}
                    className="bg-blue-600 hover:bg-blue-700 mt-3"
                  >
                    {enrollmentRequestMutation.isLoading ? 'Requesting...' : 'Request Enrollment'}
                  </Button>
                ) : !isAuthenticated ? (
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Up to Enroll
                  </Button>
                ) : null}
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>

        {/* Course Content */}
        {isEnrolled ? (
          /* Enrolled Student View - Learning Interface */
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Course Resources */}
            <div className="lg:col-span-1 space-y-4">
              {/* Lessons */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Lessons</h2>
                </div>
                <div className="card-body">
                  {course.courseLessons.length === 0 ? (
                    <p className="text-sm text-gray-500">No lessons available</p>
                  ) : (
                    <ul className="space-y-1">
                      {course.courseLessons.map((courseLesson, index) => (
                        <li key={courseLesson.id}>
                          <button
                            onClick={() => setSelectedLesson(courseLesson.lesson)}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                              selectedLesson?.id === courseLesson.lesson.id
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                              selectedLesson?.id === courseLesson.lesson.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900 text-left flex-1">
                              {courseLesson.lesson.title}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Homework */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Homework</h2>
                </div>
                <div className="card-body">
                  {course.courseHomeworks.length === 0 ? (
                    <p className="text-sm text-gray-500">No homework assigned</p>
                  ) : (
                    <ul className="space-y-1">
                      {course.courseHomeworks.map((courseHomework, index) => (
                        <li key={courseHomework.id}>
                          <button
                            onClick={() => navigate(`/courses/${id}/assessments/homework/${courseHomework.homework.id}`)}
                            className="w-full flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <span className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900 text-left flex-1">
                              {courseHomework.homework.title}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Tests */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Tests</h2>
                </div>
                <div className="card-body">
                  {course.courseTests.length === 0 ? (
                    <p className="text-sm text-gray-500">No tests available</p>
                  ) : (
                    <ul className="space-y-1">
                      {course.courseTests.map((courseTest, index) => (
                        <li key={courseTest.id}>
                          <button
                            onClick={() => navigate(`/courses/${id}/assessments/test/${courseTest.test.id}`)}
                            className="w-full flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <span className="w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900 text-left flex-1">
                              {courseTest.test.title}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Area - Lesson Viewer */}
            <div className="lg:col-span-3">
              <LessonViewer lesson={selectedLesson} />
            </div>
          </div>
        ) : (
          /* Non-Enrolled View - Preview Only */
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
                        <span className="text-gray-500">
                          {courseLesson.lesson.title}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">🔒</span>
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
                        <span className="text-gray-500">
                          {courseHomework.homework.title}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">🔒</span>
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
                        <span className="text-gray-500">
                          {courseTest.test.title}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">🔒</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

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