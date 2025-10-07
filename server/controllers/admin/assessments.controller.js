/**
 * Admin Assessments Controller
 * Handles CRUD operations for assessments (tests/homework) with nested structure
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Get all assessments with usage information
 * GET /api/admin/assessments
 */
export const getAssessments = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      type = 'all'
    } = req.query;

    // Ensure positive values even if validation is bypassed
    const safePage = Math.max(1, parseInt(page));
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit)));
    const offset = (safePage - 1) * safeLimit;

    // Build where clause for search and filtering
    const where = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Filter by type (timed = has duration, untimed = no duration)
    if (type === 'timed') {
      where.duration = { not: null };
    } else if (type === 'untimed') {
      where.duration = null;
    }

    // Build order clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [assessments, totalCount] = await Promise.all([
      Prisma.test.findMany({
        where,
        select: {
          id: true,
          title: true,
          instructions: true,
          duration: true,
          createdAt: true,
          _count: {
            select: {
              passages: true,
              courseTests: true
            }
          },
          courseTests: {
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
        take: safeLimit,
        skip: offset
      }),
      Prisma.test.count({ where })
    ]);

    // Transform to include usage information and handle BigInt serialization
    const assessmentsWithUsage = assessments.map(assessment => ({
      id: assessment.id.toString(),
      title: assessment.title,
      instructions: assessment.instructions,
      duration: assessment.duration,
      type: assessment.duration ? 'timed' : 'untimed',
      createdAt: assessment.createdAt,
      passageCount: assessment._count.passages,
      usageCount: assessment._count.courseTests,
      submissionCount: assessment._count.submissions,
      usedInCourses: assessment.courseTests.map(ct => ({
        id: ct.course.id.toString(),
        title: ct.course.title,
        status: ct.course.status
      })),
      canDelete: assessment._count.courseTests === 0 && assessment._count.submissions === 0
    }));

    return createResponse(res, 200, 'Assessments fetched successfully', {
      assessments: assessmentsWithUsage,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: totalCount,
        pages: Math.ceil(totalCount / safeLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return createErrorResponse(res, 500, 'Failed to fetch assessments');
  }
};

/**
 * Get a single assessment with complete structure
 * GET /api/admin/assessments/:id
 */
export const getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Prisma.test.findUnique({
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
        _count: {
          select: {
            courseTests: true
          }
        },
        courseTests: {
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
      }
    });

    if (!assessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    // Transform and serialize BigInt values
    const assessmentData = {
      id: assessment.id.toString(),
      title: assessment.title,
      instructions: assessment.instructions,
      duration: assessment.duration,
      type: assessment.duration ? 'timed' : 'untimed',
      createdAt: assessment.createdAt,
      passages: assessment.passages.map(passage => ({
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
      usageCount: assessment._count.courseTests,
      submissionCount: assessment._count.submissions,
      usedInCourses: assessment.courseTests.map(ct => ({
        id: ct.course.id.toString(),
        title: ct.course.title,
        status: ct.course.status
      })),
      canDelete: assessment._count.courseTests === 0 && assessment._count.submissions === 0
    };

    return createResponse(res, 200, 'Assessment fetched successfully', assessmentData);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return createErrorResponse(res, 500, 'Failed to fetch assessment');
  }
};

/**
 * Create a new assessment with nested structure
 * POST /api/admin/assessments
 */
export const createAssessment = async (req, res) => {
  try {
    const { title, instructions, duration, passages } = req.body;

    // Validate that at least one passage has at least one question
    const totalQuestions = passages.reduce((sum, p) => sum + p.questions.length, 0);
    if (totalQuestions === 0) {
      return createErrorResponse(res, 400, 'Assessment must have at least one question');
    }

    // Create assessment with nested structure
    const assessment = await Prisma.test.create({
      data: {
        title,
        instructions: instructions || null,
        duration: duration || null,
        passages: {
          create: passages.map((passage, pIndex) => ({
            title: passage.title || null,
            content: passage.content,
            imageURL: passage.imageURL || null,
            order: passage.order !== undefined ? passage.order : pIndex,
            questions: {
              create: passage.questions.map((question, qIndex) => ({
                questionText: question.questionText,
                order: question.order !== undefined ? question.order : qIndex,
                choices: {
                  create: question.choices.map((choice, cIndex) => ({
                    choiceText: choice.choiceText,
                    isCorrect: choice.isCorrect,
                    order: choice.order !== undefined ? choice.order : cIndex
                  }))
                }
              }))
            }
          }))
        }
      },
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
        }
      }
    });

    // Transform response
    const assessmentData = {
      id: assessment.id.toString(),
      title: assessment.title,
      instructions: assessment.instructions,
      duration: assessment.duration,
      type: assessment.duration ? 'timed' : 'untimed',
      createdAt: assessment.createdAt,
      passages: assessment.passages.map(passage => ({
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
      }))
    };

    return createResponse(res, 201, 'Assessment created successfully', assessmentData);
  } catch (error) {
    console.error('Error creating assessment:', error);
    return createErrorResponse(res, 500, 'Failed to create assessment');
  }
};

/**
 * Update an existing assessment
 * PUT /api/admin/assessments/:id
 */
export const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, instructions, duration, passages } = req.body;

    // Check if assessment exists
    const existingAssessment = await Prisma.test.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: {
            courseTests: true
          }
        }
      }
    });

    if (!existingAssessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    // Note: Allow updates even if there are submissions
    // In the future, you may want to version tests instead

    // Use transaction to ensure atomicity
    const updatedAssessment = await Prisma.$transaction(async (prisma) => {
      // Only delete passages if new ones are being provided
      if (passages && passages.length > 0) {
        await prisma.testPassage.deleteMany({
          where: { testId: BigInt(id) }
        });
      }

      // Update assessment with new nested structure
      return await prisma.test.update({
        where: { id: BigInt(id) },
        data: {
          title: title || existingAssessment.title,
          instructions: instructions !== undefined ? instructions : existingAssessment.instructions,
          duration: duration !== undefined ? duration : existingAssessment.duration,
          passages: passages && passages.length > 0 ? {
            create: passages.map((passage, pIndex) => ({
              title: passage.title || null,
              content: passage.content,
              imageURL: passage.imageURL || null,
              order: passage.order !== undefined ? passage.order : pIndex,
              questions: {
                create: passage.questions.map((question, qIndex) => ({
                  questionText: question.questionText,
                  order: question.order !== undefined ? question.order : qIndex,
                  choices: {
                    create: question.choices.map((choice, cIndex) => ({
                      choiceText: choice.choiceText,
                      isCorrect: choice.isCorrect,
                      order: choice.order !== undefined ? choice.order : cIndex
                    }))
                  }
                }))
              }
            }))
          } : undefined
        },
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
          }
        }
      });
    });

    // Transform response
    const assessmentData = {
      id: updatedAssessment.id.toString(),
      title: updatedAssessment.title,
      instructions: updatedAssessment.instructions,
      duration: updatedAssessment.duration,
      type: updatedAssessment.duration ? 'timed' : 'untimed',
      createdAt: updatedAssessment.createdAt,
      passages: updatedAssessment.passages.map(passage => ({
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
      }))
    };

    return createResponse(res, 200, 'Assessment updated successfully', assessmentData);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return createErrorResponse(res, 500, 'Failed to update assessment');
  }
};

