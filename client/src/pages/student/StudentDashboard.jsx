import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const StudentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/student/dashboard').then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const { student, stats, enrolledCourses, recentActivity } = data?.data || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {student?.firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your learning progress and upcoming activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Enrolled Courses</CardDescription>
            <CardTitle className="text-4xl">{stats?.enrolledCoursesCount || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-4xl">{stats?.averageScore || 0}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Across all assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-4xl">{stats?.totalSubmissions || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Tests & homework completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              {!enrolledCourses || enrolledCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Courses Yet</h3>
                  <p className="text-gray-500 mb-4">Start your learning by enrolling in a course</p>
                  <Link
                    to="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      {/* Course Thumbnail */}
                      <div className="flex-shrink-0">
                        {enrollment.course.thumbnail ? (
                          <img
                            src={`http://localhost:5000${enrollment.course.thumbnail}`}
                            alt={enrollment.course.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-3xl">📚</span>
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                              {enrollment.course.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {enrollment.course.description}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            enrollment.course.type === 'live'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {enrollment.course.type === 'live' ? 'Live' : 'Self-Paced'}
                          </span>
                        </div>

                        {/* Course Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span>📖 {enrollment.course._count.courseLessons} lessons</span>
                          <span>📝 {enrollment.course._count.courseHomeworks} homework</span>
                          <span>📊 {enrollment.course._count.courseTests} tests</span>
                        </div>

                        {/* Access Type */}
                        {enrollment.accessType === 'partial' && enrollment.accessWindows.length > 0 && (
                          <div className="mb-3">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              📅 Partial Access: Session {enrollment.accessWindows[0].startSession.title} - {enrollment.accessWindows[0].endSession.title}
                            </span>
                          </div>
                        )}

                        {/* CTA */}
                        <Link
                          to={`/courses/${enrollment.course.id}`}
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Continue Learning →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {!recentActivity || recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📋</div>
                  <p className="text-sm text-gray-500">No recent submissions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        {activity.test.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${
                          activity.percentage >= 80
                            ? 'text-green-600'
                            : activity.percentage >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {activity.percentage}%
                        </span>
                        <span className="text-gray-500">
                          {activity.score}/{activity.totalQuestions}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                to="/student/performance"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h4 className="font-semibold text-sm">Performance</h4>
                    <p className="text-xs text-gray-500">View your analytics</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h4 className="font-semibold text-sm">Browse Courses</h4>
                    <p className="text-xs text-gray-500">Explore more courses</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
