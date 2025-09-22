/**
 * Admin Tests Controller
 * Handles CRUD operations for tests with nested structure and timer management
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";
import { validateTestStructure } from "../../utils/validation.utils.js";

/**
 * Get all tests with usage information
 * GET /api/admin/tests
 */
export const getTests = async (req, res) => {
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

    const [tests, totalCount] = await Promise.all([
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
              courseTests: true,
              submissions: true
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
        take: parseInt(limit),
        skip: offset
      }),
      Prisma.test.count({ where })
    ]);

    // Transform to include usage information and handle BigInt serialization
    const testsWithUsage = tests.map(test => ({
      id: test.id.toString(),
      title: test.title,
      instructions: test.instructions,
      duration: test.duration,
      createdAt: test.createdAt,
      passageCount: test._count.passages,
      usageCount: test._count.courseTests,
      submissionCount: test._count.submissions,
      usedInCourses: test.courseTests.map(ct => ({
        id: ct.course.id.toString(),
        title: ct.course.title,
        status: ct.course.status
      })),
      canDelete: test._count.courseTests === 0 && test._count.submissions === 0
    }));

    return createResponse(res, 200, 'Tests fetched successfully', {
      tests: testsWithUsage,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return createErrorResponse(res, 500, 'Failed to fetch tests');
  }
};

/**
 * Get a single test with complete structure
 * GET /api/admin/tests/:id
 */
