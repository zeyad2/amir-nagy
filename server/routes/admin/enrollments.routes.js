/**
 * Admin Enrollments Routes
 * Handles routing for direct enrollment management endpoints
 */
import { Router } from "express";
import {
  createEnrollment,
  getEnrollments,
  getEnrollment,
  updateEnrollment,
  deleteEnrollment
} from "../../controllers/admin/enrollments.controller.js";
import { validateSchema, validateParams } from "../../middlewares/validation.middleware.js";
import {
  createEnrollmentSchema,
  updateEnrollmentSchema,
  enrollmentIdSchema
} from "../../schemas/enrollment.schemas.js";

const enrollmentsRouter = Router();

// POST /api/admin/enrollments - Create direct enrollment
enrollmentsRouter.post('/',
  validateSchema(createEnrollmentSchema),
  createEnrollment
);

// GET /api/admin/enrollments - Get all enrollments
enrollmentsRouter.get('/',
  getEnrollments
);

// GET /api/admin/enrollments/:id - Get specific enrollment
enrollmentsRouter.get('/:id',
  validateParams(enrollmentIdSchema),
  getEnrollment
);

// PUT /api/admin/enrollments/:id - Update enrollment
enrollmentsRouter.put('/:id',
  validateParams(enrollmentIdSchema),
  validateSchema(updateEnrollmentSchema),
  updateEnrollment
);

// DELETE /api/admin/enrollments/:id - Delete enrollment
enrollmentsRouter.delete('/:id',
  validateParams(enrollmentIdSchema),
  deleteEnrollment
);

export default enrollmentsRouter;