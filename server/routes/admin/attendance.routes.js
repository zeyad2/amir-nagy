/**
 * Admin Attendance Routes
 * Routes for marking and retrieving attendance
 */
import { Router } from "express";
import {
  markAttendance,
  getSessionAttendance,
  getCourseAttendance
} from "../../controllers/admin/attendance.controller.js";
import { validateParams, validateSchema } from "../../middlewares/validation.middleware.js";
import {
  markAttendanceSchema,
  sessionIdParamSchema,
  courseIdParamSchema
} from "../../schemas/attendance.schemas.js";

const router = Router();

/**
 * Mark attendance for a session (bulk operation)
 * POST /api/admin/sessions/:sessionId/attendance
 */
router.post(
  '/sessions/:sessionId/attendance',
  validateParams(sessionIdParamSchema),
  validateSchema(markAttendanceSchema),
  markAttendance
);

/**
 * Get attendance for a specific session
 * GET /api/admin/sessions/:sessionId/attendance
 */
router.get(
  '/sessions/:sessionId/attendance',
  validateParams(sessionIdParamSchema),
  getSessionAttendance
);

/**
 * Get all attendance for a course
 * GET /api/admin/courses/:courseId/attendance
 */
router.get(
  '/courses/:courseId/attendance',
  validateParams(courseIdParamSchema),
  getCourseAttendance
);

export default router;
