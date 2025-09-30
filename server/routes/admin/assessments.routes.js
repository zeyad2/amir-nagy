/**
 * Admin Assessments Routes
 * Handles routing for assessment (test/homework) management endpoints
 */
import { Router } from "express";
import {
  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentSubmissions
} from "../../controllers/admin/assessments.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentIdSchema,
  assessmentQuerySchema
} from "../../schemas/assessment.schemas.js";

const assessmentsRouter = Router();

// GET /api/admin/assessments - Get all assessments with filtering and pagination
assessmentsRouter.get('/',
  validateQuery(assessmentQuerySchema),
  getAssessments
);

// GET /api/admin/assessments/:id/submissions - Get all submissions for an assessment
// IMPORTANT: This must come BEFORE /:id to avoid route collision
assessmentsRouter.get('/:id/submissions',
  validateParams(assessmentIdSchema),
  getAssessmentSubmissions
);

// GET /api/admin/assessments/:id - Get a specific assessment with complete structure
assessmentsRouter.get('/:id',
  validateParams(assessmentIdSchema),
  getAssessmentById
);

// POST /api/admin/assessments - Create a new assessment with nested structure
assessmentsRouter.post('/',
  validateSchema(createAssessmentSchema),
  createAssessment
);

// PUT /api/admin/assessments/:id - Update an assessment
assessmentsRouter.put('/:id',
  validateParams(assessmentIdSchema),
  validateSchema(updateAssessmentSchema),
  updateAssessment
);

// DELETE /api/admin/assessments/:id - Delete an assessment
assessmentsRouter.delete('/:id',
  validateParams(assessmentIdSchema),
  deleteAssessment
);

export default assessmentsRouter;