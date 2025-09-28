/**
 * Enrollment validation schemas
 */
import Joi from "joi";

export const createEnrollmentSchema = Joi.object({
  studentId: Joi.string().required(),
  courseId: Joi.string().required(),
  status: Joi.string().valid('active', 'suspended', 'completed').default('active')
});

export const updateEnrollmentSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended', 'completed').required()
});

export const enrollmentIdSchema = Joi.object({
  id: Joi.string().required()
});