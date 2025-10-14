/**
 * Session Service
 * Handles API calls for session management
 */
import api from './api.service';

export const sessionService = {
  /**
   * Create a new session for a course
   * @param {string} courseId - Course ID
   * @param {Object} data - Session data (title, date)
   * @returns {Promise<Object>} - Created session
   */
  async createSession(courseId, data) {
    const response = await api.post(
      `/admin/courses/${courseId}/sessions`,
      data
    );
    return response.data;
  },

  /**
   * Get all sessions for a course
   * @param {string} courseId - Course ID
   * @param {Object} params - Query parameters (sortBy, sortOrder)
   * @returns {Promise<Object>} - Sessions list with course info
   */
  async getCourseSessions(courseId, params = {}) {
    const response = await api.get(
      `/admin/courses/${courseId}/sessions`,
      { params }
    );
    return response.data;
  },

  /**
   * Get a single session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Session details
   */
  async getSessionById(sessionId) {
    const response = await api.get(
      `/admin/sessions/${sessionId}`
    );
    return response.data;
  },

  /**
   * Update a session
   * @param {string} sessionId - Session ID
   * @param {Object} data - Updated session data (title, date)
   * @returns {Promise<Object>} - Updated session
   */
  async updateSession(sessionId, data) {
    const response = await api.put(
      `/admin/sessions/${sessionId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteSession(sessionId) {
    const response = await api.delete(
      `/admin/sessions/${sessionId}`
    );
    return response.data;
  }
};
