/**
 * Admin Course Files Routes
 * Handles routing for course file management endpoints
 */
import { Router } from "express";
import {
  getCourseFiles,
  getCourseFile,
  createCourseFile,
  updateCourseFile,
  deleteCourseFile,
  getCourseFileCourses
} from "../../controllers/admin/courseFiles.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import { uploadCourseFile, handleUploadError } from "../../middlewares/upload.middleware.js";
import {
  createCourseFileSchema,
  updateCourseFileSchema,
  courseFileIdSchema,
  courseFileQuerySchema
} from "../../schemas/courseFile.schemas.js";

const courseFilesRouter = Router();

// GET /api/admin/course-files - Get all course files with filtering and pagination
courseFilesRouter.get('/',
  validateQuery(courseFileQuerySchema),
  getCourseFiles
);

// GET /api/admin/course-files/:id - Get a specific course file
courseFilesRouter.get('/:id',
  validateParams(courseFileIdSchema),
  getCourseFile
);

// POST /api/admin/course-files - Create a new course file (with file upload)
courseFilesRouter.post('/',
  uploadCourseFile,
  handleUploadError,
  validateSchema(createCourseFileSchema),
  createCourseFile
);

// PUT /api/admin/course-files/:id - Update a course file (metadata only)
courseFilesRouter.put('/:id',
  validateParams(courseFileIdSchema),
  validateSchema(updateCourseFileSchema),
  updateCourseFile
);

// DELETE /api/admin/course-files/:id - Delete a course file (soft delete)
courseFilesRouter.delete('/:id',
  validateParams(courseFileIdSchema),
  deleteCourseFile
);

// GET /api/admin/course-files/:id/courses - Get courses using this file
courseFilesRouter.get('/:id/courses',
  validateParams(courseFileIdSchema),
  getCourseFileCourses
);

export default courseFilesRouter;
