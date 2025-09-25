/**
 * Admin Access Windows Controller
 * Handles CRUD operations for access window management
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Get all access windows for a specific enrollment
 * GET /api/admin/enrollments/:enrollmentId/access-windows
 */
export const getAccessWindows = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    // Check if enrollment exists
    const enrollment = await Prisma.enrollment.findUnique({
      where: {
        id: BigInt(enrollmentId),
        deletedAt: null
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        student: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return createErrorResponse(res, 404, 'Enrollment not found');
    }

    // Get access windows for this enrollment
    const accessWindows = await Prisma.accessWindow.findMany({
      where: {
        enrollmentId: BigInt(enrollmentId)
      },
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
    });

    // Convert BigInt to string for JSON serialization
    const accessWindowsResponse = accessWindows.map(window => ({
      id: window.id.toString(),
      enrollmentId: window.enrollmentId.toString(),
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
    }));

    return createResponse(res, 200, 'Access windows fetched successfully', {
      accessWindows: accessWindowsResponse,
      enrollment: {
        id: enrollment.id.toString(),
        course: {
          id: enrollment.course.id.toString(),
          title: enrollment.course.title,
          type: enrollment.course.type
        },
        student: {
          firstName: enrollment.student.firstName,
          lastName: enrollment.student.lastName,
          email: enrollment.student.user.email
        }
      }
    });
  } catch (error) {
    console.error('Error fetching access windows:', error);
    return createErrorResponse(res, 500, 'Failed to fetch access windows');
  }
};

/**
 * Get a specific access window with details
 * GET /api/admin/access-windows/:id
 */
export const getAccessWindow = async (req, res) => {
  try {
    const { id } = req.params;

    const accessWindow = await Prisma.accessWindow.findUnique({
      where: {
        id: BigInt(id)
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                type: true,
                price: true
              }
            },
            student: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        startSession: true,
        endSession: true
      }
    });

    if (!accessWindow) {
      return createErrorResponse(res, 404, 'Access window not found');
    }

    // Calculate session count and pricing
    const allSessions = await Prisma.session.findMany({
      where: {
        courseId: accessWindow.enrollment.course.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    const startIndex = allSessions.findIndex(s => s.id === accessWindow.startSessionId);
    const endIndex = allSessions.findIndex(s => s.id === accessWindow.endSessionId);
    const sessionCount = endIndex - startIndex + 1;
    const totalSessions = allSessions.length;

    // Calculate proportional price (if course has a price)
    let calculatedPrice = null;
    if (accessWindow.enrollment.course.price && totalSessions > 0) {
      calculatedPrice = Math.round((accessWindow.enrollment.course.price * sessionCount) / totalSessions);
    }

    // Convert BigInt to string for JSON serialization
    const accessWindowResponse = {
      id: accessWindow.id.toString(),
      enrollmentId: accessWindow.enrollmentId.toString(),
      startSession: {
        id: accessWindow.startSession.id.toString(),
        title: accessWindow.startSession.title,
        date: accessWindow.startSession.date
      },
      endSession: {
        id: accessWindow.endSession.id.toString(),
        title: accessWindow.endSession.title,
        date: accessWindow.endSession.date
      },
      createdAt: accessWindow.createdAt,
      sessionCount,
      totalSessions,
      calculatedPrice,
      enrollment: {
        id: accessWindow.enrollment.id.toString(),
        course: {
          id: accessWindow.enrollment.course.id.toString(),
          title: accessWindow.enrollment.course.title,
          type: accessWindow.enrollment.course.type,
          price: accessWindow.enrollment.course.price
        },
        student: {
          firstName: accessWindow.enrollment.student.firstName,
          lastName: accessWindow.enrollment.student.lastName,
          email: accessWindow.enrollment.student.user.email
        }
      }
    };

    return createResponse(res, 200, 'Access window fetched successfully', { accessWindow: accessWindowResponse });
  } catch (error) {
    console.error('Error fetching access window:', error);
    return createErrorResponse(res, 500, 'Failed to fetch access window');
  }
};

/**
 * Create a new access window for an enrollment
 * POST /api/admin/enrollments/:enrollmentId/access-windows
 */
export const createAccessWindow = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { startSessionId, endSessionId } = req.body;

    // Check if enrollment exists and get course info
    const enrollment = await Prisma.enrollment.findUnique({
      where: {
        id: BigInt(enrollmentId),
        deletedAt: null
      },
      include: {
        course: true
      }
    });

    if (!enrollment) {
      return createErrorResponse(res, 404, 'Enrollment not found');
    }

    // Validate sessions belong to the same course
    const [startSession, endSession] = await Promise.all([
      Prisma.session.findUnique({
        where: { id: BigInt(startSessionId) }
      }),
      Prisma.session.findUnique({
        where: { id: BigInt(endSessionId) }
      })
    ]);

    if (!startSession || !endSession) {
      return createErrorResponse(res, 404, 'One or both sessions not found');
    }

    if (startSession.courseId !== enrollment.courseId || endSession.courseId !== enrollment.courseId) {
      return createErrorResponse(res, 400, 'Sessions must belong to the enrolled course');
    }

    // Validate session order (start session should be <= end session by date)
    if (startSession.date > endSession.date) {
      return createErrorResponse(res, 400, 'Start session cannot be after end session');
    }

    // Check for overlapping access windows for this enrollment
    const existingWindows = await Prisma.accessWindow.findMany({
      where: {
        enrollmentId: BigInt(enrollmentId)
      },
      include: {
        startSession: true,
        endSession: true
      }
    });

    for (const window of existingWindows) {
      // Check if new window overlaps with existing ones
      if (
        (startSession.date <= window.endSession.date && endSession.date >= window.startSession.date)
      ) {
        return createErrorResponse(res, 400, 'Access window overlaps with existing window');
      }
    }

    // Create the access window
    const accessWindow = await Prisma.accessWindow.create({
      data: {
        enrollmentId: BigInt(enrollmentId),
        startSessionId: BigInt(startSessionId),
        endSessionId: BigInt(endSessionId)
      },
      include: {
        startSession: true,
        endSession: true
      }
    });

    // Convert BigInt to string for JSON serialization
    const accessWindowResponse = {
      id: accessWindow.id.toString(),
      enrollmentId: accessWindow.enrollmentId.toString(),
      startSession: {
        id: accessWindow.startSession.id.toString(),
        title: accessWindow.startSession.title,
        date: accessWindow.startSession.date
      },
      endSession: {
        id: accessWindow.endSession.id.toString(),
        title: accessWindow.endSession.title,
        date: accessWindow.endSession.date
      },
      createdAt: accessWindow.createdAt
    };

    return createResponse(res, 201, 'Access window created successfully', { accessWindow: accessWindowResponse });
  } catch (error) {
    console.error('Error creating access window:', error);
    return createErrorResponse(res, 500, 'Failed to create access window');
  }
};

