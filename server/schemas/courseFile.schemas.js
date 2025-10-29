/**
 * Joi validation schemas for course file endpoints
 */
import Joi from "joi";

export const createCourseFileSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'File title is required',
    'string.min': 'File title must be at least 3 characters',
    'string.max': 'File title cannot exceed 255 characters',
    'any.required': 'File title is required'
  }),
  description: Joi.string().max(1000).optional().allow('', null).messages({
    'string.max': 'Description cannot exceed 1000 characters'
  })
});

export const updateCourseFileSchema = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    'string.min': 'File title must be at least 3 characters',
    'string.max': 'File title cannot exceed 255 characters'
  }),
  description: Joi.string().max(1000).allow('', null).messages({
    'string.max': 'Description cannot exceed 1000 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const courseFileIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'File ID must be a valid number',
    'any.required': 'File ID is required'
  })
});

export const assignFilesSchema = Joi.object({
  fileIds: Joi.array().items(
    Joi.string().pattern(/^\d+$/).messages({
      'string.pattern.base': 'Each file ID must be a valid number'
    })
  ).min(1).required().messages({
    'array.min': 'At least one file must be selected',
    'any.required': 'File IDs are required'
  }),
  orders: Joi.object().pattern(
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().min(0)
  ).optional().messages({
    'object.pattern.match': 'Orders must be valid integers for each file ID'
  })
});

export const courseFileQuerySchema = Joi.object({
  search: Joi.string().max(255).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('title', 'createdAt', 'fileSize').default('title'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});
