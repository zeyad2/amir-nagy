/**
 * Admin Sessions Controller
 * Handles session management for live courses
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Create a new session for a course
 * POST /api/admin/courses/:courseId/sessions
 */
export const createSession = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, date } = req.body;

    // Validate courseId
    const courseIdBigInt = BigInt(courseId);

    // Check if course exists and is a live course
    const course = await Prisma.course.findFirst({
      where: {
        id: courseIdBigInt,
        deletedAt: null
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Validate that the course is a live course
    if (course.type !== 'live') {
      return createErrorResponse(res, 400, 'Sessions can only be created for live courses');
    }

    // Validate date
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return createErrorResponse(res, 400, 'Invalid date format');
    }

    // Create session
    const session = await Prisma.session.create({
      data: {
        courseId: courseIdBigInt,
        title: title || null,
        date: sessionDate
      }
    });

    // Convert BigInt to string for JSON serialization
    const sessionResponse = {
      id: session.id.toString(),
      courseId: session.courseId.toString(),
      title: session.title,
      date: session.date,
      formattedDate: session.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    return createResponse(res, 201, 'Session created successfully', { session: sessionResponse });
  } catch (error) {
    console.error('Error creating session:', error);
    return createErrorResponse(res, 500, 'Failed to create session');
  }
};

/**
 * Get all sessions for a course with attendance counts
 * GET /api/admin/courses/:courseId/sessions
 */
export const getCourseSessions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sortBy = 'date', sortOrder = 'asc' } = req.query;

    const courseIdBigInt = BigInt(courseId);

    // Verify course exists
    const course = await Prisma.course.findFirst({
      where: {
        id: courseIdBigInt,
        deletedAt: null
      },
      select: {
        id: true,
        title: true,
        type: true
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Build order clause
    const orderBy = {};
    if (sortBy === 'date') {
      orderBy.date = sortOrder;
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else {
      orderBy.id = sortOrder;
    }

    // Get sessions with attendance count
    const sessions = await Prisma.session.findMany({
      where: {
        courseId: courseIdBigInt
      },
      include: {
        _count: {
          select: {
            attendances: true
          }
        }
      },
      orderBy
    });

    // Get total enrolled students count
    const enrolledCount = await Prisma.enrollment.count({
      where: {
        courseId: courseIdBigInt,
        status: 'active'
      }
    });

    // Transform sessions with proper serialization
    const sessionsResponse = sessions.map(session => ({
      id: session.id.toString(),
      title: session.title || `Session ${session.id}`,
      date: session.date,
      formattedDate: session.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      }),
      formattedTime: session.date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      attendanceCount: session._count.attendances,
      enrolledCount: enrolledCount,
      attendanceRate: enrolledCount > 0
        ? Math.round((session._count.attendances / enrolledCount) * 100)
        : 0
    }));

    return createResponse(res, 200, 'Sessions fetched successfully', {
      course: {
        id: course.id.toString(),
        title: course.title,
        type: course.type
      },
      sessions: sessionsResponse,
      totalSessions: sessionsResponse.length,
      enrolledStudents: enrolledCount
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return createErrorResponse(res, 500, 'Failed to fetch sessions');
  }
};

/**
 * Get a single session by ID
 * GET /api/admin/sessions/:id
 */
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionIdBigInt = BigInt(id);

    const session = await Prisma.session.findUnique({
      where: { id: sessionIdBigInt },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    if (!session) {
      return createErrorResponse(res, 404, 'Session not found');
    }

    // Transform response
    const sessionResponse = {
      id: session.id.toString(),
      courseId: session.courseId.toString(),
      title: session.title,
      date: session.date,
      formattedDate: session.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      course: {
        id: session.course.id.toString(),
        title: session.course.title,
        type: session.course.type
      },
      attendanceCount: session._count.attendances
    };

    return createResponse(res, 200, 'Session fetched successfully', { session: sessionResponse });
  } catch (error) {
    console.error('Error fetching session:', error);
    return createErrorResponse(res, 500, 'Failed to fetch session');
  }
};

/**
 * Update a session
 * PUT /api/admin/sessions/:id
 */
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date } = req.body;
    const sessionIdBigInt = BigInt(id);

    // Check if session exists
    const existingSession = await Prisma.session.findUnique({
      where: { id: sessionIdBigInt }
    });

    if (!existingSession) {
      return createErrorResponse(res, 404, 'Session not found');
    }

    // Validate date if provided
    let sessionDate;
    if (date) {
      sessionDate = new Date(date);
      if (isNaN(sessionDate.getTime())) {
        return createErrorResponse(res, 400, 'Invalid date format');
      }
    }

    // Update session
    const updateData = {};
    if (title !== undefined) updateData.title = title || null;
    if (date) updateData.date = sessionDate;

    const updatedSession = await Prisma.session.update({
      where: { id: sessionIdBigInt },
      data: updateData
    });

    // Transform response
    const sessionResponse = {
      id: updatedSession.id.toString(),
      courseId: updatedSession.courseId.toString(),
      title: updatedSession.title,
      date: updatedSession.date,
      formattedDate: updatedSession.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    return createResponse(res, 200, 'Session updated successfully', { session: sessionResponse });
  } catch (error) {
    console.error('Error updating session:', error);
    return createErrorResponse(res, 500, 'Failed to update session');
  }
};

/**
 * Delete a session
 * DELETE /api/admin/sessions/:id
 * Note: Will cascade delete all attendance records
 */
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionIdBigInt = BigInt(id);

    // Check if session exists
    const existingSession = await Prisma.session.findUnique({
      where: { id: sessionIdBigInt },
      include: {
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    if (!existingSession) {
      return createErrorResponse(res, 404, 'Session not found');
    }

    // Delete session (cascade will delete attendance records)
    await Prisma.session.delete({
      where: { id: sessionIdBigInt }
    });

    return createResponse(res, 200, 'Session deleted successfully', {
      deletedSessionId: id,
      deletedAttendanceRecords: existingSession._count.attendances
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return createErrorResponse(res, 500, 'Failed to delete session');
  }
};