/**
 * Update an access window
 * PUT /api/admin/access-windows/:id
 */
export const updateAccessWindow = async (req, res) => {
  try {
    const { id } = req.params;
    const { startSessionId, endSessionId } = req.body;

    // Check if access window exists
    const existingWindow = await Prisma.accessWindow.findUnique({
      where: { id: BigInt(id) },
      include: {
        enrollment: {
          include: {
            course: true
          }
        }
      }
    });

    if (!existingWindow) {
      return createErrorResponse(res, 404, 'Access window not found');
    }

    const updateData = {};

    // Validate new sessions if provided
    if (startSessionId || endSessionId) {
      const newStartId = startSessionId ? BigInt(startSessionId) : existingWindow.startSessionId;
      const newEndId = endSessionId ? BigInt(endSessionId) : existingWindow.endSessionId;

      const [startSession, endSession] = await Promise.all([
        Prisma.session.findUnique({ where: { id: newStartId } }),
        Prisma.session.findUnique({ where: { id: newEndId } })
      ]);

      if (!startSession || !endSession) {
        return createErrorResponse(res, 404, 'One or both sessions not found');
      }

      if (startSession.courseId !== existingWindow.enrollment.courseId ||
          endSession.courseId !== existingWindow.enrollment.courseId) {
        return createErrorResponse(res, 400, 'Sessions must belong to the enrolled course');
      }

      if (startSession.date > endSession.date) {
        return createErrorResponse(res, 400, 'Start session cannot be after end session');
      }

      // Check for overlapping access windows (excluding current window)
      const otherWindows = await Prisma.accessWindow.findMany({
        where: {
          enrollmentId: existingWindow.enrollmentId,
          id: { not: BigInt(id) }
        },
        include: {
          startSession: true,
          endSession: true
        }
      });

      for (const window of otherWindows) {
        if (startSession.date <= window.endSession.date && endSession.date >= window.startSession.date) {
          return createErrorResponse(res, 400, 'Access window overlaps with existing window');
        }
      }

      if (startSessionId) updateData.startSessionId = newStartId;
      if (endSessionId) updateData.endSessionId = newEndId;
    }

    // Update the access window
    const updatedWindow = await Prisma.accessWindow.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        startSession: true,
        endSession: true
      }
    });

    // Convert BigInt to string for JSON serialization
    const accessWindowResponse = {
      id: updatedWindow.id.toString(),
      enrollmentId: updatedWindow.enrollmentId.toString(),
      startSession: {
        id: updatedWindow.startSession.id.toString(),
        title: updatedWindow.startSession.title,
        date: updatedWindow.startSession.date
      },
      endSession: {
        id: updatedWindow.endSession.id.toString(),
        title: updatedWindow.endSession.title,
        date: updatedWindow.endSession.date
      },
      createdAt: updatedWindow.createdAt
    };

    return createResponse(res, 200, 'Access window updated successfully', { accessWindow: accessWindowResponse });
  } catch (error) {
    console.error('Error updating access window:', error);
    return createErrorResponse(res, 500, 'Failed to update access window');
  }
};

/**
 * Delete an access window
 * DELETE /api/admin/access-windows/:id
 */
export const deleteAccessWindow = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if access window exists
    const existingWindow = await Prisma.accessWindow.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingWindow) {
      return createErrorResponse(res, 404, 'Access window not found');
    }

    // Delete the access window
    await Prisma.accessWindow.delete({
      where: { id: BigInt(id) }
    });

    return createResponse(res, 200, 'Access window deleted successfully');
  } catch (error) {
    console.error('Error deleting access window:', error);
    return createErrorResponse(res, 500, 'Failed to delete access window');
  }
};

/**
 * Get all sessions for a course (for UI dropdowns)
 * GET /api/admin/courses/:courseId/sessions
 */
export const getCourseSessions = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Prisma.course.findUnique({
      where: {
        id: BigInt(courseId),
        deletedAt: null
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Get all sessions for the course
    const sessions = await Prisma.session.findMany({
      where: {
        courseId: BigInt(courseId)
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Convert BigInt to string for JSON serialization
    const sessionsResponse = sessions.map(session => ({
      id: session.id.toString(),
      title: session.title,
      date: session.date,
      courseId: session.courseId.toString()
    }));

    return createResponse(res, 200, 'Course sessions fetched successfully', {
      sessions: sessionsResponse,
      course: {
        id: course.id.toString(),
        title: course.title,
        type: course.type
      }
    });
  } catch (error) {
    console.error('Error fetching course sessions:', error);
    return createErrorResponse(res, 500, 'Failed to fetch course sessions');
  }
};