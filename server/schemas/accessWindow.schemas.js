/**
 * Joi validation schemas for access window endpoints
 */
import Joi from "joi";

export const createAccessWindowSchema = Joi.object({
  startSessionId: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Start session ID must be a valid number',
    'any.required': 'Start session ID is required'
  }),
  endSessionId: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'End session ID must be a valid number',
    'any.required': 'End session ID is required'
  })
});

export const updateAccessWindowSchema = Joi.object({
  startSessionId: Joi.string().pattern(/^\d+$/).messages({
    'string.pattern.base': 'Start session ID must be a valid number'
  }),
  endSessionId: Joi.string().pattern(/^\d+$/).messages({
    'string.pattern.base': 'End session ID must be a valid number'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const enrollmentIdSchema = Joi.object({
  enrollmentId: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Enrollment ID must be a valid number',
    'any.required': 'Enrollment ID is required'
  })
});

export const accessWindowIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Access window ID must be a valid number',
    'any.required': 'Access window ID is required'
  })
});

export const courseSessionsSchema = Joi.object({
  courseId: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Course ID must be a valid number',
    'any.required': 'Course ID is required'
  })
});