export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Prisma.test.findUnique({
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
        courseTests: {
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

    if (!test) {
      return createErrorResponse(res, 404, 'Test not found');
    }

    // Transform the test data and handle BigInt serialization
    const testData = {
      id: test.id.toString(),
      title: test.title,
      instructions: test.instructions,
      duration: test.duration,
      createdAt: test.createdAt,
      passages: test.passages.map(passage => ({
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
      usageCount: test.courseTests.length,
      submissionCount: test._count.submissions,
      usedInCourses: test.courseTests.map(ct => ({
        id: ct.course.id.toString(),
        title: ct.course.title,
        status: ct.course.status
      })),
      canDelete: test.courseTests.length === 0 && test._count.submissions === 0
    };

    return createResponse(res, 200, 'Test fetched successfully', { test: testData });
  } catch (error) {
    console.error('Error fetching test:', error);
    return createErrorResponse(res, 500, 'Failed to fetch test');
  }
};

/**
 * Create test with nested structure using transaction
 * POST /api/admin/tests
 */
export const createTest = async (req, res) => {
  try {
    const testData = req.body;

    // Validate test structure business rules
    const validation = validateTestStructure(testData);
    if (!validation.isValid) {
      return createErrorResponse(res, 400, 'Test structure validation failed', validation.errors);
    }

    const test = await Prisma.$transaction(async (tx) => {
      // 1. Create the main test
      const newTest = await tx.test.create({
        data: {
          title: testData.title,
          instructions: testData.instructions || '',
          duration: testData.duration
        }
      });

      // 2. Create passages with questions and choices
      for (const [passageIndex, passageData] of testData.passages.entries()) {
        const passage = await tx.testPassage.create({
          data: {
            testId: newTest.id,
            title: passageData.title || '',
            content: passageData.content,
            imageURL: passageData.imageURL || null,
            order: passageData.order || passageIndex + 1
          }
        });

        // 3. Create questions for this passage
        for (const [questionIndex, questionData] of passageData.questions.entries()) {
          const question = await tx.testQuestion.create({
            data: {
              passageId: passage.id,
              questionText: questionData.questionText,
              order: questionData.order || questionIndex + 1
            }
          });

          // 4. Create choices for this question
          for (const [choiceIndex, choiceData] of questionData.choices.entries()) {
            await tx.testQuestionChoice.create({
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

      // Return test with BigInt converted to string
      return {
        id: newTest.id.toString(),
        title: newTest.title,
        instructions: newTest.instructions,
        duration: newTest.duration,
        createdAt: newTest.createdAt
      };
    }, {
      maxWait: 15000, // 15 seconds
      timeout: 20000  // 20 seconds
    });

    return createResponse(res, 201, 'Test created successfully', { test });
  } catch (error) {
    console.error('Error creating test:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A test with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to create test');
  }
};

/**
 * Update test with nested structure
 * PUT /api/admin/tests/:id
 */
export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate test structure if passages are being updated
    if (updateData.passages) {
      const validation = validateTestStructure(updateData);
      if (!validation.isValid) {
        return createErrorResponse(res, 400, 'Test structure validation failed', validation.errors);
      }
    }

    // Check if test exists
    const existingTest = await Prisma.test.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingTest) {
      return createErrorResponse(res, 404, 'Test not found');
    }

    const test = await Prisma.$transaction(async (tx) => {
      // 1. Update test metadata
      const updatedTest = await tx.test.update({
        where: { id: BigInt(id) },
        data: {
          title: updateData.title,
          instructions: updateData.instructions,
          duration: updateData.duration
        }
      });

      // 2. If passages are being updated, replace the entire structure
      if (updateData.passages) {
        // Delete existing passages (cascade will handle questions and choices)
        await tx.testPassage.deleteMany({
          where: { testId: BigInt(id) }
        });

        // Create new passages with questions and choices
        for (const [passageIndex, passageData] of updateData.passages.entries()) {
          const passage = await tx.testPassage.create({
            data: {
              testId: BigInt(id),
              title: passageData.title || '',
              content: passageData.content,
              imageURL: passageData.imageURL || null,
              order: passageData.order || passageIndex + 1
            }
          });

          for (const [questionIndex, questionData] of passageData.questions.entries()) {
            const question = await tx.testQuestion.create({
              data: {
                passageId: passage.id,
                questionText: questionData.questionText,
                order: questionData.order || questionIndex + 1
              }
            });

            for (const [choiceIndex, choiceData] of questionData.choices.entries()) {
              await tx.testQuestionChoice.create({
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

      // Return test with BigInt converted to string
      return {
        id: updatedTest.id.toString(),
        title: updatedTest.title,
        instructions: updatedTest.instructions,
        duration: updatedTest.duration,
        createdAt: updatedTest.createdAt
      };
    });

    return createResponse(res, 200, 'Test updated successfully', { test });
  } catch (error) {
    console.error('Error updating test:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A test with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to update test');
  }
};

/**
 * Delete test (with usage and submission check)
 * DELETE /api/admin/tests/:id
 */
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if test exists and get usage information
    const test = await Prisma.test.findUnique({
      where: { id: BigInt(id) },
      include: {
        courseTests: {
          include: {
            course: {
              select: { id: true, title: true }
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

    if (!test) {
      return createErrorResponse(res, 404, 'Test not found');
    }

    // Check if test is used in any courses
    if (test.courseTests.length > 0) {
      const courseNames = test.courseTests.map(ct => ct.course.title).join(', ');
      return createErrorResponse(res, 400,
        `Cannot delete test. It is currently used in the following course(s): ${courseNames}`
      );
    }

    // Check if test has submissions
    if (test._count.submissions > 0) {
      return createErrorResponse(res, 400,
        `Cannot delete test. It has ${test._count.submissions} student submission(s)`
      );
    }

    // Safe to delete (cascade will handle nested data)
    await Prisma.test.delete({
      where: { id: BigInt(id) }
    });

    return createResponse(res, 200, 'Test deleted successfully');
  } catch (error) {
    console.error('Error deleting test:', error);
    return createErrorResponse(res, 500, 'Failed to delete test');
  }
};

/**
 * Get active test attempts (for attempt locking)
 * GET /api/admin/tests/:id/attempts
 */
export const getTestAttempts = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if test exists
    const test = await Prisma.test.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, title: true, duration: true }
    });

    if (!test) {
      return createErrorResponse(res, 404, 'Test not found');
    }

    // Get test submissions to identify active attempts
    // Note: In a real implementation, you'd track active attempts in a separate table
    // For now, we'll show recent submissions as a proxy for active attempts
    const recentSubmissions = await Prisma.testSubmission.findMany({
      where: {
        testId: BigInt(id),
        submittedAt: {
          gte: new Date(Date.now() - test.duration * 60 * 1000) // Within test duration timeframe
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const attempts = recentSubmissions.map(submission => ({
      id: submission.id.toString(),
      studentId: submission.studentId.toString(),
      studentName: `${submission.student.firstName} ${submission.student.lastName}`,
      studentEmail: submission.student.user.email,
      submittedAt: submission.submittedAt,
      score: submission.score
    }));

    return createResponse(res, 200, 'Test attempts fetched successfully', {
      test: {
        id: test.id.toString(),
        title: test.title,
        duration: test.duration
      },
      attempts,
      attemptCount: attempts.length
    });
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    return createErrorResponse(res, 500, 'Failed to fetch test attempts');
  }
};