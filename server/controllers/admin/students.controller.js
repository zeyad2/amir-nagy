/**
 * Admin Students Controller
 * Handles student management operations for admins
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Get all students with their enrollment information
 * GET /api/admin/students
 */
export const getAllStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search - need to search through Student table
    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Build order clause - need to handle user fields differently
    const orderBy = {};
    if (sortBy === 'createdAt' || sortBy === 'email') {
      orderBy.user = {};
      orderBy.user[sortBy] = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [students, totalCount] = await Promise.all([
      Prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              uuid: true,
              email: true,
              createdAt: true
            }
          },
          enrollments: {
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
          }
        },
        orderBy,
        take: parseInt(limit),
        skip: offset
      }),
      Prisma.student.count({ where })
    ]);

    // Transform to handle BigInt serialization
    const studentsWithEnrollments = students.map(student => ({
      id: student.uuid.toString(),
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      email: student.user.email,
      phone: student.phone,
      parentFirstName: student.parentFirstName,
      parentLastName: student.parentLastName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      createdAt: student.user.createdAt,
      enrollments: student.enrollments.map(enrollment => ({
        id: enrollment.id.toString(),
        status: enrollment.status,
        createdAt: enrollment.createdAt,
        course: {
          id: enrollment.course.id.toString(),
          title: enrollment.course.title,
          type: enrollment.course.type,
          status: enrollment.course.status
        }
      }))
    }));

    return createResponse(res, 200, 'Students fetched successfully', {
      students: studentsWithEnrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return createErrorResponse(res, 500, 'Failed to fetch students');
  }
};

/**
 * Get a single student by ID with detailed information
 * GET /api/admin/students/:id
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Prisma.student.findUnique({
      where: {
        uuid: BigInt(id)
      },
      include: {
        user: {
          select: {
            uuid: true,
            email: true,
            createdAt: true
          }
        },
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
                price: true
              }
            },
            accessWindows: true
          }
        },
        // Include homework and test submissions for performance data
        homeworkSubmissions: {
          include: {
            homework: {
              select: { id: true, title: true }
            }
          }
        },
        testSubmissions: {
          include: {
            CourseTest: {
              include: {
                test: {
                  select: { id: true, title: true }
                }
              }
            }
          }
        }
      }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student not found');
    }

    // Transform to handle BigInt serialization and calculate performance metrics
    const studentData = {
      id: student.uuid.toString(),
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      email: student.user.email,
      phone: student.phone,
      parentFirstName: student.parentFirstName,
      parentLastName: student.parentLastName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      createdAt: student.user.createdAt,
      enrollments: student.enrollments.map(enrollment => ({
        id: enrollment.id.toString(),
        status: enrollment.status,
        createdAt: enrollment.createdAt,
        course: {
          id: enrollment.course.id.toString(),
          title: enrollment.course.title,
          type: enrollment.course.type,
          status: enrollment.course.status,
          price: enrollment.course.price
        },
        accessWindows: enrollment.accessWindows.map(accessWindow => ({
          id: accessWindow.id.toString(),
          startSessionId: accessWindow.startSessionId?.toString(),
          endSessionId: accessWindow.endSessionId?.toString()
        }))
      })),
      performance: {
        totalHomeworkSubmissions: student.homeworkSubmissions.length,
        totalTestSubmissions: student.testSubmissions.length,
        averageScore: null // TODO: Calculate when we have proper submission scoring
      }
    };

    return createResponse(res, 200, 'Student details fetched successfully', { student: studentData });
  } catch (error) {
    console.error('Error fetching student details:', error);
    return createErrorResponse(res, 500, 'Failed to fetch student details');
  }
};

/**
 * Get enrollment requests
 * GET /api/admin/enrollment-requests
 */
export const getEnrollmentRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const [requests, totalCount] = await Promise.all([
      Prisma.enrollmentRequest.findMany({
        where,
        include: {
          student: {
            select: {
              uuid: true,
              firstName: true,
              lastName: true,
              phone: true,
              parentFirstName: true,
              parentLastName: true,
              parentEmail: true,
              parentPhone: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              price: true
            }
          }
        },
        orderBy: { requestedAt: 'desc' },
        take: parseInt(limit),
        skip: offset
      }),
      Prisma.enrollmentRequest.count({ where })
    ]);

    // Transform to handle BigInt serialization
    const transformedRequests = requests.map(request => ({
      id: request.id.toString(),
      status: request.status,
      requestedAt: request.requestedAt,
      student: {
        id: request.student.uuid.toString(),
        firstName: request.student.firstName,
        lastName: request.student.lastName,
        email: request.student.user.email,
        phone: request.student.phone,
        parentFirstName: request.student.parentFirstName,
        parentLastName: request.student.parentLastName,
        parentEmail: request.student.parentEmail,
        parentPhone: request.student.parentPhone
      },
      course: {
        id: request.course.id.toString(),
        title: request.course.title,
        type: request.course.type,
        status: request.course.status,
        price: request.course.price
      }
    }));

    return createResponse(res, 200, 'Enrollment requests fetched successfully', {
      requests: transformedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    return createErrorResponse(res, 500, 'Failed to fetch enrollment requests');
  }
};

