/**
 * Assessment Validation Schemas
 * Unified schemas for both homework and test assessments
 */
import Joi from "joi";

// Schema for creating/updating an assessment (test or homework)
export const createAssessmentSchema = Joi.object({
  title: Joi.string().min(3).max(255).required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),

  instructions: Joi.string().max(2000).allow(null, '')
    .messages({
      'string.max': 'Instructions cannot exceed 2000 characters'
    }),

  duration: Joi.number().integer().min(1).max(480).allow(null)
    .messages({
      'number.min': 'Duration must be at least 1 minute',
      'number.max': 'Duration cannot exceed 480 minutes (8 hours)',
      'number.integer': 'Duration must be a whole number'
    }),

  passages: Joi.array().min(1).required().items(
    Joi.object({
      title: Joi.string().max(255).allow(null, ''),
      content: Joi.string().required()
        .messages({
          'any.required': 'Passage content is required'
        }),
      imageURL: Joi.string().uri().allow(null, '')
        .messages({
          'string.uri': 'Image URL must be a valid URL'
        }),
      order: Joi.number().integer().min(0).allow(null),
      questions: Joi.array().min(1).required().items(
        Joi.object({
          questionText: Joi.string().required()
            .messages({
              'any.required': 'Question text is required'
            }),
          order: Joi.number().integer().min(0).allow(null),
          choices: Joi.array().length(4).required().items(
            Joi.object({
              choiceText: Joi.string().required()
                .messages({
                  'any.required': 'Choice text is required'
                }),
              isCorrect: Joi.boolean().required()
                .messages({
                  'any.required': 'isCorrect flag is required'
                }),
              order: Joi.number().integer().min(0).max(3).allow(null)
            })
          )
          .messages({
            'array.length': 'Each question must have exactly 4 choices',
            'any.required': 'Choices are required'
          })
          .custom((choices, helpers) => {
            const correctCount = choices.filter(c => c.isCorrect).length;
            if (correctCount !== 1) {
              return helpers.error('custom.oneCorrect');
            }
            return choices;
          })
          .messages({
            'custom.oneCorrect': 'Each question must have exactly one correct answer'
          })
        })
      )
      .messages({
        'array.min': 'Each passage must have at least one question',
        'any.required': 'Questions are required'
      })
    })
  )
  .messages({
    'array.min': 'Assessment must have at least one passage',
    'any.required': 'Passages are required'
  })
});

// Schema for updating an assessment
export const updateAssessmentSchema = Joi.object({
  title: Joi.string().min(3).max(255)
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 255 characters'
    }),

  instructions: Joi.string().max(2000).allow(null, '')
    .messages({
      'string.max': 'Instructions cannot exceed 2000 characters'
    }),

  duration: Joi.number().integer().min(1).max(480).allow(null)
    .messages({
      'number.min': 'Duration must be at least 1 minute',
      'number.max': 'Duration cannot exceed 480 minutes (8 hours)',
      'number.integer': 'Duration must be a whole number'
    }),

  passages: Joi.array().min(1).items(
    Joi.object({
      title: Joi.string().max(255).allow(null, ''),
      content: Joi.string().required(),
      imageURL: Joi.string().uri().allow(null, ''),
      order: Joi.number().integer().min(0).allow(null),
      questions: Joi.array().min(1).required().items(
        Joi.object({
          questionText: Joi.string().required(),
          order: Joi.number().integer().min(0).allow(null),
          choices: Joi.array().length(4).required().items(
            Joi.object({
              choiceText: Joi.string().required(),
              isCorrect: Joi.boolean().required(),
              order: Joi.number().integer().min(0).max(3).allow(null)
            })
          )
          .custom((choices, helpers) => {
            const correctCount = choices.filter(c => c.isCorrect).length;
            if (correctCount !== 1) {
              return helpers.error('custom.oneCorrect');
            }
            return choices;
          })
          .messages({
            'custom.oneCorrect': 'Each question must have exactly one correct answer'
          })
        })
      )
    })
  )
}).min(1);

// Schema for assessment ID parameter
export const assessmentIdSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).required()
    .messages({
      'string.pattern.base': 'Assessment ID must be a valid number',
      'any.required': 'Assessment ID is required'
    })
});

// Schema for assessment query parameters
export const assessmentQuerySchema = Joi.object({
  search: Joi.string().max(255).allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('createdAt', 'title', 'duration').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  type: Joi.string().valid('timed', 'untimed', 'all').default('all')
});