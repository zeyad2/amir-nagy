/**
 * Admin Sessions Routes
 * Routes for managing sessions in live courses
 */
import { Router } from "express";
import {
  createSession,
  getCourseSessions,
  getSessionById,
  updateSession,
  deleteSession
} from "../../controllers/admin/sessions.controller.js";
import { validateParams, validateSchema, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createSessionSchema,
  updateSessionSchema,
  courseIdParamSchema,
  sessionIdParamSchema,
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

/**
 * Get a single session by ID
 * GET /api/admin/sessions/:id
 */
router.get(
  '/sessions/:id',
  validateParams(sessionIdParamSchema),
  getSessionById
);

/**
 * Update a session
 * PUT /api/admin/sessions/:id
 */
router.put(
  '/sessions/:id',
  validateParams(sessionIdParamSchema),
  validateSchema(updateSessionSchema),
  updateSession
);

/**
 * Delete a session
 * DELETE /api/admin/sessions/:id
 */
router.delete(
  '/sessions/:id',
  validateParams(sessionIdParamSchema),
  deleteSession
);

export default router;
