/**
 * Admin Attendance Controller
 * Handles bulk attendance marking and retrieval for sessions
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Mark attendance for a session (bulk operation)
 * POST /api/admin/sessions/:sessionId/attendance
 */
export const markAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { records } = req.body; // Array of { studentId, status }

    const sessionIdBigInt = BigInt(sessionId);

    // Verify session exists
    const session = await Prisma.session.findUnique({
      where: { id: sessionIdBigInt },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!session) {
      return createErrorResponse(res, 404, 'Session not found');
    }

    // Use transaction for bulk upsert
    const attendanceRecords = await Prisma.$transaction(
      records.map(record =>
        Prisma.attendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId: sessionIdBigInt,
              studentId: BigInt(record.studentId)
            }
          },
          update: {
            status: record.status
          },
          create: {
            sessionId: sessionIdBigInt,
            studentId: BigInt(record.studentId),
            status: record.status
          }
        })
      )
    );

    return createResponse(res, 200, 'Attendance marked successfully', {
      sessionId: sessionId,
      recordsUpdated: attendanceRecords.length
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return createErrorResponse(res, 500, 'Failed to mark attendance');
  }
};

/**
 * Get attendance for a specific session with student details
 * GET /api/admin/sessions/:sessionId/attendance
 */
export const getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionIdBigInt = BigInt(sessionId);

    // Get session details
    const session = await Prisma.session.findUnique({
      where: { id: sessionIdBigInt },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!session) {
      return createErrorResponse(res, 404, 'Session not found');
    }

    // Get all enrolled students for this course
    const enrollments = await Prisma.enrollment.findMany({
      where: {
        courseId: session.courseId,
        status: 'active'
      },
      include: {
        student: {
          select: {
            uuid: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: {
        student: {
          firstName: 'asc'
        }
      }
    });

    // Get existing attendance records for this session
    const attendanceRecords = await Prisma.attendance.findMany({
      where: { sessionId: sessionIdBigInt }
    });

    // Create a map of studentId to attendance status
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    // Build response with all students and their attendance status
    const studentsWithAttendance = enrollments.map(enrollment => ({
      studentId: enrollment.student.uuid.toString(),
      firstName: enrollment.student.firstName,
      middleName: enrollment.student.middleName,
      lastName: enrollment.student.lastName,
      fullName: `${enrollment.student.firstName} ${enrollment.student.middleName} ${enrollment.student.lastName}`,
      phone: enrollment.student.phone,
      status: attendanceMap[enrollment.student.uuid.toString()] || null // null = not marked yet
    }));

    // Calculate statistics
    const presentCount = studentsWithAttendance.filter(s => s.status === 'present').length;
    const absentCount = studentsWithAttendance.filter(s => s.status === 'absent').length;
    const notMarkedCount = studentsWithAttendance.filter(s => s.status === null).length;

    return createResponse(res, 200, 'Attendance fetched successfully', {
      session: {
        id: session.id.toString(),
        courseId: session.courseId.toString(),
        courseName: session.course.title,
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
      },
      students: studentsWithAttendance,
      statistics: {
        totalStudents: studentsWithAttendance.length,
        presentCount,
        absentCount,
        notMarkedCount,
        attendanceRate: studentsWithAttendance.length > 0
          ? Math.round((presentCount / studentsWithAttendance.length) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching session attendance:', error);
    return createErrorResponse(res, 500, 'Failed to fetch attendance');
  }
};

/**
 * Get all attendance for a course
 * GET /api/admin/courses/:courseId/attendance
 */
export const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
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

    // Get all sessions for this course
    const sessions = await Prisma.session.findMany({
      where: { courseId: courseIdBigInt },
      include: {
        attendances: {
          include: {
            student: {
              select: {
                uuid: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Transform data
    const sessionsData = sessions.map(session => ({
      id: session.id.toString(),
      title: session.title,
      date: session.date,
      formattedDate: session.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      attendanceCount: session.attendances.length
    }));

    return createResponse(res, 200, 'Course attendance fetched successfully', {
      course: {
        id: course.id.toString(),
        title: course.title,
        type: course.type
      },
      sessions: sessionsData,
      totalSessions: sessionsData.length
    });
  } catch (error) {
    console.error('Error fetching course attendance:', error);
    return createErrorResponse(res, 500, 'Failed to fetch course attendance');
  }
};
