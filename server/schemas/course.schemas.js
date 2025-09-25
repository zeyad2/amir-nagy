/**
 * Joi validation schemas for course endpoints
 */
import Joi from "joi";

export const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Course title is required',
    'string.min': 'Course title must be at least 3 characters',
    'string.max': 'Course title cannot exceed 255 characters',
    'any.required': 'Course title is required'
  }),
  description: Joi.string().max(2000).optional().allow('').messages({
    'string.max': 'Course description cannot exceed 2000 characters'
  }),
  thumbnail: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Thumbnail must be a valid URL'
  }),
  type: Joi.string().valid('finished', 'live').required().messages({
    'any.only': 'Course type must be either "finished" or "live"',
    'any.required': 'Course type is required'
  }),
  price: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Price must be a number',
    'number.integer': 'Price must be an integer',
    'number.min': 'Price cannot be negative'
  }),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft').messages({
    'any.only': 'Course status must be "draft", "published", or "archived"'
  })
});

export const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    'string.min': 'Course title must be at least 3 characters',
    'string.max': 'Course title cannot exceed 255 characters'
  }),
  description: Joi.string().max(2000).allow('').messages({
    'string.max': 'Course description cannot exceed 2000 characters'
  }),
  thumbnail: Joi.string().uri().allow('').messages({
    'string.uri': 'Thumbnail must be a valid URL'
  }),
  type: Joi.string().valid('finished', 'live').messages({
    'any.only': 'Course type must be either "finished" or "live"'
  }),
  price: Joi.number().integer().min(0).messages({
    'number.base': 'Price must be a number',
    'number.integer': 'Price must be an integer',
    'number.min': 'Price cannot be negative'
  }),
  status: Joi.string().valid('draft', 'published', 'archived').messages({
    'any.only': 'Course status must be "draft", "published", or "archived"'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const courseIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Course ID must be a valid number',
    'any.required': 'Course ID is required'
  })
});

export const courseQuerySchema = Joi.object({
  search: Joi.string().max(255).optional(),
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
  type: Joi.string().valid('finished', 'live').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('title', 'createdAt', 'status', 'type', 'price').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const updateCourseStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'published', 'archived').required().messages({
    'any.only': 'Status must be "draft", "published", or "archived"',
    'any.required': 'Status is required'
  })
});