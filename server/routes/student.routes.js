/**
 * Student Routes
 * Handles student-facing endpoints
 */
import { Router } from "express";
import { requireUser } from "../middlewares/requireUser.js";
import { requireStudent } from "../middlewares/requireStudent.js";
import {
  createEnrollmentRequest,
  getStudentEnrollmentRequests,
  cancelEnrollmentRequest
} from "../controllers/student/enrollment.controller.js";
import { validateSchema, validateParams } from "../middlewares/validation.middleware.js";
import {
  createEnrollmentRequestSchema,
  enrollmentRequestIdSchema
} from "../schemas/student.schemas.js";
import assessmentsRouter from "./student/assessments.routes.js";

const studentRouter = Router();

// Apply authentication middleware to all student routes
studentRouter.use(requireUser);
studentRouter.use(requireStudent);

// Enrollment request routes
studentRouter.post('/enrollment-requests',
  validateSchema(createEnrollmentRequestSchema),
  createEnrollmentRequest
);

studentRouter.get('/enrollment-requests',
  getStudentEnrollmentRequests
);

studentRouter.delete('/enrollment-requests/:id',
  validateParams(enrollmentRequestIdSchema),
  cancelEnrollmentRequest
);

// Assessment routes
studentRouter.use('/assessments', assessmentsRouter);

export default studentRouter;