import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import RootLayout from '@/components/layouts/RootLayout'

// Public Pages
import LandingPage from '@/pages/LandingPage'
import CoursesPage from '@/pages/CoursesPage'
import CourseDetailPage from '@/pages/CourseDetailPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Student Pages
import StudentDashboard from '@/pages/student/StudentDashboard'
import StudentCourses from '@/pages/student/StudentCourses'
import CourseLearnPage from '@/pages/student/CourseLearnPage'
import AssessmentPage from '@/pages/student/AssessmentPage'
import PerformancePage from '@/pages/student/PerformancePage'

// Admin Pages
import AdminLayout from '@/components/layouts/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminCourses from '@/pages/admin/AdminCourses'
import CourseDetailsPage from '@/pages/admin/CourseDetailsPage'
import CreateCourse from '@/pages/admin/CreateCourse'
import AdminStudents from '@/pages/admin/AdminStudents'
import AdminResources from '@/pages/admin/AdminResources'
import AdminReports from '@/pages/admin/AdminReports'

// Error Pages
import NotFoundPage from '@/pages/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />

        {/* Auth Routes - Only accessible when logged out */}
        <Route
          path="login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Student Protected Routes */}
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/courses"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/courses/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CourseLearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/assessment/:type/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/performance"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PerformancePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Protected Routes - Separate from RootLayout */}
      <Route
        path="admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:id" element={<CourseDetailsPage />} />
        <Route path="courses/:id/edit" element={<CourseDetailsPage />} />
        <Route path="courses/create" element={<CreateCourse />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="resources" element={<AdminResources />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
    </Routes>
  )
}