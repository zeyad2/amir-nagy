import api from './api.service'

export const adminService = {
  // Dashboard statistics
  getDashboardStats: () => {
    return api.get('/admin/dashboard/stats')
  },

  // Students management
  getAllStudents: () => {
    return api.get('/admin/students')
  },

  getStudentById: (id) => {
    return api.get(`/admin/students/${id}`)
  },

  // Enrollment requests
  getEnrollmentRequests: () => {
    return api.get('/admin/enrollment-requests')
  },

  approveEnrollmentRequest: (id, accessWindow = null) => {
    return api.put(`/admin/enrollment-requests/${id}/approve`, { accessWindow })
  },

  rejectEnrollmentRequest: (id) => {
    return api.put(`/admin/enrollment-requests/${id}/reject`)
  },

  // Bulk operations for enrollment requests
  bulkApproveEnrollmentRequests: (requestIds, accessWindows = {}) => {
    return api.post('/admin/enrollment-requests/bulk-approve', {
      requestIds,
      accessWindows
    })
  },

  bulkRejectEnrollmentRequests: (requestIds) => {
    return api.post('/admin/enrollment-requests/bulk-reject', { requestIds })
  },

  // Courses management
  getAllCourses: () => {
    return api.get('/admin/courses')
  },

  createCourse: (courseData) => {
    return api.post('/admin/courses', courseData)
  },

  updateCourse: (id, courseData) => {
    return api.put(`/admin/courses/${id}`, courseData)
  },

  deleteCourse: (id) => {
    return api.delete(`/admin/courses/${id}`)
  },

  // Lessons management
  getAllLessons: (filters = {}) => {
    return api.get('/admin/lessons', { params: filters })
  },

  createLesson: (lessonData) => {
    return api.post('/admin/lessons', lessonData)
  },

  updateLesson: (id, lessonData) => {
    return api.put(`/admin/lessons/${id}`, lessonData)
  },

  deleteLesson: (id) => {
    return api.delete(`/admin/lessons/${id}`)
  },

  getLessonCourses: (id) => {
    return api.get(`/admin/lessons/${id}/courses`)
  },

  // Analytics and reports
  getPerformanceAnalytics: (filters = {}) => {
    return api.get('/admin/analytics', { params: filters })
  },

  sendWhatsAppReports: (courseId) => {
    return api.post('/admin/reports/whatsapp/send', { courseId })
  }
}