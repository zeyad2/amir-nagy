/**
 * Admin Access Windows Routes
 * Handles routing for access window management endpoints
 */
import { Router } from "express";
import {
  getAccessWindows,
  getAccessWindow,
  createAccessWindow,
  updateAccessWindow,
  deleteAccessWindow,
  getCourseSessions
} from "../../controllers/admin/accessWindows.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createAccessWindowSchema,
  updateAccessWindowSchema,
  enrollmentIdSchema,
  accessWindowIdSchema,
  courseSessionsSchema
} from "../../schemas/accessWindow.schemas.js";

const accessWindowsRouter = Router();

// GET /api/admin/enrollments/:enrollmentId/access-windows - Get access windows for enrollment
accessWindowsRouter.get('/enrollments/:enrollmentId/access-windows',
  validateParams(enrollmentIdSchema),
  getAccessWindows
);

// GET /api/admin/access-windows/:id - Get specific access window details
accessWindowsRouter.get('/access-windows/:id',
  validateParams(accessWindowIdSchema),
  getAccessWindow
);

// POST /api/admin/enrollments/:enrollmentId/access-windows - Create access window
accessWindowsRouter.post('/enrollments/:enrollmentId/access-windows',
  validateParams(enrollmentIdSchema),
  validateSchema(createAccessWindowSchema),
  createAccessWindow
);

// PUT /api/admin/access-windows/:id - Update access window
accessWindowsRouter.put('/access-windows/:id',
  validateParams(accessWindowIdSchema),
  validateSchema(updateAccessWindowSchema),
  updateAccessWindow
);

// DELETE /api/admin/access-windows/:id - Delete access window
accessWindowsRouter.delete('/access-windows/:id',
  validateParams(accessWindowIdSchema),
  deleteAccessWindow
);

// GET /api/admin/courses/:courseId/sessions - Get sessions for course (for UI dropdowns)
accessWindowsRouter.get('/courses/:courseId/sessions',
  validateParams(courseSessionsSchema),
  getCourseSessions
);

export default accessWindowsRouter;