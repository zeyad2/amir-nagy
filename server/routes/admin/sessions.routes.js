/**
 * Admin Sessions Routes
 * Routes for managing sessions in live courses
 */
import { Router } from "express";
import { createSession, getCourseSessions } from "../../controllers/admin/sessions.controller.js";
import { validateParams, validateSchema, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createSessionSchema,
  courseIdParamSchema,
  getSessionsQuerySchema
} from "../../schemas/session.schemas.js";

const router = Router();

/**
 * Create a new session for a course
 * POST /api/admin/courses/:courseId/sessions
 */
router.post(
  '/courses/:courseId/sessions',
  validateParams(courseIdParamSchema),
  validateSchema(createSessionSchema),
  createSession
);

/**
 * Get all sessions for a course
 * GET /api/admin/courses/:courseId/sessions
 */
router.get(
  '/courses/:courseId/sessions',
  validateParams(courseIdParamSchema),
  validateQuery(getSessionsQuerySchema),
  getCourseSessions
);

export default router;
