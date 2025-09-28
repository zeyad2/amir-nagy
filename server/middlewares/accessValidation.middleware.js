/**
 * Access Validation Middleware
 * Validates student access to course sessions based on access windows
 */
import Prisma from "../prisma/prisma.js";
import { createErrorResponse } from "../utils/response.util.js";

/**
 * Check if a student has access to a specific session
 * Used for protecting individual session resources
 */
export const validateSessionAccess = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Admin users have access to everything
    if (userRole === 'admin') {
      return next();
    }

    // For students, check enrollment and access windows
    if (userRole === 'student') {
      // Get the session and its course
      const session = await Prisma.session.findUnique({
        where: { id: BigInt(sessionId) },
        include: { course: true }
      });

      if (!session) {
        return createErrorResponse(res, 404, 'Session not found');
      }

      // Get student record
      const student = await Prisma.student.findUnique({
        where: { uuid: BigInt(userId) }
      });

      if (!student) {
        return createErrorResponse(res, 404, 'Student not found');
      }

      // Check if student is enrolled in the course
      const enrollment = await Prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.uuid,
            courseId: session.courseId
          },
          deletedAt: null
        },
        include: {
          accessWindows: {
            include: {
              startSession: true,
              endSession: true
            }
          }
        }
      });

      if (!enrollment || enrollment.status !== 'active') {
        return createErrorResponse(res, 403, 'You are not enrolled in this course or your enrollment is inactive');
      }

      // Check access windows
      const hasAccess = await checkSessionAccess(session, enrollment);
      if (!hasAccess) {
        return createErrorResponse(res, 403, 'You do not have access to this session');
      }

      return next();
    }

    return createErrorResponse(res, 403, 'Access denied');
  } catch (error) {
    console.error('Error validating session access:', error);
    return createErrorResponse(res, 500, 'Failed to validate session access');
  }
};

/**
 * Check if a student has access to a course and return accessible sessions
 * Used for course content endpoints
 */
export const validateCourseAccess = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Admin users have access to everything
    if (userRole === 'admin') {
      return next();
    }

    // For students, check enrollment and build accessible sessions list
    if (userRole === 'student') {
      // Get the course
      const course = await Prisma.course.findUnique({
        where: {
          id: BigInt(courseId),
          deletedAt: null
        }
      });

      if (!course) {
        return createErrorResponse(res, 404, 'Course not found');
      }

      // Get student record
      const student = await Prisma.student.findUnique({
        where: { uuid: BigInt(userId) }
      });

      if (!student) {
        return createErrorResponse(res, 404, 'Student not found');
      }

      // Check if student is enrolled in the course
      const enrollment = await Prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.uuid,
            courseId: BigInt(courseId)
          },
          deletedAt: null
        },
        include: {
          accessWindows: {
            include: {
              startSession: true,
              endSession: true
            }
          }
        }
      });

      if (!enrollment || enrollment.status !== 'active') {
        return createErrorResponse(res, 403, 'You are not enrolled in this course or your enrollment is inactive');
      }

      // Get all sessions for the course
      const allSessions = await Prisma.session.findMany({
        where: { courseId: BigInt(courseId) },
        orderBy: { date: 'asc' }
      });

      // Determine accessible sessions
      const accessibleSessions = [];
      for (const session of allSessions) {
        const hasAccess = await checkSessionAccess(session, enrollment);
        if (hasAccess) {
          accessibleSessions.push(session.id.toString());
        }
      }

      // Add accessible sessions to request for use by the controller
      req.accessibleSessions = accessibleSessions;
      req.enrollment = enrollment;

      return next();
    }

    return createErrorResponse(res, 403, 'Access denied');
  } catch (error) {
    console.error('Error validating course access:', error);
    return createErrorResponse(res, 500, 'Failed to validate course access');
  }
};

/**
 * Helper function to check if a session is accessible based on access windows
 * @param {Object} session - The session to check
 * @param {Object} enrollment - The enrollment with access windows
 * @returns {boolean} - Whether the session is accessible
 */
async function checkSessionAccess(session, enrollment) {
  // If no access windows, student has full access (for finished courses or full access live courses)
  if (!enrollment.accessWindows || enrollment.accessWindows.length === 0) {
    return true;
  }

  // Check if session falls within any access window based on session IDs
  for (const accessWindow of enrollment.accessWindows) {
    const sessionId = session.id;
    const startSessionId = accessWindow.startSession.id;
    const endSessionId = accessWindow.endSession.id;

    // Check if session ID falls within the range of accessible sessions
    // Convert BigInt to Number for comparison
    const sessionIdNum = Number(sessionId);
    const startSessionIdNum = Number(startSessionId);
    const endSessionIdNum = Number(endSessionId);

    if (sessionIdNum >= startSessionIdNum && sessionIdNum <= endSessionIdNum) {
      return true;
    }
  }

  return false;
}

/**
 * Get accessible sessions for a student in a course
 * Utility function for controllers
 */
export const getAccessibleSessions = async (studentId, courseId) => {
  try {
    // Get enrollment with access windows
    const enrollment = await Prisma.enrollment.findFirst({
      where: {
        studentId: BigInt(studentId),
        courseId: BigInt(courseId),
        deletedAt: null
      },
      include: {
        accessWindows: {
          include: {
            startSession: true,
            endSession: true
          }
        }
      }
    });

    if (!enrollment || enrollment.status !== 'active') {
      return [];
    }

    // Get all sessions for the course
    const allSessions = await Prisma.session.findMany({
      where: { courseId: BigInt(courseId) },
      orderBy: { date: 'asc' }
    });

    // If no access windows, return all sessions (full access)
    if (!enrollment.accessWindows || enrollment.accessWindows.length === 0) {
      return allSessions.map(session => session.id.toString());
    }

    // Filter sessions based on access windows
    const accessibleSessions = [];
    for (const session of allSessions) {
      const hasAccess = await checkSessionAccess(session, enrollment);
      if (hasAccess) {
        accessibleSessions.push(session.id.toString());
      }
    }

    return accessibleSessions;
  } catch (error) {
    console.error('Error getting accessible sessions:', error);
    return [];
  }
};