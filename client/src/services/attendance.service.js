/**
 * Attendance Service
 * Handles API calls for attendance management
 */
import api from './api.service';

export const attendanceService = {
  /**
   * Mark attendance for a session (bulk operation)
   * @param {string} sessionId - Session ID
   * @param {Array} records - Array of {studentId, status}
   * @returns {Promise<Object>} - Result
   */
  async markAttendance(sessionId, records) {
    const response = await api.post(
      `/admin/sessions/${sessionId}/attendance`,
      { records }
    );
    return response.data;
  },

  /**
   * Get attendance for a specific session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Session with attendance data
   */
  async getSessionAttendance(sessionId) {
    const response = await api.get(
      `/admin/sessions/${sessionId}/attendance`
    );
    return response.data;
  },

  /**
   * Get all attendance for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} - Course attendance summary
   */
  async getCourseAttendance(courseId) {
    const response = await api.get(
      `/admin/courses/${courseId}/attendance`
    );
    return response.data;
  }
};
