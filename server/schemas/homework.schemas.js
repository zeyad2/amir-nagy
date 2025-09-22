/**
 * Joi validation schemas for homework endpoints
 */
import Joi from "joi";

const choiceSchema = Joi.object({
  choiceText: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'Choice text is required',
    'string.min': 'Choice text cannot be empty',
    'string.max': 'Choice text cannot exceed 500 characters',
    'any.required': 'Choice text is required'
  }),
  isCorrect: Joi.boolean().required().messages({
    'any.required': 'isCorrect field is required for each choice'
  }),
  order: Joi.number().integer().min(1).max(4).optional()
});

const questionSchema = Joi.object({
  questionText: Joi.string().min(5).max(1000).required().messages({
    'string.empty': 'Question text is required',
    'string.min': 'Question text must be at least 5 characters',
    'string.max': 'Question text cannot exceed 1000 characters',
    'any.required': 'Question text is required'
  }),
  choices: Joi.array().items(choiceSchema).length(4).required()
    .custom((choices, helpers) => {
      const correctCount = choices.filter(c => c.isCorrect).length;
      if (correctCount !== 1) {
        return helpers.error('custom.exactlyOneCorrect');
      }
      return choices;
    }).messages({
      'array.length': 'Each question must have exactly 4 choices',
      'any.required': 'Choices are required for each question',
      'custom.exactlyOneCorrect': 'Exactly one choice must be marked as correct'
    }),
  order: Joi.number().integer().min(1).optional()
});

const passageSchema = Joi.object({
  title: Joi.string().max(255).optional().allow(''),
  content: Joi.string().min(10).required().messages({
    'string.empty': 'Passage content is required',
    'string.min': 'Passage content must be at least 10 characters',
    'any.required': 'Passage content is required'
  }),
  imageURL: Joi.string().uri().optional().allow(''),
  questions: Joi.array().items(questionSchema).min(1).required().messages({
    'array.min': 'Each passage must have at least one question',
    'any.required': 'Questions are required for each passage'
  }),
  order: Joi.number().integer().min(1).optional()
});

export const createHomeworkSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Homework title is required',
    'string.min': 'Homework title must be at least 3 characters',
    'string.max': 'Homework title cannot exceed 255 characters',
    'any.required': 'Homework title is required'
  }),
  instructions: Joi.string().max(2000).optional().allow(''),
  passages: Joi.array().items(passageSchema).min(1).required().messages({
    'array.min': 'Homework must have at least one passage',
    'any.required': 'Passages are required'
  })
});

export const updateHomeworkSchema = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    'string.min': 'Homework title must be at least 3 characters',
    'string.max': 'Homework title cannot exceed 255 characters'
  }),
  instructions: Joi.string().max(2000).allow(''),
  passages: Joi.array().items(passageSchema).min(1).messages({
    'array.min': 'Homework must have at least one passage'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const homeworkIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'Homework ID must be a valid number',
    'any.required': 'Homework ID is required'
  })
});

export const homeworkQuerySchema = Joi.object({
  search: Joi.string().max(255).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('title', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});