/**
 * Validation middleware for API requests
 */
import { createValidationErrorResponse } from '../utils/response.utils.js';

/**
 * Creates a middleware that validates request body against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
export const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return createValidationErrorResponse(res, error.details);
    }
    next();
  };
};

/**
 * Creates a middleware that validates query parameters against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      return createValidationErrorResponse(res, error.details);
    }
    next();
  };
};

/**
 * Creates a middleware that validates URL parameters against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return createValidationErrorResponse(res, error.details);
    }
    next();
  };
};