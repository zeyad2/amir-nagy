/**
 * Admin Courses Routes
 * Handles routing for course management endpoints
 */
import { Router } from "express";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  getCourseSessions,
  assignContent,
  removeContent
} from "../../controllers/admin/courses.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createCourseSchema,
  updateCourseSchema,
  courseIdSchema,
  courseIdParamSchema,
  courseQuerySchema,
  updateCourseStatusSchema,
  removeContentParamsSchema,
  removeContentQuerySchema
} from "../../schemas/course.schemas.js";

const coursesRouter = Router();

// GET /api/admin/courses - Get all courses with filtering and pagination
coursesRouter.get('/',
  validateQuery(courseQuerySchema),
  getCourses
);

// GET /api/admin/courses/:id - Get a specific course with detailed information
coursesRouter.get('/:id',
  validateParams(courseIdSchema),
  getCourse
);

// POST /api/admin/courses - Create a new course
coursesRouter.post('/',
  validateSchema(createCourseSchema),
  createCourse
);

// PUT /api/admin/courses/:id - Update a course
coursesRouter.put('/:id',
  validateParams(courseIdSchema),
  validateSchema(updateCourseSchema),
  updateCourse
);

// DELETE /api/admin/courses/:id - Delete a course (soft delete)
coursesRouter.delete('/:id',
  validateParams(courseIdSchema),
  deleteCourse
);

// PATCH /api/admin/courses/:id/status - Update course status
coursesRouter.patch('/:id/status',
  validateParams(courseIdSchema),
  validateSchema(updateCourseStatusSchema),
  updateCourseStatus
);

// GET /api/admin/courses/:courseId/sessions - Get sessions for a course (for access window dropdowns)
coursesRouter.get('/:courseId/sessions',
  validateParams(courseIdParamSchema),
  getCourseSessions
);

// POST /api/admin/courses/:id/content - Assign content to a course
coursesRouter.post('/:id/content',
  validateParams(courseIdSchema),
  assignContent
);

// DELETE /api/admin/courses/:id/content/:contentId - Remove content from a course
coursesRouter.delete('/:id/content/:contentId',
  validateParams(removeContentParamsSchema),
  validateQuery(removeContentQuerySchema),
  removeContent
);

export default coursesRouter;
