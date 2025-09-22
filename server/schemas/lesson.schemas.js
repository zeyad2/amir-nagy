/**
 * Joi validation schemas for lesson endpoints
 */
import Joi from "joi";

export const createLessonSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Lesson title is required',
    'string.min': 'Lesson title must be at least 3 characters',
    'string.max': 'Lesson title cannot exceed 255 characters',
    'any.required': 'Lesson title is required'
  }),
  videoLink: Joi.string().uri().pattern(/drive\.google\.com/).required().messages({
    'string.empty': 'Video link is required',
    'string.uri': 'Video link must be a valid URL',
    'string.pattern.base': 'Video link must be a valid Google Drive URL',
    'any.required': 'Video link is required'
  })
});

export const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    'string.min': 'Lesson title must be at least 3 characters',
    'string.max': 'Lesson title cannot exceed 255 characters'
  }),
  videoLink: Joi.string().uri().pattern(/drive\.google\.com/).messages({
    'string.uri': 'Video link must be a valid URL',
    'string.pattern.base': 'Video link must be a valid Google Drive URL'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const lessonIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Lesson ID must be a valid number',
    'any.required': 'Lesson ID is required'
  })
});

export const lessonQuerySchema = Joi.object({
  search: Joi.string().max(255).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('title', 'createdAt').default('title'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});