/**
 * Approve an enrollment request
 * PUT /api/admin/enrollment-requests/:id/approve
 */
export const approveEnrollmentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessWindow } = req.body;

    // Start a transaction to handle enrollment creation and request update
    const result = await Prisma.$transaction(async (prisma) => {
      // First, check if the request exists and is pending
      const request = await prisma.enrollmentRequest.findUnique({
        where: { id: BigInt(id) },
        include: {
          student: true,
          course: true
        }
      });

      if (!request) {
        throw new Error('Enrollment request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Request has already been processed');
      }

      // Create the enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: request.studentId,
          courseId: request.courseId,
          status: 'active'
        }
      });

      // Create access window if provided (for live courses with partial access)
      if (accessWindow && accessWindow.type !== 'full') {
        await prisma.accessWindow.create({
          data: {
            enrollmentId: enrollment.id,
            startSessionId: accessWindow.startSessionId ? BigInt(accessWindow.startSessionId) : null,
            endSessionId: accessWindow.endSessionId ? BigInt(accessWindow.endSessionId) : null
          }
        });
      }

      // Update the request status
      await prisma.enrollmentRequest.update({
        where: { id: BigInt(id) },
        data: { status: 'approved' }
      });

      return { enrollment, request };
    });

    return createResponse(res, 200, 'Enrollment request approved successfully', {
      enrollmentId: result.enrollment.id.toString()
    });
  } catch (error) {
    console.error('Error approving enrollment request:', error);
    if (error.message.includes('not found') || error.message.includes('already been processed')) {
      return createErrorResponse(res, 400, error.message);
    }
    return createErrorResponse(res, 500, 'Failed to approve enrollment request');
  }
};

/**
 * Reject an enrollment request
 * PUT /api/admin/enrollment-requests/:id/reject
 */
export const rejectEnrollmentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Prisma.enrollmentRequest.findUnique({
      where: { id: BigInt(id) }
    });

    if (!request) {
      return createErrorResponse(res, 404, 'Enrollment request not found');
    }

    if (request.status !== 'pending') {
      return createErrorResponse(res, 400, 'Request has already been processed');
    }

    await Prisma.enrollmentRequest.update({
      where: { id: BigInt(id) },
      data: { status: 'rejected' }
    });

    return createResponse(res, 200, 'Enrollment request rejected successfully');
  } catch (error) {
    console.error('Error rejecting enrollment request:', error);
    return createErrorResponse(res, 500, 'Failed to reject enrollment request');
  }
};

/**
 * Bulk approve enrollment requests
 * POST /api/admin/enrollment-requests/bulk-approve
 */
export const bulkApproveEnrollmentRequests = async (req, res) => {
  try {
    const { requestIds, accessWindows = {} } = req.body;

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return createErrorResponse(res, 400, 'Request IDs array is required');
    }

    const result = await Prisma.$transaction(async (prisma) => {
      const results = [];

      for (const requestId of requestIds) {
        const request = await prisma.enrollmentRequest.findUnique({
          where: { id: BigInt(requestId) },
          include: { student: true, course: true }
        });

        if (!request || request.status !== 'pending') {
          continue; // Skip invalid or already processed requests
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId: request.studentId,
            courseId: request.courseId,
            status: 'active'
          }
        });

        // Create access window if specified for this request
        const accessWindow = accessWindows[requestId];
        if (accessWindow && accessWindow.type !== 'full') {
          await prisma.accessWindow.create({
            data: {
              enrollmentId: enrollment.id,
              startSessionId: accessWindow.startSessionId ? BigInt(accessWindow.startSessionId) : null,
              endSessionId: accessWindow.endSessionId ? BigInt(accessWindow.endSessionId) : null
            }
          });
        }

        // Update request status
        await prisma.enrollmentRequest.update({
          where: { id: BigInt(requestId) },
          data: { status: 'approved' }
        });

        results.push({
          requestId: requestId,
          enrollmentId: enrollment.id.toString(),
          student: request.student.firstName + ' ' + request.student.lastName,
          course: request.course.title
        });
      }

      return results;
    });

    return createResponse(res, 200, 'Enrollment requests processed successfully', {
      processedCount: result.length,
      enrollments: result
    });
  } catch (error) {
    console.error('Error bulk approving enrollment requests:', error);
    return createErrorResponse(res, 500, 'Failed to process enrollment requests');
  }
};

/**
 * Bulk reject enrollment requests
 * POST /api/admin/enrollment-requests/bulk-reject
 */
export const bulkRejectEnrollmentRequests = async (req, res) => {
  try {
    const { requestIds } = req.body;

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return createErrorResponse(res, 400, 'Request IDs array is required');
    }

    const result = await Prisma.enrollmentRequest.updateMany({
      where: {
        id: { in: requestIds.map(id => BigInt(id)) },
        status: 'pending'
      },
      data: { status: 'rejected' }
    });

    return createResponse(res, 200, 'Enrollment requests rejected successfully', {
      rejectedCount: result.count
    });
  } catch (error) {
    console.error('Error bulk rejecting enrollment requests:', error);
    return createErrorResponse(res, 500, 'Failed to reject enrollment requests');
  }
};