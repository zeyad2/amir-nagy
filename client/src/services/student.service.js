import api from './api.service.js'

export const studentService = {
  // Assessment methods
  getAssessmentData: async (assessmentId) => {
    const response = await api.get(`/student/assessments/${assessmentId}`)
    return response.data
  },

  startAssessment: async (assessmentId) => {
    const response = await api.post(`/student/assessments/${assessmentId}/attempt`)
    return response.data
  },

  getAssessmentAttemptStatus: async (assessmentId) => {
    const response = await api.get(`/student/assessments/${assessmentId}/attempt`)
    return response.data
  },

  submitAssessment: async (assessmentId, answers) => {
    const response = await api.post(`/student/assessments/${assessmentId}/submit`, { answers })
    return response.data
  },

  getAssessmentSubmission: async (assessmentId) => {
    const response = await api.get(`/student/assessments/${assessmentId}/submission`)
    return response.data
  },

  // Course methods
  getCourseDetails: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`)
    return response.data
  },

  // Enrollment methods
  requestEnrollment: async (courseId) => {
    const response = await api.post('/student/enrollment-requests', { courseId })
    return response.data
  }
}
