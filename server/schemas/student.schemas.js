/**
 * Joi validation schemas for student management endpoints
 */
import Joi from "joi";

export const studentIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Student ID must be a valid number',
    'any.required': 'Student ID is required'
  })
});

export const studentQuerySchema = Joi.object({
  search: Joi.string().max(255).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  sortBy: Joi.string().valid('firstName', 'lastName', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const enrollmentRequestIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Enrollment request ID must be a valid number',
    'any.required': 'Enrollment request ID is required'
  })
});

export const approveEnrollmentSchema = Joi.object({
  accessWindow: Joi.object({
    type: Joi.string().valid('full', 'partial', 'late').required(),
    startSessionId: Joi.string().pattern(/^\d+$/).when('type', {
      is: Joi.valid('partial', 'late'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    endSessionId: Joi.string().pattern(/^\d+$/).when('type', {
      is: 'partial',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }).optional().allow(null)
});

export const bulkEnrollmentSchema = Joi.object({
  requestIds: Joi.array().items(
    Joi.string().pattern(/^\d+$/).required()
  ).min(1).required().messages({
    'array.min': 'At least one request ID is required',
    'any.required': 'Request IDs array is required'
  }),
  accessWindows: Joi.object().pattern(
    Joi.string().pattern(/^\d+$/),
    Joi.object({
      type: Joi.string().valid('full', 'partial', 'late').required(),
      startSessionId: Joi.string().pattern(/^\d+$/).when('type', {
        is: Joi.valid('partial', 'late'),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      endSessionId: Joi.string().pattern(/^\d+$/).when('type', {
        is: 'partial',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  ).optional().default({})
});