/**
 * Admin Enrollments Controller
 * Handles direct enrollment management operations
 */
import Prisma from "../../prisma/prisma.js";
import { createErrorResponse, createSuccessResponse } from "../../utils/response.util.js";

/**
 * Create a direct enrollment
 * POST /api/admin/enrollments
 */
export const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, status = 'active' } = req.body;

    // Check if student exists
    const student = await Prisma.student.findUnique({
      where: { uuid: BigInt(studentId) }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student not found');
    }

    // Check if course exists
    const course = await Prisma.course.findUnique({
      where: { id: BigInt(courseId) }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Check if enrollment already exists
    const existingEnrollment = await Prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: BigInt(studentId),
          courseId: BigInt(courseId)
        }
      }
    });

    if (existingEnrollment) {
      return createErrorResponse(res, 409, 'Student is already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await Prisma.enrollment.create({
      data: {
        studentId: BigInt(studentId),
        courseId: BigInt(courseId),
        status
      },
      include: {
        student: {
          include: {
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
            status: true
          }
        },
        accessWindows: {
          include: {
            startSession: true,
            endSession: true
          }
        }
      }
    });

    const response = {
      id: enrollment.id.toString(),
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      student: {
        id: enrollment.student.uuid.toString(),
        name: `${enrollment.student.firstName} ${enrollment.student.middleName || ''} ${enrollment.student.lastName}`.trim(),
        email: enrollment.student.user.email
      },
      course: {
        id: enrollment.course.id.toString(),
        title: enrollment.course.title,
        type: enrollment.course.type,
        status: enrollment.course.status
      },
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

    return createSuccessResponse(res, 201, 'Enrollment created successfully', response);

  } catch (error) {
    console.error('Error creating enrollment:', error);
    return createErrorResponse(res, 500, 'Failed to create enrollment');
  }
};

/**
 * Get all enrollments with pagination and filtering
 * GET /api/admin/enrollments
 */
export const getEnrollments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      courseId,
      studentId,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = BigInt(courseId);
    }

    if (studentId) {
      where.studentId = BigInt(studentId);
    }

    if (search) {
      where.OR = [
        {
          student: {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          student: {
            user: {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          course: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Get enrollments and total count
    const [enrollments, total] = await Promise.all([
      Prisma.enrollment.findMany({
        where,
        skip,
        take,
        include: {
          student: {
            include: {
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
              status: true
            }
          },
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
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      Prisma.enrollment.count({ where })
    ]);

    const response = {
      enrollments: enrollments.map(enrollment => ({
        id: enrollment.id.toString(),
        status: enrollment.status,
        createdAt: enrollment.createdAt,
        student: {
          id: enrollment.student.uuid.toString(),
          name: `${enrollment.student.firstName} ${enrollment.student.middleName || ''} ${enrollment.student.lastName}`.trim(),
          email: enrollment.student.user.email
        },
        course: {
          id: enrollment.course.id.toString(),
          title: enrollment.course.title,
          type: enrollment.course.type,
          status: enrollment.course.status
        },
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
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    };

    return createSuccessResponse(res, 200, 'Enrollments retrieved successfully', response);

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return createErrorResponse(res, 500, 'Failed to fetch enrollments');
  }
};

/**
 * Get specific enrollment by ID
 * GET /api/admin/enrollments/:id
 */
export const getEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Prisma.enrollment.findUnique({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        student: {
          include: {
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
        },
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
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            paymentDate: true,
            paymentType: true,
            status: true
          }
        }
      }
    });

    if (!enrollment) {
      return createErrorResponse(res, 404, 'Enrollment not found');
    }

    const response = {
      id: enrollment.id.toString(),
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      student: {
        id: enrollment.student.uuid.toString(),
        firstName: enrollment.student.firstName,
        middleName: enrollment.student.middleName,
        lastName: enrollment.student.lastName,
        email: enrollment.student.user.email,
        phone: enrollment.student.phone,
        parentFirstName: enrollment.student.parentFirstName,
        parentLastName: enrollment.student.parentLastName,
        parentEmail: enrollment.student.parentEmail,
        parentPhone: enrollment.student.parentPhone
      },
      course: {
        id: enrollment.course.id.toString(),
        title: enrollment.course.title,
        type: enrollment.course.type,
        status: enrollment.course.status,
        price: enrollment.course.price
      },
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
      })),
      payments: enrollment.payments.map(payment => ({
        id: payment.id.toString(),
        amount: payment.amount,
        currency: payment.currency,
        paymentDate: payment.paymentDate,
        paymentType: payment.paymentType,
        status: payment.status
      }))
    };

    return createSuccessResponse(res, 200, 'Enrollment retrieved successfully', response);

  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return createErrorResponse(res, 500, 'Failed to fetch enrollment');
  }
};

/**
 * Update enrollment status
 * PUT /api/admin/enrollments/:id
 */
export const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if enrollment exists
    const existingEnrollment = await Prisma.enrollment.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingEnrollment) {
      return createErrorResponse(res, 404, 'Enrollment not found');
    }

    // Update enrollment
    const enrollment = await Prisma.enrollment.update({
      where: { id: BigInt(id) },
      data: { status },
      include: {
        student: {
          include: {
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
            status: true
          }
        }
      }
    });

    const response = {
      id: enrollment.id.toString(),
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      student: {
        id: enrollment.student.uuid.toString(),
        name: `${enrollment.student.firstName} ${enrollment.student.middleName || ''} ${enrollment.student.lastName}`.trim(),
        email: enrollment.student.user.email
      },
      course: {
        id: enrollment.course.id.toString(),
        title: enrollment.course.title,
        type: enrollment.course.type,
        status: enrollment.course.status
      }
    };

    return createSuccessResponse(res, 200, 'Enrollment updated successfully', response);

  } catch (error) {
    console.error('Error updating enrollment:', error);
    return createErrorResponse(res, 500, 'Failed to update enrollment');
  }
};

/**
 * Delete enrollment (soft delete)
 * DELETE /api/admin/enrollments/:id
 */
export const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if enrollment exists
    const existingEnrollment = await Prisma.enrollment.findUnique({
      where: { id: BigInt(id) },
      include: {
        accessWindows: true,
        payments: true
      }
    });

    if (!existingEnrollment) {
      return createErrorResponse(res, 404, 'Enrollment not found');
    }

    // Check if enrollment has associated payments
    if (existingEnrollment.payments && existingEnrollment.payments.length > 0) {
      return createErrorResponse(res, 400, 'Cannot delete enrollment with associated payments');
    }

    // Perform soft delete
    await Prisma.enrollment.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date()
      }
    });

    return createSuccessResponse(res, 200, 'Enrollment deleted successfully');

  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return createErrorResponse(res, 500, 'Failed to delete enrollment');
  }
};