/**
 * Student Dashboard Controller
 * Handles student dashboard data and enrolled courses
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.util.js";

/**
 * Get student dashboard data
 * GET /api/student/dashboard
 */
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.uuid;

    // Get student record
    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student not found');
    }

    // Get enrolled courses with progress
    const enrollments = await Prisma.enrollment.findMany({
      where: {
        studentId: student.uuid,
        status: 'active',
        deletedAt: null
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            thumbnail: true,
            _count: {
              select: {
                courseLessons: true,
                courseHomeworks: true,
                courseTests: true
              }
            }
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
    });

    // Get total submission count
    const totalSubmissions = await Prisma.testSubmission.count({
      where: {
        studentId: student.uuid
      }
    });

    // Get average score across all submissions
    const submissions = await Prisma.testSubmission.findMany({
      where: {
        studentId: student.uuid
      },
      include: {
        test: {
          select: {
            passages: {
              select: {
                questions: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    });

    let averageScore = 0;
    if (submissions.length > 0) {
      const totalScore = submissions.reduce((sum, sub) => {
        const totalQuestions = sub.test.passages.reduce((count, passage) => count + passage.questions.length, 0);
        const percentage = totalQuestions > 0 ? (sub.score / totalQuestions) * 100 : 0;
        return sum + percentage;
      }, 0);
      averageScore = Math.round(totalScore / submissions.length);
    }

    // Get recent submissions (last 5)
    const recentSubmissions = await Prisma.testSubmission.findMany({
      where: {
        studentId: student.uuid
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            passages: {
              select: {
                questions: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 5
    });

    // Format enrolled courses
    const enrolledCourses = enrollments.map(enrollment => ({
      id: enrollment.id.toString(),
      enrolledAt: enrollment.createdAt,
      status: enrollment.status,
      course: {
        id: enrollment.course.id.toString(),
        title: enrollment.course.title,
        description: enrollment.course.description,
        type: enrollment.course.type,
        thumbnail: enrollment.course.thumbnail,
        _count: enrollment.course._count
      },
      accessType: enrollment.accessWindows.length > 0 ? 'partial' : 'full',
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
    }));

    // Format recent submissions
    const recentActivity = recentSubmissions.map(submission => {
      // Calculate total questions from all passages
      const totalQuestions = submission.test.passages.reduce((total, passage) => {
        return total + (passage.questions?.length || 0);
      }, 0);
      return {
        id: submission.id.toString(),
        test: {
          id: submission.test.id.toString(),
          title: submission.test.title
        },
        score: submission.score,
        totalQuestions: totalQuestions,
        percentage: totalQuestions > 0
          ? Math.round((submission.score / totalQuestions) * 100)
          : 0,
        submittedAt: submission.submittedAt
      };
    });

    return createResponse(res, 200, 'Dashboard data fetched successfully', {
      student: {
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        email: student.email
      },
      stats: {
        enrolledCoursesCount: enrolledCourses.length,
        totalSubmissions,
        averageScore
      },
      enrolledCourses,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return createErrorResponse(res, 500, 'Failed to fetch dashboard data');
  }
};

/**
 * Get student's enrolled courses
 * GET /api/student/courses
 */
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.uuid;

    // Get student record
    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student not found');
    }

    // Get enrolled courses
    const enrollments = await Prisma.enrollment.findMany({
      where: {
        studentId: student.uuid,
        status: 'active',
        deletedAt: null
      },
      include: {
        course: {
          include: {
            _count: {
              select: {
                courseLessons: true,
                courseHomeworks: true,
                courseTests: true
              }
            }
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
    });

    // Format response
    const courses = enrollments.map(enrollment => ({
      enrollmentId: enrollment.id.toString(),
      enrolledAt: enrollment.createdAt,
      status: enrollment.status,
      course: {
        id: enrollment.course.id.toString(),
        title: enrollment.course.title,
        description: enrollment.course.description,
        type: enrollment.course.type,
        thumbnail: enrollment.course.thumbnail,
        price: enrollment.course.price,
        _count: enrollment.course._count
      },
      accessType: enrollment.accessWindows.length > 0 ? 'partial' : 'full',
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
    }));

    return createResponse(res, 200, 'Enrolled courses fetched successfully', {
      courses,
      total: courses.length
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return createErrorResponse(res, 500, 'Failed to fetch enrolled courses');
  }
};
