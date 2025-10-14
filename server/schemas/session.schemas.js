/**
 * Joi validation schemas for session endpoints
 */
import Joi from "joi";

export const createSessionSchema = Joi.object({
  title: Joi.string().max(255).optional().allow(null, '').messages({
    'string.max': 'Session title cannot exceed 255 characters'
  }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Invalid date format',
    'any.required': 'Session date is required'
  })
});

export const updateSessionSchema = Joi.object({
  title: Joi.string().max(255).optional().allow(null, '').messages({
    'string.max': 'Session title cannot exceed 255 characters'
  }),
  date: Joi.date().iso().optional().messages({
    'date.base': 'Invalid date format'
  })
}).min(1).messages({
  'object.min': 'At least one field (title or date) must be provided for update'
});

export const courseIdParamSchema = Joi.object({
  courseId: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Course ID must be a valid number',
    'any.required': 'Course ID is required'
  })
});

export const sessionIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Session ID must be a valid number',
    'any.required': 'Session ID is required'
  })
});

export const getSessionsQuerySchema = Joi.object({
  sortBy: Joi.string().valid('date', 'title', 'id').default('date').messages({
    'any.only': 'sortBy must be one of: date, title, id'
  }),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc').messages({
    'any.only': 'sortOrder must be either asc or desc'
  })
});
