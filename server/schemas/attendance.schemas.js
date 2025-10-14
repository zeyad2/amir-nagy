/**
 * Joi validation schemas for attendance endpoints
 */
import Joi from "joi";

export const markAttendanceSchema = Joi.object({
  records: Joi.array()
    .items(
      Joi.object({
        studentId: Joi.string().pattern(/^\d+$/).required().messages({
          'string.pattern.base': 'Student ID must be a valid number',
          'any.required': 'Student ID is required'
        }),
        status: Joi.string().valid('present', 'absent').required().messages({
          'any.only': 'Status must be either present or absent',
          'any.required': 'Status is required'
        })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one attendance record is required',
      'any.required': 'Attendance records are required'
    })
});

export const sessionIdParamSchema = Joi.object({
  sessionId: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Session ID must be a valid number',
    'any.required': 'Session ID is required'
  })
});

export const courseIdParamSchema = Joi.object({
  courseId: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Course ID must be a valid number',
    'any.required': 'Course ID is required'
  })
});
