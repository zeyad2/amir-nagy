/**
 * Public/Student Courses Controller
 * Handles course access and student-facing course operations
 */
import Prisma from "../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../utils/response.util.js";
import { getAccessibleSessions } from "../middlewares/accessValidation.middleware.js";

/**
 * Get access status for a course (for students)
 * GET /api/courses/:id/access-status
 */
export const getCourseAccessStatus = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Admin users have full access to everything
    if (userRole === 'admin') {
      const course = await Prisma.course.findFirst({
        where: {
          id: BigInt(courseId),
          deletedAt: null
        },
        include: {
          sessions: {
            orderBy: { date: 'asc' }
          }
        }
      });

      if (!course) {
        return createErrorResponse(res, 404, 'Course not found');
      }

      const allSessionIds = course.sessions.map(s => s.id.toString());

      return createResponse(res, 200, 'Course access status fetched successfully', {
        courseId: course.id.toString(),
        courseTitle: course.title,
        courseType: course.type,
        accessType: 'admin_full_access',
        hasAccess: true,
        accessibleSessions: allSessionIds,
        totalSessions: allSessionIds.length,
        accessDetails: {
          isAdmin: true,
          fullAccess: true
        }
      });
    }

    // For students, check enrollment and access windows
    if (userRole === 'student') {
      // Get the course
      const course = await Prisma.course.findFirst({
        where: {
          id: BigInt(courseId),
          deletedAt: null
        },
        include: {
          sessions: {
            orderBy: { date: 'asc' }
          }
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

      // Check enrollment
      const enrollment = await Prisma.enrollment.findFirst({
        where: {
          studentId: student.uuid,
          courseId: BigInt(courseId),
          deletedAt: null
        },
        include: {
          accessWindows: {
            include: {
              startSession: {
                select: {
                  id: true,
                  title: true,
                  date: true
                }
              },
              endSession: {
                select: {
                  id: true,
                  title: true,
                  date: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      // Not enrolled case
      if (!enrollment) {
        return createResponse(res, 200, 'Course access status fetched successfully', {
          courseId: course.id.toString(),
          courseTitle: course.title,
          courseType: course.type,
          accessType: 'not_enrolled',
          hasAccess: false,
          accessibleSessions: [],
          totalSessions: course.sessions.length,
          accessDetails: {
            isEnrolled: false,
            message: 'You are not enrolled in this course'
          }
        });
      }

      // Inactive enrollment case
      if (enrollment.status !== 'active') {
        return createResponse(res, 200, 'Course access status fetched successfully', {
          courseId: course.id.toString(),
          courseTitle: course.title,
          courseType: course.type,
          accessType: 'enrollment_inactive',
          hasAccess: false,
          accessibleSessions: [],
          totalSessions: course.sessions.length,
          accessDetails: {
            isEnrolled: true,
            enrollmentStatus: enrollment.status,
            message: `Your enrollment is ${enrollment.status}`
          }
        });
      }

      // Get accessible sessions
      const accessibleSessions = await getAccessibleSessions(userId, courseId);

      // Determine access type
      let accessType = 'full_access';
      let accessDetails = {
        isEnrolled: true,
        enrollmentStatus: enrollment.status,
        fullAccess: true
      };

      if (enrollment.accessWindows && enrollment.accessWindows.length > 0) {
        accessType = 'partial_access';
        accessDetails = {
          isEnrolled: true,
          enrollmentStatus: enrollment.status,
          fullAccess: false,
          accessWindows: enrollment.accessWindows.map(window => ({
            id: window.id.toString(),
            startSession: {
              id: window.startSession.id.toString(),
              title: window.startSession.title,
              date: window.startSession.date
            },
            endSession: {
              id: window.endSession.id.toString(),
              title: window.endSession.title,
              date: window.endSession.date
            },
            createdAt: window.createdAt
          }))
        };
      }

      return createResponse(res, 200, 'Course access status fetched successfully', {
        courseId: course.id.toString(),
        courseTitle: course.title,
        courseType: course.type,
        accessType,
        hasAccess: true,
        accessibleSessions,
        totalSessions: course.sessions.length,
        accessDetails
      });
    }

    return createErrorResponse(res, 403, 'Access denied');
  } catch (error) {
    console.error('Error getting course access status:', error);
    return createErrorResponse(res, 500, 'Failed to get course access status');
  }
};

/**
 * Get accessible sessions for a course (for students)
 * GET /api/courses/:id/accessible-sessions
 */
export const getAccessibleCourseSessions = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Admin users see all sessions
    if (userRole === 'admin') {
      const sessions = await Prisma.session.findMany({
        where: { courseId: BigInt(courseId) },
        orderBy: { date: 'asc' }
      });

      const sessionsResponse = sessions.map(session => ({
        id: session.id.toString(),
        title: session.title,
        date: session.date,
        courseId: session.courseId.toString(),
        accessible: true,
        reason: 'admin_access'
      }));

      return createResponse(res, 200, 'Accessible sessions fetched successfully', {
        sessions: sessionsResponse,
        totalSessions: sessionsResponse.length,
        accessibleSessions: sessionsResponse.length
      });
    }

    // For students, filter by accessible sessions
    if (userRole === 'student') {
      // Get all sessions for the course
      const sessions = await Prisma.session.findMany({
        where: { courseId: BigInt(courseId) },
        orderBy: { date: 'asc' }
      });

      // Get accessible session IDs
      const accessibleSessionIds = await getAccessibleSessions(userId, courseId);
      const accessibleSet = new Set(accessibleSessionIds);

      const sessionsResponse = sessions.map(session => ({
        id: session.id.toString(),
        title: session.title,
        date: session.date,
        courseId: session.courseId.toString(),
        accessible: accessibleSet.has(session.id.toString()),
        reason: accessibleSet.has(session.id.toString()) ? 'within_access_window' : 'outside_access_window'
      }));

      return createResponse(res, 200, 'Accessible sessions fetched successfully', {
        sessions: sessionsResponse,
        totalSessions: sessionsResponse.length,
        accessibleSessions: accessibleSessionIds.length
      });
    }

    return createErrorResponse(res, 403, 'Access denied');
  } catch (error) {
    console.error('Error getting accessible sessions:', error);
    return createErrorResponse(res, 500, 'Failed to get accessible sessions');
  }
};

/**
 * Validate access to specific session content
 * GET /api/courses/:courseId/sessions/:sessionId/access
 */
export const validateSessionContentAccess = async (req, res) => {
  try {
    const { courseId, sessionId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Admin users have access to everything
    if (userRole === 'admin') {
      return createResponse(res, 200, 'Session access validated successfully', {
        hasAccess: true,
        accessType: 'admin_full_access',
        sessionId: sessionId,
        courseId: courseId,
        reason: 'Administrative access'
      });
    }

    // For students, validate session access
    if (userRole === 'student') {
      // Get the session and verify it belongs to the course
      const session = await Prisma.session.findFirst({
        where: {
          id: BigInt(sessionId),
          courseId: BigInt(courseId)
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true
            }
          }
        }
      });

      if (!session) {
        return createErrorResponse(res, 404, 'Session not found in this course');
      }

      // Check if course is published
      if (session.course.status !== 'published') {
        return createResponse(res, 200, 'Session access validated successfully', {
          hasAccess: false,
          accessType: 'course_unpublished',
          sessionId: sessionId,
          courseId: courseId,
          reason: 'Course is not published'
        });
      }

      // Get student record
      const student = await Prisma.student.findUnique({
        where: { uuid: BigInt(userId) }
      });

      if (!student) {
        return createErrorResponse(res, 404, 'Student record not found');
      }

      // Check enrollment and access windows
      const enrollment = await Prisma.enrollment.findFirst({
        where: {
          studentId: student.uuid,
          courseId: BigInt(courseId),
          deletedAt: null
        },
        include: {
          accessWindows: {
            include: {
              startSession: {
                select: {
                  id: true,
                  title: true,
                  date: true
                }
              },
              endSession: {
                select: {
                  id: true,
                  title: true,
                  date: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      // Not enrolled
      if (!enrollment) {
        return createResponse(res, 200, 'Session access validated successfully', {
          hasAccess: false,
          accessType: 'not_enrolled',
          sessionId: sessionId,
          courseId: courseId,
          reason: 'Not enrolled in this course'
        });
      }

      // Inactive enrollment
      if (enrollment.status !== 'active') {
        return createResponse(res, 200, 'Session access validated successfully', {
          hasAccess: false,
          accessType: 'enrollment_inactive',
          sessionId: sessionId,
          courseId: courseId,
          reason: `Enrollment status is ${enrollment.status}`
        });
      }

      // Check if session is accessible based on access windows
      const accessibleSessions = await getAccessibleSessions(userId, courseId);
      const hasAccess = accessibleSessions.includes(sessionId);

      let accessType = 'full_access';
      let reason = 'Full course access';

      if (enrollment.accessWindows && enrollment.accessWindows.length > 0) {
        accessType = hasAccess ? 'partial_access_granted' : 'partial_access_denied';
        reason = hasAccess
          ? 'Session is within your access window'
          : 'Session is outside your access window';
      }

      return createResponse(res, 200, 'Session access validated successfully', {
        hasAccess,
        accessType,
        sessionId: sessionId,
        courseId: courseId,
        reason,
        sessionDetails: {
          title: session.title,
          date: session.date
        },
        courseDetails: {
          title: session.course.title,
          type: session.course.type
        },
        accessDetails: enrollment.accessWindows.length > 0 ? {
          accessWindows: enrollment.accessWindows.map(window => ({
            id: window.id.toString(),
            startSession: {
              id: window.startSession.id.toString(),
              title: window.startSession.title,
              date: window.startSession.date
            },
            endSession: {
              id: window.endSession.id.toString(),
              title: window.endSession.title,
              date: window.endSession.date
            }
          }))
        } : { fullAccess: true }
      });
    }

    return createErrorResponse(res, 403, 'Access denied');
  } catch (error) {
    console.error('Error validating session content access:', error);
    return createErrorResponse(res, 500, 'Failed to validate session content access');
  }
};