/**
 * Admin Homework Routes
 * Handles routing for homework management endpoints
 */
import { Router } from "express";
import {
  getHomework,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework
} from "../../controllers/admin/homework.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createHomeworkSchema,
  updateHomeworkSchema,
  homeworkIdSchema,
  homeworkQuerySchema
} from "../../schemas/homework.schemas.js";

const homeworkRouter = Router();

// GET /api/admin/homework - Get all homework with filtering and pagination
homeworkRouter.get('/',
  validateQuery(homeworkQuerySchema),
  getHomework
);

// GET /api/admin/homework/:id - Get a specific homework with complete structure
homeworkRouter.get('/:id',
  validateParams(homeworkIdSchema),
  getHomeworkById
);

// POST /api/admin/homework - Create a new homework with nested structure
homeworkRouter.post('/',
  validateSchema(createHomeworkSchema),
  createHomework
);

// PUT /api/admin/homework/:id - Update a homework
homeworkRouter.put('/:id',
  validateParams(homeworkIdSchema),
  validateSchema(updateHomeworkSchema),
  updateHomework
);

// DELETE /api/admin/homework/:id - Delete a homework
homeworkRouter.delete('/:id',
  validateParams(homeworkIdSchema),
  deleteHomework
);

export default homeworkRouter;