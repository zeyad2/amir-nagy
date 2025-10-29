import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.service';
import { useAuth } from '../utils/AuthContext';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import toast from 'react-hot-toast';
import LessonViewer from '../components/LessonViewer';
import FileIcon from '../components/common/FileIcon';
import { formatFileSize } from '../utils/fileHelpers';
import { Download } from 'lucide-react';

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
        <div className="loading animate-pulse">
          <div className="spinner animate-spin"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fadeIn">
        <div className="card card-body text-center transform transition-all duration-500 hover:scale-105">
          <h2 className="text-xl font-semibold text-red-600 mb-2 animate-slideDown">Course Not Found</h2>
          <p className="text-gray-600 animate-slideDown animation-delay-200">The course you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className={isEnrolled ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'}>
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 bg-green-50 border-green-200 animate-slideDown">
            <AlertDescription className="text-green-800">
              ✓ Enrollment request submitted successfully! The admin will review your request shortly.
            </AlertDescription>
          </Alert>
        )}

        {/* Course Header */}
        <div className="card mb-8 overflow-hidden animate-slideUp">
          {course.thumbnail && (
            <img
              src={`http://localhost:5000${course.thumbnail}`}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="card-body">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
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

              <div className="text-right mt-6">
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
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    {enrollmentRequestMutation.isLoading ? 'Requesting...' : 'Request Enrollment'}
                  </Button>
                ) : !isAuthenticated ? (
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Sign Up to Enroll
                  </Button>
                ) : null}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              {course.description}
            </p>

            {/* Course Type Info Section */}
            {!isEnrolled && (
              <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                course.type === 'live'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-blue-50 border-blue-500'
              } animate-fadeIn animation-delay-200`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {course.type === 'live' ? '📅' : '🎥'}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {course.type === 'live' ? 'Live Interactive Sessions' : 'Self-Paced Learning'}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {course.type === 'live'
                        ? 'This course features live, interactive sessions with Mr. Amir Nagy. Attend scheduled classes, participate in real-time discussions, and get immediate feedback. Perfect for students who thrive in a structured, interactive learning environment with direct instructor support.'
                        : 'This course contains pre-recorded video lessons that you can watch anytime, anywhere. Learn at your own pace, revisit lessons as needed, and complete assignments on your schedule. Ideal for students who prefer flexibility and independent study.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                            onClick={() => navigate(`/student/assessment/${courseHomework.homework.id}`)}
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
                            onClick={() => navigate(`/student/assessment/${courseTest.test.id}`)}
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

              {/* Files */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Course Files</h2>
                </div>
                <div className="card-body">
                  {!course.courseFiles || course.courseFiles.length === 0 ? (
                    <p className="text-sm text-gray-500">No files available</p>
                  ) : (
                    <ul className="space-y-1">
                      {course.courseFiles.map((courseFile, index) => (
                        <li key={courseFile.id}>
                          <div className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <FileIcon mimeType={courseFile.courseFile.mimeType} size={28} className="mr-3" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {courseFile.courseFile.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {courseFile.courseFile.fileName} • {formatFileSize(parseInt(courseFile.courseFile.fileSize))}
                              </p>
                            </div>
                            <a
                              href={courseFile.courseFile.fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Lessons */}
            <div className="card transition-all duration-500 hover:shadow-xl animate-slideUp animation-delay-100 hover:-translate-y-1">
              <div className="card-header bg-gradient-to-r from-blue-50 to-blue-100 transition-all duration-300">
                <h2 className="text-xl font-semibold text-blue-900">Lessons</h2>
              </div>
              <div className="card-body">
                {course.courseLessons.length === 0 ? (
                  <p className="text-gray-500 animate-fadeIn">No lessons available</p>
                ) : (
                  <ul className="space-y-2">
                    {course.courseLessons.map((courseLesson, index) => (
                      <li
                        key={courseLesson.id}
                        className="group relative flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed transition-all duration-300 hover:opacity-90 hover:scale-[1.03] hover:shadow-lg hover:border-blue-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                        title="Enroll to access this content"
                      >
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 font-medium flex-1 group-hover:text-gray-800 transition-colors duration-300">
                          {courseLesson.lesson.title}
                        </span>
                        <span className="ml-auto text-lg text-orange-500 group-hover:text-orange-600 transition-all duration-300 group-hover:scale-125">
                          🔒
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Homework */}
            <div className="card transition-all duration-500 hover:shadow-xl animate-slideUp animation-delay-200 hover:-translate-y-1">
              <div className="card-header bg-gradient-to-r from-green-50 to-green-100 transition-all duration-300">
                <h2 className="text-xl font-semibold text-green-900">Homework</h2>
              </div>
              <div className="card-body">
                {course.courseHomeworks.length === 0 ? (
                  <p className="text-gray-500 animate-fadeIn">No homework assigned</p>
                ) : (
                  <ul className="space-y-2">
                    {course.courseHomeworks.map((courseHomework, index) => (
                      <li
                        key={courseHomework.id}
                        className="group relative flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed transition-all duration-300 hover:opacity-90 hover:scale-[1.03] hover:shadow-lg hover:border-green-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                        title="Enroll to access this content"
                      >
                        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 transition-all duration-300 group-hover:bg-green-600 group-hover:text-white group-hover:scale-110">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 font-medium flex-1 group-hover:text-gray-800 transition-colors duration-300">
                          {courseHomework.homework.title}
                        </span>
                        <span className="ml-auto text-lg text-orange-500 group-hover:text-orange-600 transition-all duration-300 group-hover:scale-125">
                          🔒
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Tests */}
            <div className="card transition-all duration-500 hover:shadow-xl animate-slideUp animation-delay-300 hover:-translate-y-1">
              <div className="card-header bg-gradient-to-r from-purple-50 to-purple-100 transition-all duration-300">
                <h2 className="text-xl font-semibold text-purple-900">Tests</h2>
              </div>
              <div className="card-body">
                {course.courseTests.length === 0 ? (
                  <p className="text-gray-500 animate-fadeIn">No tests available</p>
                ) : (
                  <ul className="space-y-2">
                    {course.courseTests.map((courseTest, index) => (
                      <li
                        key={courseTest.id}
                        className="group relative flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed transition-all duration-300 hover:opacity-90 hover:scale-[1.03] hover:shadow-lg hover:border-purple-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                        title="Enroll to access this content"
                      >
                        <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:scale-110">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 font-medium flex-1 group-hover:text-gray-800 transition-colors duration-300">
                          {courseTest.test.title}
                        </span>
                        <span className="ml-auto text-lg text-orange-500 group-hover:text-orange-600 transition-all duration-300 group-hover:scale-125">
                          🔒
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Files */}
            <div className="card transition-all duration-500 hover:shadow-xl animate-slideUp animation-delay-400 hover:-translate-y-1">
              <div className="card-header bg-gradient-to-r from-orange-50 to-orange-100 transition-all duration-300">
                <h2 className="text-xl font-semibold text-orange-900">Course Files</h2>
              </div>
              <div className="card-body">
                {!course.courseFiles || course.courseFiles.length === 0 ? (
                  <p className="text-gray-500 animate-fadeIn">No files available</p>
                ) : (
                  <ul className="space-y-2">
                    {course.courseFiles.map((courseFile, index) => (
                      <li
                        key={courseFile.id}
                        className="group relative flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed transition-all duration-300 hover:opacity-90 hover:scale-[1.03] hover:shadow-lg hover:border-orange-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                        title="Enroll to access this content"
                      >
                        <FileIcon
                          mimeType={courseFile.courseFile.mimeType}
                          size={32}
                          className="mr-3 flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        />
                        <span className="text-gray-600 font-medium flex-1 group-hover:text-gray-800 transition-colors duration-300 truncate">
                          {courseFile.courseFile.title}
                        </span>
                        <span className="ml-auto text-lg text-orange-500 group-hover:text-orange-600 transition-all duration-300 group-hover:scale-125">
                          🔒
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructor Info */}
        <div className="card mt-8 transition-all duration-500 hover:shadow-xl animate-slideUp animation-delay-400 hover:-translate-y-1">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4 animate-fadeIn">About the Instructor</h2>
            <div className="flex items-start space-x-4">
              <img
                src="/images/amir-nagy-pic.png"
                alt="Mr. Amir Nagy"
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow-md transition-all duration-500 hover:scale-110 hover:border-blue-300 hover:shadow-xl animate-fadeIn"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-md transition-all duration-500 hover:scale-110 hover:border-blue-300 hover:shadow-xl';
                  fallback.innerHTML = '<span class="text-white text-3xl">👨‍🏫</span>';
                  e.target.parentElement.insertBefore(fallback, e.target);
                }}
              />
              <div className="flex-1 animate-fadeIn animation-delay-100">
                <h3 className="font-semibold text-lg text-gray-900 transition-colors duration-300 hover:text-blue-600">Mr. Amir Nagy</h3>
                <p className="text-blue-600 font-medium mb-2 transition-all duration-300 hover:text-blue-700">SAT & English Specialist</p>
                <p className="text-sm text-gray-700 leading-relaxed">
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