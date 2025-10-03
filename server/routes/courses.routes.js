/**
 * Public/Student Courses Routes
 * Handles routing for public course access and student-facing course operations
 */
import { Router } from "express";
import {
  getPublicCourses,
  getPublicCourseDetail,
  getCourseAccessStatus,
  getAccessibleCourseSessions,
  validateSessionContentAccess
} from "../controllers/courses.controller.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { requireUser } from "../middlewares/requireUser.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { courseIdSchema } from "../schemas/course.schemas.js";

const coursesRouter = Router();

// Public endpoints (no auth required)
// GET /api/courses - Get all published courses
coursesRouter.get('/', getPublicCourses);

// GET /api/courses/:id - Get specific course details (with optional auth for enrollment status)
coursesRouter.get('/:id',
  optionalAuth, // Optional authentication to check enrollment status
  validateParams(courseIdSchema),
  getPublicCourseDetail
);

// GET /api/courses/:id/access-status - Get course access status for current user
coursesRouter.get('/:id/access-status',
  requireUser, // Require authentication
  validateParams(courseIdSchema),
  getCourseAccessStatus
);

// GET /api/courses/:id/accessible-sessions - Get accessible sessions for current user
coursesRouter.get('/:id/accessible-sessions',
  requireUser, // Require authentication
  validateParams(courseIdSchema),
  getAccessibleCourseSessions
);

// GET /api/courses/:courseId/sessions/:sessionId/access - Validate access to specific session content
coursesRouter.get('/:courseId/sessions/:sessionId/access',
  requireUser, // Require authentication
  validateSessionContentAccess
);

export default coursesRouter;