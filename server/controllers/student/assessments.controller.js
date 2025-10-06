/**
 * Student Assessments Controller
 * Handles assessment attempts, submissions, and answer grading for students
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";
import { calculateAssessmentScore } from "../../utils/grading.utils.js";

/**
 * Start or get an assessment attempt
 * POST /api/student/assessments/:id/attempt
 *
 * Returns the assessment structure without correct answer information
 */
export const startAssessmentAttempt = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const userId = req.user.uuid;

    // Get student record
    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student record not found');
    }

    // Check if student already has a submission for this assessment
    const existingSubmission = await Prisma.testSubmission.findUnique({
      where: {
        testId_studentId: {
          testId: BigInt(assessmentId),
          studentId: student.uuid
        }
      }
    });

    if (existingSubmission) {
      return createErrorResponse(
        res,
        400,
        'You have already submitted this assessment. Each assessment can only be attempted once.'
      );
    }

    // Get the assessment with all questions (but don't include correct answers)
    const assessment = await Prisma.test.findUnique({
      where: { id: BigInt(assessmentId) },
      include: {
        passages: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                choices: {
                  orderBy: { order: 'asc' },
                  select: {
                    id: true,
                    choiceText: true,
                    order: true
                    // Exclude isCorrect from student view
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    // Transform for student view (hide correct answers)
    const assessmentData = {
      id: assessment.id.toString(),
      title: assessment.title,
      instructions: assessment.instructions,
      duration: assessment.duration,
      type: assessment.duration ? 'timed' : 'untimed',
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
            order: choice.order
          }))
        }))
      })),
      totalQuestions: assessment.passages.reduce(
        (sum, p) => sum + p.questions.length,
        0
      )
    };

    return createResponse(res, 200, 'Assessment attempt started successfully', {
      assessment: assessmentData,
      startedAt: new Date().toISOString(),
      message: assessment.duration
        ? `You have ${assessment.duration} minutes to complete this assessment`
        : 'Take your time to complete this assessment'
    });
  } catch (error) {
    console.error('Error starting assessment attempt:', error);
    return createErrorResponse(res, 500, 'Failed to start assessment attempt');
  }
};

/**
 * Get current attempt status
 * GET /api/student/assessments/:id/attempt
 */
export const getAssessmentAttemptStatus = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const userId = req.user.uuid;

    // Get student record
    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student record not found');
    }

    // Check if submission exists
    const submission = await Prisma.testSubmission.findUnique({
      where: {
        testId_studentId: {
          testId: BigInt(assessmentId),
          studentId: student.uuid
        }
      }
    });

    if (submission) {
      return createResponse(res, 200, 'Assessment already submitted', {
        status: 'submitted',
        submittedAt: submission.submittedAt,
        score: submission.score,
        submissionId: submission.id.toString()
      });
    }

    // Get assessment basic info
    const assessment = await Prisma.test.findUnique({
      where: { id: BigInt(assessmentId) },
      select: {
        id: true,
        title: true,
        duration: true
      }
    });

    if (!assessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    return createResponse(res, 200, 'Assessment not yet attempted', {
      status: 'not_started',
      assessment: {
        id: assessment.id.toString(),
        title: assessment.title,
        duration: assessment.duration
      }
    });
  } catch (error) {
    console.error('Error getting assessment attempt status:', error);
    return createErrorResponse(res, 500, 'Failed to get assessment attempt status');
  }
};

/**
 * Submit assessment answers
 * POST /api/student/assessments/:id/submit
 *
 * Request body: { answers: [{ questionId: string, choiceId: string }] }
 */
