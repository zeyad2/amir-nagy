/**
 * Admin Lessons Routes
 * Handles routing for lesson management endpoints
 */
import { Router } from "express";
import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonCourses
} from "../../controllers/admin/lessons.controller.js";
import { validateSchema, validateParams, validateQuery } from "../../middlewares/validation.middleware.js";
import {
  createLessonSchema,
  updateLessonSchema,
  lessonIdSchema,
  lessonQuerySchema
} from "../../schemas/lesson.schemas.js";

const lessonsRouter = Router();

// GET /api/admin/lessons - Get all lessons with filtering and pagination
lessonsRouter.get('/',
  validateQuery(lessonQuerySchema),
  getLessons
);

// GET /api/admin/lessons/:id - Get a specific lesson
lessonsRouter.get('/:id',
  validateParams(lessonIdSchema),
  getLesson
);

// POST /api/admin/lessons - Create a new lesson
lessonsRouter.post('/',
  validateSchema(createLessonSchema),
  createLesson
);

// PUT /api/admin/lessons/:id - Update a lesson
lessonsRouter.put('/:id',
  validateParams(lessonIdSchema),
  validateSchema(updateLessonSchema),
  updateLesson
);

// DELETE /api/admin/lessons/:id - Delete a lesson
lessonsRouter.delete('/:id',
  validateParams(lessonIdSchema),
  deleteLesson
);

// GET /api/admin/lessons/:id/courses - Get courses using this lesson
lessonsRouter.get('/:id/courses',
  validateParams(lessonIdSchema),
  getLessonCourses
);

export default lessonsRouter;