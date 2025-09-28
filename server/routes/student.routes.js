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
import { validateSchema } from "../middlewares/validation.middleware.js";
import { createEnrollmentRequestSchema } from "../schemas/student.schemas.js";

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
  cancelEnrollmentRequest
);

export default studentRouter;