export const submitAssessment = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const { answers } = req.body;
    const userId = req.user.uuid;

    // Validate answers array
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return createErrorResponse(res, 400, 'Answers array is required and must not be empty');
    }

    // Get student record
    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student record not found');
    }

    // Check if already submitted
    const existingSubmission = await Prisma.testSubmission.findUnique({
      where: {
        testId_studentId: {
          testId: BigInt(assessmentId),
          studentId: student.uuid
        }
      }
    });

    if (existingSubmission) {
      return createErrorResponse(
        res,
        400,
        'Assessment already submitted. Each assessment can only be attempted once.'
      );
    }

    // Get assessment with all questions and correct answers
    const assessment = await Prisma.test.findUnique({
      where: { id: BigInt(assessmentId) },
      include: {
        passages: {
          include: {
            questions: {
              include: {
                choices: true
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    // Calculate score and prepare answer records
    const { score, totalQuestions, answerRecords } = calculateAssessmentScore(
      assessment,
      answers
    );

    // Create submission with answers in a transaction
    const submission = await Prisma.$transaction(async (prisma) => {
      // Create the submission
      const newSubmission = await prisma.testSubmission.create({
        data: {
          testId: BigInt(assessmentId),
          studentId: student.uuid,
          score
        }
      });

      // Create all answer records
      await prisma.testAnswer.createMany({
        data: answerRecords.map(answer => ({
          submissionId: newSubmission.id,
          questionId: BigInt(answer.questionId),
          choiceId: answer.choiceId ? BigInt(answer.choiceId) : null,
          isCorrect: answer.isCorrect
        }))
      });

      return newSubmission;
    });

    return createResponse(res, 201, 'Assessment submitted successfully', {
      submissionId: submission.id.toString(),
      score,
      totalQuestions,
      percentage: ((score / totalQuestions) * 100).toFixed(2),
      submittedAt: submission.submittedAt,
      message: `You scored ${score} out of ${totalQuestions} (${((score / totalQuestions) * 100).toFixed(2)}%)`
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return createErrorResponse(res, 500, 'Failed to submit assessment');
  }
};

/**
 * Get assessment submission with detailed answers
 * GET /api/student/assessments/:id/submission
 */
export const getAssessmentSubmission = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const userId = req.user.uuid;

    // Get student record
    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student record not found');
    }

    // Get submission with answers
    const submission = await Prisma.testSubmission.findUnique({
      where: {
        testId_studentId: {
          testId: BigInt(assessmentId),
          studentId: student.uuid
        }
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            duration: true
          }
        },
        answers: {
          include: {
            question: {
              include: {
                choices: true,
                passage: {
                  select: {
                    id: true,
                    title: true,
                    content: true,
                    imageURL: true,
                    order: true
                  }
                }
              }
            },
            choice: true
          }
        }
      }
    });

    if (!submission) {
      return createErrorResponse(res, 404, 'Submission not found. You have not submitted this assessment yet.');
    }

    // Transform submission data for detailed review
    const submissionData = {
      id: submission.id.toString(),
      assessmentId: submission.testId.toString(),
      assessmentTitle: submission.test.title,
      score: submission.score,
      totalQuestions: submission.answers.length,
      percentage: ((submission.score / submission.answers.length) * 100).toFixed(2),
      submittedAt: submission.submittedAt,
      answers: submission.answers.map(answer => ({
        questionId: answer.questionId.toString(),
        questionText: answer.question.questionText,
        selectedChoiceId: answer.choiceId?.toString() || null,
        selectedChoiceText: answer.choice?.choiceText || 'Not answered',
        isCorrect: answer.isCorrect,
        passage: answer.question.passage ? {
          id: answer.question.passage.id.toString(),
          title: answer.question.passage.title,
          content: answer.question.passage.content,
          imageURL: answer.question.passage.imageURL,
          order: answer.question.passage.order
        } : null,
        allChoices: answer.question.choices.map(choice => ({
          id: choice.id.toString(),
          text: choice.choiceText,
          isCorrect: choice.isCorrect,
          isSelected: choice.id === answer.choiceId
        }))
      }))
    };

    return createResponse(res, 200, 'Submission details fetched successfully', submissionData);
  } catch (error) {
    console.error('Error fetching assessment submission:', error);
    return createErrorResponse(res, 500, 'Failed to fetch assessment submission');
  }
};