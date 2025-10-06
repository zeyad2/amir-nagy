/**
 * Admin Homework Controller
 * Handles CRUD operations for homework with nested structure management
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";
import { validateHomeworkStructure } from "../../utils/validation.utils.js";

/**
 * Get all homework with usage information
 * GET /api/admin/homework
 */
export const getHomework = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const where = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Build order clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [homework, totalCount] = await Promise.all([
      Prisma.homework.findMany({
        where,
        select: {
          id: true,
          title: true,
          instructions: true,
          createdAt: true,
          _count: {
            select: {
              passages: true,
              courseHomeworks: true,
              submissions: true
            }
          },
          courseHomeworks: {
            select: {
              course: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy,
        take: parseInt(limit),
        skip: offset
      }),
      Prisma.homework.count({ where })
    ]);

    // Transform to include usage information and handle BigInt serialization
    const homeworkWithUsage = homework.map(hw => ({
      id: hw.id.toString(),
      title: hw.title,
      instructions: hw.instructions,
      createdAt: hw.createdAt,
      passageCount: hw._count.passages,
      usageCount: hw._count.courseHomeworks,
      submissionCount: hw._count.submissions,
      usedInCourses: hw.courseHomeworks.map(ch => ({
        id: ch.course.id.toString(),
        title: ch.course.title,
        status: ch.course.status
      })),
      canDelete: true // Cascade deletes handle all related records
    }));

    return createResponse(res, 200, 'Homework fetched successfully', {
      homework: homeworkWithUsage,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching homework:', error);
    return createErrorResponse(res, 500, 'Failed to fetch homework');
  }
};

/**
 * Get a single homework with complete structure
 * GET /api/admin/homework/:id
 */
export const getHomeworkById = async (req, res) => {
  try {
    const { id } = req.params;

    const homework = await Prisma.homework.findUnique({
      where: { id: BigInt(id) },
      include: {
        passages: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                choices: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        },
        courseHomeworks: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });

    if (!homework) {
      return createErrorResponse(res, 404, 'Homework not found');
    }

    // Transform the homework data and handle BigInt serialization
    const homeworkData = {
      id: homework.id.toString(),
      title: homework.title,
      instructions: homework.instructions,
      createdAt: homework.createdAt,
      passages: homework.passages.map(passage => ({
        id: passage.id.toString(),
        title: passage.title,
        content: passage.content,
        imageURL: passage.imageURL,
        order: passage.order,
        questions: passage.questions.map(question => ({
          id: question.id.toString(),
          questionText: question.questionText,
          order: question.order,
          choices: question.choices.map(choice => ({
            id: choice.id.toString(),
            choiceText: choice.choiceText,
            isCorrect: choice.isCorrect,
            order: choice.order
          }))
        }))
      })),
      usageCount: homework.courseHomeworks.length,
      submissionCount: homework._count.submissions,
      usedInCourses: homework.courseHomeworks.map(ch => ({
        id: ch.course.id.toString(),
        title: ch.course.title,
        status: ch.course.status
      })),
      canDelete: true // Cascade deletes handle all related records
    };

    return createResponse(res, 200, 'Homework fetched successfully', { homework: homeworkData });
  } catch (error) {
    console.error('Error fetching homework:', error);
    return createErrorResponse(res, 500, 'Failed to fetch homework');
  }
};

/**
 * Create homework with nested structure using transaction
 * POST /api/admin/homework
 */
export const createHomework = async (req, res) => {
  try {
    const homeworkData = req.body;

    // Validate homework structure business rules
    const validation = validateHomeworkStructure(homeworkData);
    if (!validation.isValid) {
      return createErrorResponse(res, 400, 'Homework structure validation failed', validation.errors);
    }

    const homework = await Prisma.$transaction(async (tx) => {
      // 1. Create the main homework
      const newHomework = await tx.homework.create({
        data: {
          title: homeworkData.title,
          instructions: homeworkData.instructions || ''
        }
      });

      // 2. Create passages with questions and choices
      for (const [passageIndex, passageData] of homeworkData.passages.entries()) {
        const passage = await tx.homeworkPassage.create({
          data: {
            homeworkId: newHomework.id,
            title: passageData.title || '',
            content: passageData.content,
            imageURL: passageData.imageURL || null,
            order: passageData.order || passageIndex + 1
          }
        });

        // 3. Create questions for this passage
        for (const [questionIndex, questionData] of passageData.questions.entries()) {
          const question = await tx.homeworkQuestion.create({
            data: {
              passageId: passage.id,
              questionText: questionData.questionText,
              order: questionData.order || questionIndex + 1
            }
          });

          // 4. Create choices for this question
          for (const [choiceIndex, choiceData] of questionData.choices.entries()) {
            await tx.questionChoice.create({
              data: {
                questionId: question.id,
                choiceText: choiceData.choiceText,
                isCorrect: choiceData.isCorrect,
                order: choiceData.order || choiceIndex + 1
              }
            });
          }
        }
      }

      // Return homework with BigInt converted to string
      return {
        id: newHomework.id.toString(),
        title: newHomework.title,
        instructions: newHomework.instructions,
        createdAt: newHomework.createdAt
      };
    }, {
      maxWait: 15000, // 15 seconds
      timeout: 20000  // 20 seconds
    });

    return createResponse(res, 201, 'Homework created successfully', { homework });
  } catch (error) {
    console.error('Error creating homework:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A homework with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to create homework');
  }
};

/**
 * Update homework with nested structure
 * PUT /api/admin/homework/:id
 */
export const updateHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate homework structure if passages are being updated
    if (updateData.passages) {
      const validation = validateHomeworkStructure(updateData);
      if (!validation.isValid) {
        return createErrorResponse(res, 400, 'Homework structure validation failed', validation.errors);
      }
    }

    // Check if homework exists
    const existingHomework = await Prisma.homework.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingHomework) {
      return createErrorResponse(res, 404, 'Homework not found');
    }

    const homework = await Prisma.$transaction(async (tx) => {
      // 1. Update homework metadata
      const updatedHomework = await tx.homework.update({
        where: { id: BigInt(id) },
        data: {
          title: updateData.title,
          instructions: updateData.instructions
        }
      });

      // 2. If passages are being updated, replace the entire structure
      if (updateData.passages) {
        // Delete existing passages (cascade will handle questions and choices)
        await tx.homeworkPassage.deleteMany({
          where: { homeworkId: BigInt(id) }
        });

        // Create new passages with questions and choices
        for (const [passageIndex, passageData] of updateData.passages.entries()) {
          const passage = await tx.homeworkPassage.create({
            data: {
              homeworkId: BigInt(id),
              title: passageData.title || '',
              content: passageData.content,
              imageURL: passageData.imageURL || null,
              order: passageData.order || passageIndex + 1
            }
          });

          for (const [questionIndex, questionData] of passageData.questions.entries()) {
            const question = await tx.homeworkQuestion.create({
              data: {
                passageId: passage.id,
                questionText: questionData.questionText,
                order: questionData.order || questionIndex + 1
              }
            });

            for (const [choiceIndex, choiceData] of questionData.choices.entries()) {
              await tx.questionChoice.create({
                data: {
                  questionId: question.id,
                  choiceText: choiceData.choiceText,
                  isCorrect: choiceData.isCorrect,
                  order: choiceData.order || choiceIndex + 1
                }
              });
            }
          }
        }
      }

      // Return homework with BigInt converted to string
      return {
        id: updatedHomework.id.toString(),
        title: updatedHomework.title,
        instructions: updatedHomework.instructions,
        createdAt: updatedHomework.createdAt
      };
    });

    return createResponse(res, 200, 'Homework updated successfully', { homework });
  } catch (error) {
    console.error('Error updating homework:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A homework with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to update homework');
  }
};

/**
 * Delete homework (cascade deletes all related data)
 * DELETE /api/admin/homework/:id
 * Note: Cascade deletes will remove all related passages, questions, choices,
 * course associations (CourseHomework), and student submissions
 */
export const deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if homework exists
    const homework = await Prisma.homework.findUnique({
      where: { id: BigInt(id) }
    });

    if (!homework) {
      return createErrorResponse(res, 404, 'Homework not found');
    }

    // Delete homework (cascade will handle all related data via Prisma schema)
    await Prisma.homework.delete({
      where: { id: BigInt(id) }
    });

    return createResponse(res, 200, 'Homework deleted successfully');
  } catch (error) {
    console.error('Error deleting homework:', error);
    return createErrorResponse(res, 500, 'Failed to delete homework');
  }
};