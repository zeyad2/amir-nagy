/**
 * Admin Dashboard Controller
 * Handles statistics and dashboard data for admin interface
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard/stats
 * @access Admin only
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Calculate date 7 days ago for recent submissions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Execute all queries in parallel for better performance
    const [
      totalStudents,
      activeCourses,
      pendingRequests,
      recentHomeworkSubmissions,
      recentTestSubmissions
    ] = await Promise.all([
      // Count total students (users with student role)
      Prisma.user.count({
        where: {
          role: 'student',
          deletedAt: null
        }
      }),

      // Count active (published) courses
      Prisma.course.count({
        where: {
          status: 'published',
          deletedAt: null
        }
      }),

      // Count pending enrollment requests
      Prisma.enrollmentRequest.count({
        where: {
          status: 'pending'
        }
      }),

      // Count recent homework submissions (last 7 days)
      // Using createdAt since submittedAt might not exist in current schema
      Prisma.homeworkSubmission.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }).catch(() => 0), // Handle gracefully if table doesn't exist yet

      // Count recent test submissions (last 7 days)
      Prisma.testSubmission.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }).catch(() => 0) // Handle gracefully if table doesn't exist yet
    ]);

    // Calculate total recent submissions
    const recentSubmissions = recentHomeworkSubmissions + recentTestSubmissions;

    const stats = {
      totalStudents,
      activeCourses,
      pendingRequests,
      recentSubmissions
    };

    return createResponse(res, 200, 'Dashboard statistics fetched successfully', stats);

  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return createErrorResponse(res, 500, 'Failed to fetch dashboard statistics');
  }
};

/**
 * Get detailed dashboard data (optional extended version)
 * @route GET /api/admin/dashboard/details
 * @access Admin only
 */
export const getDashboardDetails = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      basicStats,
      recentStudents,
      recentEnrollmentRequests,
      courseStats
    ] = await Promise.all([
      // Get basic stats (reuse the logic from getDashboardStats)
      getDashboardStatsData(),

      // Get 5 most recent students
      Prisma.user.findMany({
        where: {
          role: 'student',
          deletedAt: null
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),

      // Get 5 most recent enrollment requests
      Prisma.enrollmentRequest.findMany({
        where: {
          status: 'pending'
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          course: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          requestedAt: 'desc'
        },
        take: 5
      }),

      // Get course distribution by status
      Prisma.course.groupBy({
        by: ['status'],
        where: {
          deletedAt: null
        },
        _count: {
          status: true
        }
      })
    ]);

    const detailedData = {
      stats: basicStats,
      recentStudents: recentStudents.map(user => ({
        id: user.uuid.toString(),
        email: user.email,
        name: user.student ? `${user.student.firstName} ${user.student.lastName}` : 'Unknown',
        createdAt: user.createdAt
      })),
      recentEnrollmentRequests: recentEnrollmentRequests.map(request => ({
        id: request.id.toString(),
        studentName: `${request.student.firstName} ${request.student.lastName}`,
        courseName: request.course.title,
        requestedAt: request.requestedAt
      })),
      courseDistribution: courseStats.map(stat => ({
        status: stat.status,
        count: stat._count.status
      }))
    };

    res.status(200).json({
      message: 'Detailed dashboard data fetched successfully',
      data: detailedData
    });

  } catch (error) {
    console.error('Error fetching detailed dashboard data:', error);
    res.status(500).json({
      error: 'Failed to fetch detailed dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to get basic dashboard statistics
 * Used internally for both basic and detailed endpoints
 */
async function getDashboardStatsData() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalStudents,
    activeCourses,
    pendingRequests,
    recentHomeworkSubmissions,
    recentTestSubmissions
  ] = await Promise.all([
    Prisma.user.count({
      where: {
        role: 'student',
        deletedAt: null
      }
    }),
    Prisma.course.count({
      where: {
        status: 'published',
        deletedAt: null
      }
    }),
    Prisma.enrollmentRequest.count({
      where: {
        status: 'pending'
      }
    }),
    Prisma.homeworkSubmission.count({
      where: {
        submittedAt: {
          gte: sevenDaysAgo
        }
      }
    }),
    Prisma.testSubmission.count({
      where: {
        submittedAt: {
          gte: sevenDaysAgo
        }
      }
    })
  ]);

  return {
    totalStudents,
    activeCourses,
    pendingRequests,
    recentSubmissions: recentHomeworkSubmissions + recentTestSubmissions
  };
}