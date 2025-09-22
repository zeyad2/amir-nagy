/**
 * Response utility functions for consistent API responses
 */

export const createResponse = (res, statusCode, message, data = null) => {
  const response = { message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

export const createErrorResponse = (res, statusCode, message, errors = null) => {
  const response = { error: message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

export const createValidationErrorResponse = (res, validationErrors) => {
  const errors = validationErrors.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message
  }));
  return createErrorResponse(res, 400, 'Validation failed', errors);
};