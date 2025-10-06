/**
 * Assessment Service
 * Handles API calls for homework and test attempts/submissions
 */
import api from './api.service';

const assessmentService = {
  /**
   * Start an assessment attempt (homework or test)
   * @param {string} assessmentId - The assessment ID
   * @param {string} type - 'homework' or 'test'
   * @returns {Promise} Assessment data
   */
  startAssessment: async (assessmentId, type) => {
    const response = await api.post(`/student/assessments/${assessmentId}/attempt`);
    return response.data;
  },

  /**
   * Get assessment attempt status
   * @param {string} assessmentId - The assessment ID
   * @param {string} type - 'homework' or 'test'
   * @returns {Promise} Status data
   */
  getAssessmentStatus: async (assessmentId, type) => {
    const response = await api.get(`/student/assessments/${assessmentId}/attempt`);
    return response.data;
  },

  /**
   * Submit assessment answers
   * @param {string} assessmentId - The assessment ID
   * @param {string} type - 'homework' or 'test'
   * @param {Array} answers - Array of {questionId, choiceId}
   * @returns {Promise} Submission result
   */
  submitAssessment: async (assessmentId, type, answers) => {
    const response = await api.post(`/student/assessments/${assessmentId}/submit`, {
      answers
    });
    return response.data;
  },

  /**
   * Get submission details with answers and explanations
   * @param {string} assessmentId - The assessment ID
   * @param {string} type - 'homework' or 'test'
   * @returns {Promise} Submission details
   */
  getSubmissionDetails: async (assessmentId, type) => {
    const response = await api.get(`/student/assessments/${assessmentId}/submission`);
    return response.data;
  }
};

export default assessmentService;