/**
 * Delete an assessment
 * DELETE /api/admin/assessments/:id
 */
export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assessment exists and is used
    const assessment = await Prisma.test.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: {
            courseTests: true,
            submissions: true
          }
        }
      }
    });

    if (!assessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    // Prevent deletion if used in courses or has submissions
    if (assessment._count.courseTests > 0) {
      return createErrorResponse(
        res,
        400,
        `Cannot delete assessment. It is assigned to ${assessment._count.courseTests} course(s).`
      );
    }

    if (assessment._count.submissions > 0) {
      return createErrorResponse(
        res,
        400,
        `Cannot delete assessment. It has ${assessment._count.submissions} submission(s).`
      );
    }

    // Delete the assessment (cascade will delete passages, questions, and choices)
    await Prisma.test.delete({
      where: { id: BigInt(id) }
    });

    return createResponse(res, 200, 'Assessment deleted successfully', {
      id: id,
      title: assessment.title
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return createErrorResponse(res, 500, 'Failed to delete assessment');
  }
};

/**
 * Get all submissions for an assessment
 * GET /api/admin/assessments/:id/submissions
 */
export const getAssessmentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify assessment exists
    const assessment = await Prisma.test.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, title: true }
    });

    if (!assessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    const submissions = await Prisma.testSubmission.findMany({
      where: { testId: BigInt(id) },
      include: {
        student: {
          select: {
            uuid: true,
            firstName: true,
            middleName: true,
            lastName: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const submissionsData = submissions.map(sub => ({
      id: sub.id.toString(),
      studentId: sub.studentId.toString(),
      studentName: `${sub.student.firstName} ${sub.student.middleName} ${sub.student.lastName}`,
      score: sub.score,
      submittedAt: sub.submittedAt
    }));

    return createResponse(res, 200, 'Assessment submissions fetched successfully', {
      assessment: {
        id: assessment.id.toString(),
        title: assessment.title
      },
      submissions: submissionsData,
      totalSubmissions: submissionsData.length
    });
  } catch (error) {
    console.error('Error fetching assessment submissions:', error);
    return createErrorResponse(res, 500, 'Failed to fetch assessment submissions');
  }
};