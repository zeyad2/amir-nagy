/**
 * Admin Tests Routes
 * Handles routing for test management endpoints
 */
import { Router } from "express";
import {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getTestAttempts
} from "../../controllers/admin/tests.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createTestSchema,
  updateTestSchema,
  testIdSchema,
  testQuerySchema
} from "../../schemas/test.schemas.js";

const testsRouter = Router();

// GET /api/admin/tests - Get all tests with filtering and pagination
testsRouter.get('/',
  validateQuery(testQuerySchema),
  getTests
);

// GET /api/admin/tests/:id - Get a specific test with complete structure
testsRouter.get('/:id',
  validateParams(testIdSchema),
  getTestById
);

// POST /api/admin/tests - Create a new test with nested structure
testsRouter.post('/',
  validateSchema(createTestSchema),
  createTest
);

// PUT /api/admin/tests/:id - Update a test
testsRouter.put('/:id',
  validateParams(testIdSchema),
  validateSchema(updateTestSchema),
  updateTest
);

// DELETE /api/admin/tests/:id - Delete a test
testsRouter.delete('/:id',
  validateParams(testIdSchema),
  deleteTest
);

// GET /api/admin/tests/:id/attempts - Get active test attempts
testsRouter.get('/:id/attempts',
  validateParams(testIdSchema),
  getTestAttempts
);

export default testsRouter;