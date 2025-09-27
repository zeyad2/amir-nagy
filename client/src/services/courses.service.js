import api from './api.service.js'

export const coursesService = {
  // Get all courses with optional filtering and pagination
  getCourses: async (params = {}) => {
    const response = await api.get('/admin/courses', { params })
    return response.data.data // Extract data from API response wrapper
  },

  // Get a specific course by ID
  getCourse: async (courseId) => {
    const response = await api.get(`/admin/courses/${courseId}`)
    return response.data
  },

  // Create a new course
  createCourse: async (courseData) => {
    const response = await api.post('/admin/courses', courseData)
    return response.data
  },

  // Update an existing course
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/admin/courses/${courseId}`, courseData)
    return response.data
  },

  // Delete a course (soft delete)
  deleteCourse: async (courseId) => {
    const response = await api.delete(`/admin/courses/${courseId}`)
    return response.data
  },

  // Update course status (draft, published, archived)
  updateCourseStatus: async (courseId, status) => {
    const response = await api.patch(`/admin/courses/${courseId}/status`, { status })
    return response.data
  },

  // Get sessions for a course (for access window dropdowns)
  getCourseSessions: async (courseId) => {
    const response = await api.get(`/admin/courses/${courseId}/sessions`)
    return response.data
  }
}