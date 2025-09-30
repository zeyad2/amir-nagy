/**
 * Student Assessments Routes
 * Handles student-facing assessment attempt and submission endpoints
 */
import { Router } from "express";
import {
  startAssessmentAttempt,
  getAssessmentAttemptStatus,
  submitAssessment,
  getAssessmentSubmission
} from "../../controllers/student/assessments.controller.js";
import { validateParams, validateSchema } from "../../middlewares/validation.middleware.js";
import {
  assessmentIdParamSchema,
  submitAssessmentSchema
} from "../../schemas/student.schemas.js";

const assessmentsRouter = Router();

// POST /api/student/assessments/:id/attempt - Start an assessment attempt
assessmentsRouter.post('/:id/attempt',
  validateParams(assessmentIdParamSchema),
  startAssessmentAttempt
);

// GET /api/student/assessments/:id/attempt - Get assessment attempt status
assessmentsRouter.get('/:id/attempt',
  validateParams(assessmentIdParamSchema),
  getAssessmentAttemptStatus
);

// POST /api/student/assessments/:id/submit - Submit assessment answers
assessmentsRouter.post('/:id/submit',
  validateParams(assessmentIdParamSchema),
  validateSchema(submitAssessmentSchema),
  submitAssessment
);

// GET /api/student/assessments/:id/submission - Get submission details with answers
assessmentsRouter.get('/:id/submission',
  validateParams(assessmentIdParamSchema),
  getAssessmentSubmission
);

export default assessmentsRouter;