/**
 * Admin Lessons Controller
 * Handles CRUD operations for lessons management
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";
import { isValidGoogleDriveUrl } from "../../utils/validation.utils.js";

/**
 * Get all lessons with usage information
 * GET /api/admin/lessons
 */
export const getLessons = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'title', sortOrder = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const where = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Build order clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [lessons, totalCount] = await Promise.all([
      Prisma.lesson.findMany({
        where,
        include: {
          courseLessons: {
            include: {
              course: {
                select: { id: true, title: true, status: true }
              }
            }
          }
        },
        orderBy,
        take: parseInt(limit),
        skip: offset
      }),
      Prisma.lesson.count({ where })
    ]);

    // Transform to include usage information and handle BigInt serialization
    const lessonsWithUsage = lessons.map(lesson => ({
      id: lesson.id.toString(),
      title: lesson.title,
      videoLink: lesson.videoLink,
      usageCount: lesson.courseLessons.length,
      usedInCourses: lesson.courseLessons.map(cl => ({
        id: cl.course.id.toString(),
        title: cl.course.title,
        status: cl.course.status
      })),
      canDelete: lesson.courseLessons.length === 0
    }));

    return createResponse(res, 200, 'Lessons fetched successfully', {
      lessons: lessonsWithUsage,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return createErrorResponse(res, 500, 'Failed to fetch lessons');
  }
};

/**
 * Get a single lesson by ID
 * GET /api/admin/lessons/:id
 */
export const getLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Prisma.lesson.findUnique({
      where: { id: BigInt(id) },
      include: {
        courseLessons: {
          include: {
            course: {
              select: { id: true, title: true, status: true }
            }
          }
        }
      }
    });

    if (!lesson) {
      return createErrorResponse(res, 404, 'Lesson not found');
    }

    const lessonWithUsage = {
      id: lesson.id.toString(),
      title: lesson.title,
      videoLink: lesson.videoLink,
      usageCount: lesson.courseLessons.length,
      usedInCourses: lesson.courseLessons.map(cl => ({
        id: cl.course.id.toString(),
        title: cl.course.title,
        status: cl.course.status
      })),
      canDelete: lesson.courseLessons.length === 0
    };

    return createResponse(res, 200, 'Lesson fetched successfully', { lesson: lessonWithUsage });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return createErrorResponse(res, 500, 'Failed to fetch lesson');
  }
};

/**
 * Create a new lesson
 * POST /api/admin/lessons
 */
export const createLesson = async (req, res) => {
  try {
    const { title, videoLink } = req.body;

    // Additional Google Drive URL validation
    if (!isValidGoogleDriveUrl(videoLink)) {
      return createErrorResponse(res, 400, 'Invalid Google Drive URL format');
    }

    const lesson = await Prisma.lesson.create({
      data: { title, videoLink }
    });

    // Convert BigInt to string for JSON serialization
    const lessonResponse = {
      id: lesson.id.toString(),
      title: lesson.title,
      videoLink: lesson.videoLink
    };

    return createResponse(res, 201, 'Lesson created successfully', { lesson: lessonResponse });
  } catch (error) {
    console.error('Error creating lesson:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A lesson with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to create lesson');
  }
};

/**
 * Update a lesson
 * PUT /api/admin/lessons/:id
 */
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate Google Drive URL if provided
    if (updateData.videoLink && !isValidGoogleDriveUrl(updateData.videoLink)) {
      return createErrorResponse(res, 400, 'Invalid Google Drive URL format');
    }

    // Check if lesson exists
    const existingLesson = await Prisma.lesson.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingLesson) {
      return createErrorResponse(res, 404, 'Lesson not found');
    }

    const lesson = await Prisma.lesson.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    // Convert BigInt to string for JSON serialization
    const lessonResponse = {
      id: lesson.id.toString(),
      title: lesson.title,
      videoLink: lesson.videoLink
    };

    return createResponse(res, 200, 'Lesson updated successfully', { lesson: lessonResponse });
  } catch (error) {
    console.error('Error updating lesson:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A lesson with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to update lesson');
  }
};

/**
 * Delete a lesson (with usage check)
 * DELETE /api/admin/lessons/:id
 */
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lesson exists
    const lesson = await Prisma.lesson.findUnique({
      where: { id: BigInt(id) },
      include: {
        courseLessons: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    if (!lesson) {
      return createErrorResponse(res, 404, 'Lesson not found');
    }

    // Check if lesson is used in any courses
    if (lesson.courseLessons.length > 0) {
      const courseNames = lesson.courseLessons.map(cl => cl.course.title).join(', ');
      return createErrorResponse(res, 400,
        `Cannot delete lesson. It is currently used in the following course(s): ${courseNames}`
      );
    }

    await Prisma.lesson.delete({
      where: { id: BigInt(id) }
    });

    return createResponse(res, 200, 'Lesson deleted successfully');
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return createErrorResponse(res, 500, 'Failed to delete lesson');
  }
};

/**
 * Get courses that use a specific lesson
 * GET /api/admin/lessons/:id/courses
 */
export const getLessonCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Prisma.lesson.findUnique({
      where: { id: BigInt(id) },
      include: {
        courseLessons: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
                type: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!lesson) {
      return createErrorResponse(res, 404, 'Lesson not found');
    }

    const courses = lesson.courseLessons.map(cl => ({
      id: cl.course.id.toString(),
      title: cl.course.title,
      status: cl.course.status,
      type: cl.course.type,
      createdAt: cl.course.createdAt,
      order: cl.order
    }));

    return createResponse(res, 200, 'Lesson courses fetched successfully', {
      lesson: {
        id: lesson.id.toString(),
        title: lesson.title
      },
      courses,
      usageCount: courses.length
    });
  } catch (error) {
    console.error('Error fetching lesson courses:', error);
    return createErrorResponse(res, 500, 'Failed to fetch lesson courses');
  }
};