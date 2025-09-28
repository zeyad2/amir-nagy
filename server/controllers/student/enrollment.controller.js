/**
 * Student Enrollment Controller
 * Handles student-facing enrollment request operations
 */
import Prisma from "../../prisma/prisma.js";
import { createErrorResponse, createSuccessResponse } from "../../utils/response.util.js";

/**
 * Create enrollment request for a course
 * POST /api/student/enrollment-requests
 */
export const createEnrollmentRequest = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.uuid; // From requireUser middleware

    // Validate required fields
    if (!courseId) {
      return createErrorResponse(res, 400, 'Course ID is required');
    }

    // Check if course exists and is published
    const course = await Prisma.course.findFirst({
      where: {
        id: BigInt(courseId),
        status: 'published',
        deletedAt: null
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found or not available for enrollment');
    }

    // Check if student is already enrolled in this course
    const existingEnrollment = await Prisma.enrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: BigInt(courseId),
        deletedAt: null
      }
    });

    if (existingEnrollment) {
      return createErrorResponse(res, 409, 'You are already enrolled in this course');
    }

    // Check if student already has a pending or approved request for this course
    const existingRequest = await Prisma.enrollmentRequest.findFirst({
      where: {
        studentId: studentId,
        courseId: BigInt(courseId),
        status: {
          in: ['pending', 'approved']
        }
      }
    });

    if (existingRequest) {
      const statusMessage = existingRequest.status === 'pending'
        ? 'You already have a pending enrollment request for this course'
        : 'You already have an approved enrollment request for this course';
      return createErrorResponse(res, 409, statusMessage);
    }

    // Create enrollment request
    const enrollmentRequest = await Prisma.enrollmentRequest.create({
      data: {
        studentId: studentId,
        courseId: BigInt(courseId),
        status: 'pending'
      },
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
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    const response = {
      id: enrollmentRequest.id.toString(),
      status: enrollmentRequest.status,
      requestedAt: enrollmentRequest.requestedAt,
      course: {
        id: enrollmentRequest.course.id.toString(),
        title: enrollmentRequest.course.title,
        type: enrollmentRequest.course.type,
        price: enrollmentRequest.course.price
      },
      student: {
        name: `${enrollmentRequest.student.firstName} ${enrollmentRequest.student.lastName}`,
        email: enrollmentRequest.student.user.email
      }
    };

    return createSuccessResponse(res, 201, 'Enrollment request created successfully', response);

  } catch (error) {
    console.error('Error creating enrollment request:', error);
    return createErrorResponse(res, 500, 'Failed to create enrollment request');
  }
};

/**
 * Get student's enrollment requests
 * GET /api/student/enrollment-requests
 */
export const getStudentEnrollmentRequests = async (req, res) => {
  try {
    const studentId = req.user.uuid;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      studentId: studentId
    };

    if (status) {
      where.status = status;
    }

    // Get enrollment requests and total count
    const [requests, total] = await Promise.all([
      Prisma.enrollmentRequest.findMany({
        where,
        skip,
        take,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              type: true,
              price: true,
              status: true
            }
          }
        },
        orderBy: {
          requestedAt: 'desc'
        }
      }),
      Prisma.enrollmentRequest.count({ where })
    ]);

    const response = {
      requests: requests.map(request => ({
        id: request.id.toString(),
        status: request.status,
        requestedAt: request.requestedAt,
        course: {
          id: request.course.id.toString(),
          title: request.course.title,
          type: request.course.type,
          price: request.course.price,
          status: request.course.status
        }
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    };

    return createSuccessResponse(res, 200, 'Enrollment requests retrieved successfully', response);

  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    return createErrorResponse(res, 500, 'Failed to fetch enrollment requests');
  }
};

/**
 * Cancel enrollment request (only if pending)
 * DELETE /api/student/enrollment-requests/:id
 */
export const cancelEnrollmentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.uuid;

    // Check if request exists and belongs to the student
    const request = await Prisma.enrollmentRequest.findFirst({
      where: {
        id: BigInt(id),
        studentId: studentId
      }
    });

    if (!request) {
      return createErrorResponse(res, 404, 'Enrollment request not found');
    }

    // Only allow cancellation of pending requests
    if (request.status !== 'pending') {
      return createErrorResponse(res, 400, `Cannot cancel ${request.status} enrollment request`);
    }

    // Update status to rejected (cancelled by student)
    await Prisma.enrollmentRequest.update({
      where: { id: BigInt(id) },
      data: { status: 'rejected' }
    });

    return createSuccessResponse(res, 200, 'Enrollment request cancelled successfully');

  } catch (error) {
    console.error('Error cancelling enrollment request:', error);
    return createErrorResponse(res, 500, 'Failed to cancel enrollment request');
  }
};