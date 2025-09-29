/**
 * Enrollment validation schemas
 */
import Joi from "joi";

export const createEnrollmentSchema = Joi.object({
  studentId: Joi.string().pattern(/^\d+$/).message("studentId must be a numeric string").required(),
  courseId: Joi.string().pattern(/^\d+$/).message("courseId must be a numeric string").required(),
  status: Joi.string().valid('active', 'suspended', 'completed').default('active')
});

export const updateEnrollmentSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended', 'completed').required()
});

export const enrollmentIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).message("id must be a numeric string").required()
});