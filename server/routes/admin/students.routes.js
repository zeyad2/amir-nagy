/**
 * Admin Students Routes
 * Handles routing for student management endpoints
 */
import { Router } from "express";
import {
  getAllStudents,
  getStudentById
} from "../../controllers/admin/students.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  studentIdSchema,
  studentQuerySchema
} from "../../schemas/student.schemas.js";

const studentsRouter = Router();

// GET /api/admin/students - Get all students with filtering and pagination
studentsRouter.get('/',
  validateQuery(studentQuerySchema),
  getAllStudents
);

// GET /api/admin/students/:id - Get a specific student
studentsRouter.get('/:id',
  validateParams(studentIdSchema),
  getStudentById
);

// Note: Enrollment request routes are handled separately in enrollment-requests.routes.js

export default studentsRouter;