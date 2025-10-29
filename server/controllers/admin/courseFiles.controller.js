/**
 * Admin Course Files Controller
 * Handles CRUD operations for course files management
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";
import fs from "fs";
import path from "path";

/**
 * Get all course files with usage information
 * GET /api/admin/course-files
 */
export const getCourseFiles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'title', sortOrder = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const where = { deletedAt: null };
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Build order clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [files, totalCount] = await Promise.all([
      Prisma.courseFile.findMany({
        where,
        include: {
          courseFiles: {
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
      Prisma.courseFile.count({ where })
    ]);

    // Transform to include usage information and handle BigInt serialization
    const filesWithUsage = files.map(file => ({
      id: file.id.toString(),
      title: file.title,
      description: file.description,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileSize: file.fileSize.toString(),
      mimeType: file.mimeType,
      usageCount: file.courseFiles.length,
      usedInCourses: file.courseFiles.map(cf => ({
        id: cf.course.id.toString(),
        title: cf.course.title,
        status: cf.course.status
      })),
      canDelete: file.courseFiles.length === 0,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }));

    return createResponse(res, 200, 'Course files fetched successfully', {
      files: filesWithUsage,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching course files:', error);
    return createErrorResponse(res, 500, 'Failed to fetch course files');
  }
};

/**
 * Get a single course file by ID
 * GET /api/admin/course-files/:id
 */
export const getCourseFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await Prisma.courseFile.findUnique({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        courseFiles: {
          include: {
            course: {
              select: { id: true, title: true, status: true }
            }
          }
        }
      }
    });

    if (!file) {
      return createErrorResponse(res, 404, 'Course file not found');
    }

    const fileWithUsage = {
      id: file.id.toString(),
      title: file.title,
      description: file.description,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileSize: file.fileSize.toString(),
      mimeType: file.mimeType,
      usageCount: file.courseFiles.length,
      usedInCourses: file.courseFiles.map(cf => ({
        id: cf.course.id.toString(),
        title: cf.course.title,
        status: cf.course.status
      })),
      canDelete: file.courseFiles.length === 0,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    };

    return createResponse(res, 200, 'Course file fetched successfully', { file: fileWithUsage });
  } catch (error) {
    console.error('Error fetching course file:', error);
    return createErrorResponse(res, 500, 'Failed to fetch course file');
  }
};

/**
 * Create a new course file (with file upload)
 * POST /api/admin/course-files
 */
export const createCourseFile = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return createErrorResponse(res, 400, 'File is required');
    }

    // Construct file URL
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/course-files/${file.filename}`;

    const courseFile = await Prisma.courseFile.create({
      data: {
        title,
        description: description || null,
        fileName: file.originalname,
        fileUrl,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype
      }
    });

    // Convert BigInt to string for JSON serialization
    const fileResponse = {
      id: courseFile.id.toString(),
      title: courseFile.title,
      description: courseFile.description,
      fileName: courseFile.fileName,
      fileUrl: courseFile.fileUrl,
      fileSize: courseFile.fileSize.toString(),
      mimeType: courseFile.mimeType,
      createdAt: courseFile.createdAt
    };

    return createResponse(res, 201, 'Course file created successfully', { file: fileResponse });
  } catch (error) {
    console.error('Error creating course file:', error);

    // Delete uploaded file if database operation fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A file with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to create course file');
  }
};

/**
 * Update a course file (metadata only, not the file itself)
 * PUT /api/admin/course-files/:id
 */
export const updateCourseFile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if course file exists
    const existingFile = await Prisma.courseFile.findUnique({
      where: { id: BigInt(id), deletedAt: null }
    });

    if (!existingFile) {
      return createErrorResponse(res, 404, 'Course file not found');
    }

    const courseFile = await Prisma.courseFile.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    // Convert BigInt to string for JSON serialization
    const fileResponse = {
      id: courseFile.id.toString(),
      title: courseFile.title,
      description: courseFile.description,
      fileName: courseFile.fileName,
      fileUrl: courseFile.fileUrl,
      fileSize: courseFile.fileSize.toString(),
      mimeType: courseFile.mimeType,
      updatedAt: courseFile.updatedAt
    };

    return createResponse(res, 200, 'Course file updated successfully', { file: fileResponse });
  } catch (error) {
    console.error('Error updating course file:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A file with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to update course file');
  }
};

/**
 * Delete a course file (soft delete)
 * DELETE /api/admin/course-files/:id
 */
export const deleteCourseFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course file exists
    const file = await Prisma.courseFile.findUnique({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        courseFiles: true
      }
    });

    if (!file) {
      return createErrorResponse(res, 404, 'Course file not found');
    }

    // If file is in use, remove from all courses first (cascade delete)
    if (file.courseFiles.length > 0) {
      await Prisma.courseCourseFile.deleteMany({
        where: { courseFileId: BigInt(id) }
      });
    }

    // Soft delete
    await Prisma.courseFile.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() }
    });

    return createResponse(res, 200, 'Course file deleted successfully');
  } catch (error) {
    console.error('Error deleting course file:', error);
    return createErrorResponse(res, 500, 'Failed to delete course file');
  }
};

/**
 * Get courses that use a specific file
 * GET /api/admin/course-files/:id/courses
 */
export const getCourseFileCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await Prisma.courseFile.findUnique({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        courseFiles: {
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

    if (!file) {
      return createErrorResponse(res, 404, 'Course file not found');
    }

    const courses = file.courseFiles.map(cf => ({
      id: cf.course.id.toString(),
      title: cf.course.title,
      status: cf.course.status,
      type: cf.course.type,
      createdAt: cf.course.createdAt,
      order: cf.order,
      isRestricted: cf.isRestricted
    }));

    return createResponse(res, 200, 'File courses fetched successfully', {
      file: {
        id: file.id.toString(),
        title: file.title,
        fileName: file.fileName
      },
      courses,
      usageCount: courses.length
    });
  } catch (error) {
    console.error('Error fetching file courses:', error);
    return createErrorResponse(res, 500, 'Failed to fetch file courses');
  }
};
