/**
 * Student Assessments Controller - FIXED VERSION
 * Handles assessment attempts, submissions, and answer grading for students
 * Works with the actual schema: separate Test and Homework tables
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Get assessment data (for viewing/resuming)
 * GET /api/student/assessments/:id
 *
 * Returns the assessment structure without correct answer information
 */
export const getAssessmentData = async (req, res) => {
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

    // Check if this is a Test or Homework
    const test = await Prisma.test.findUnique({
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
                  }
                }
              }
            }
          }
        }
      }
    });

    const homework = !test ? await Prisma.homework.findUnique({
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
                  }
                }
              }
            }
          }
        }
      }
    }) : null;

    if (!test && !homework) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    const assessment = test || homework;

    // Transform for student view (hide correct answers)
    const assessmentData = {
      id: assessment.id.toString(),
      title: assessment.title,
      instructions: assessment.instructions,
      duration: assessment.duration || null,
      type: assessment.duration ? 'timed' : 'untimed',
      assessmentType: test ? 'test' : 'homework',
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

    return createResponse(res, 200, 'Assessment data retrieved successfully', {
      assessment: assessmentData
    });
  } catch (error) {
    console.error('Error getting assessment data:', error);
    return createErrorResponse(res, 500, 'Failed to get assessment data');
  }
};

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

    // Check if this is a Test or Homework
    const test = await Prisma.test.findUnique({
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
                  }
                }
              }
            }
          }
        }
      }
    });

    const homework = !test ? await Prisma.homework.findUnique({
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
                  }
                }
              }
            }
          }
        }
      }
    }) : null;

    if (!test && !homework) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    // Check if already submitted or started
    if (test) {
      // Find the CourseTest
      const courseTest = await Prisma.courseTest.findFirst({
        where: {
          testId: BigInt(assessmentId),
          course: {
            enrollments: {
              some: {
                studentId: student.uuid,
                status: 'active'
              }
            }
          }
        }
      });

      if (!courseTest) {
        return createErrorResponse(res, 403, 'You are not enrolled in a course that includes this test');
      }

      // Check if test attempt already exists
      const existingAttempt = await Prisma.testAttempt.findUnique({
        where: {
          courseTestId_studentId: {
            courseTestId: courseTest.id,
            studentId: student.uuid
          }
        }
      });

      if (existingAttempt) {
        return createErrorResponse(
          res,
          400,
          'You have already started this test. Tests can only be attempted once.'
        );
      }

      // Check if already submitted
      const existingSubmission = await Prisma.testSubmission.findUnique({
        where: {
          courseTestId_studentId: {
            courseTestId: courseTest.id,
            studentId: student.uuid
          }
        }
      });

      if (existingSubmission) {
        return createErrorResponse(
          res,
          400,
          'You have already submitted this test.'
        );
      }

      // Create TestAttempt record to track start time and prevent restart
      await Prisma.testAttempt.create({
        data: {
          courseTestId: courseTest.id,
          studentId: student.uuid
        }
      });
    } else {
      // For homework, just check if already submitted
      const existingSubmission = await Prisma.homeworkSubmission.findFirst({
        where: {
          studentId: student.uuid,
          homeworkId: BigInt(assessmentId)
        }
      });

      if (existingSubmission) {
        return createErrorResponse(
          res,
          400,
          'You have already submitted this homework. Each homework can only be attempted once.'
        );
      }
    }

    const assessment = test || homework;

    // Transform for student view (hide correct answers)
    const assessmentData = {
      id: assessment.id.toString(),
      title: assessment.title,
      instructions: assessment.instructions,
      duration: assessment.duration || null,
      type: assessment.duration ? 'timed' : 'untimed',
      assessmentType: test ? 'test' : 'homework',
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
};;

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

    // Check both test and homework submissions
    const testSubmission = await Prisma.testSubmission.findFirst({
      where: {
        studentId: student.uuid,
        CourseTest: {
          testId: BigInt(assessmentId)
        }
      }
    });

    const homeworkSubmission = await Prisma.homeworkSubmission.findFirst({
      where: {
        studentId: student.uuid,
        homeworkId: BigInt(assessmentId)
      }
    });

    const submission = testSubmission || homeworkSubmission;

    if (submission) {
      return createResponse(res, 200, 'Assessment already submitted', {
        status: 'submitted',
        submittedAt: submission.submittedAt,
        score: submission.score,
        submissionId: submission.id.toString()
      });
    }

    // Get assessment basic info
    const test = await Prisma.test.findUnique({
      where: { id: BigInt(assessmentId) },
      select: { id: true, title: true, duration: true }
    });

    const homework = !test ? await Prisma.homework.findUnique({
      where: { id: BigInt(assessmentId) },
      select: { id: true, title: true }
    }) : null;

    const assessment = test || homework;

    if (!assessment) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    // If it's a test, check for TestAttempt to see if it's in progress
    if (test) {
      const courseTest = await Prisma.courseTest.findFirst({
        where: {
          testId: BigInt(assessmentId),
          course: {
            enrollments: {
              some: {
                studentId: student.uuid,
                status: 'active'
              }
            }
          }
        }
      });

      if (courseTest) {
        const testAttempt = await Prisma.testAttempt.findUnique({
          where: {
            courseTestId_studentId: {
              courseTestId: courseTest.id,
              studentId: student.uuid
            }
          }
        });

        if (testAttempt) {
          // Test is in progress - calculate remaining time
          const startTime = testAttempt.startedAt;
          const durationMs = test.duration * 60 * 1000; // duration in minutes to milliseconds
          const elapsedMs = Date.now() - new Date(startTime).getTime();
          const remainingMs = durationMs - elapsedMs;

          if (remainingMs <= 0) {
            // Time is up
            return createResponse(res, 200, 'Test time has expired', {
              status: 'in_progress',
              startedAt: startTime,
              timeExpired: true,
              assessment: {
                id: assessment.id.toString(),
                title: assessment.title,
                duration: test.duration
              }
            });
          }

          return createResponse(res, 200, 'Test in progress', {
            status: 'in_progress',
            startedAt: startTime,
            remainingTimeMs: Math.floor(remainingMs),
            assessment: {
              id: assessment.id.toString(),
              title: assessment.title,
              duration: test.duration
            }
          });
        }
      }
    }

    return createResponse(res, 200, 'Assessment not yet attempted', {
      status: 'not_started',
      assessment: {
        id: assessment.id.toString(),
        title: assessment.title,
        duration: test?.duration || null
      }
    });
  } catch (error) {
    console.error('Error getting assessment attempt status:', error);
    return createErrorResponse(res, 500, 'Failed to get assessment attempt status');
  }
};;

/**
 * Submit assessment answers
 * POST /api/student/assessments/:id/submit
 */
export const submitAssessment = async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const { answers } = req.body;
    const userId = req.user.uuid;

    if (!answers || !Array.isArray(answers)) {
      return createErrorResponse(res, 400, 'Answers array is required');
    }

    // Allow empty answers array (student can submit test without answering anything)

    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student record not found');
    }

    // Check if this is a Test or Homework
    const test = await Prisma.test.findUnique({
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

    const homework = !test ? await Prisma.homework.findUnique({
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
    }) : null;

    if (!test && !homework) {
      return createErrorResponse(res, 404, 'Assessment not found');
    }

    const assessment = test || homework;
    const isTest = !!test;

    // Check if already submitted
    if (isTest) {
      const existingSubmission = await Prisma.testSubmission.findFirst({
        where: {
          studentId: student.uuid,
          CourseTest: {
            testId: BigInt(assessmentId)
          }
        }
      });

      if (existingSubmission) {
        return createErrorResponse(res, 400, 'Test already submitted');
      }
    } else {
      const existingSubmission = await Prisma.homeworkSubmission.findFirst({
        where: {
          studentId: student.uuid,
          homeworkId: BigInt(assessmentId)
        }
      });

      if (existingSubmission) {
        return createErrorResponse(res, 400, 'Homework already submitted');
      }
    }

    // Build a map of all questions with their correct answers
    const questionMap = new Map();
    assessment.passages.forEach(passage => {
      passage.questions.forEach(question => {
        const correctChoice = question.choices.find(c => c.isCorrect);
        questionMap.set(question.id.toString(), {
          questionId: question.id,
          correctChoiceId: correctChoice?.id || null
        });
      });
    });

    const totalQuestions = questionMap.size;

    // Create a map of student answers for quick lookup
    const studentAnswersMap = new Map();
    answers.forEach(answer => {
      studentAnswersMap.set(answer.questionId, answer.choiceId);
    });

    // Grade ALL questions (including unanswered ones)
    let correctCount = 0;
    const answerRecords = [];

    questionMap.forEach((questionData, questionIdStr) => {
      const studentChoiceId = studentAnswersMap.get(questionIdStr);

      // Check if answer is correct
      const isCorrect = studentChoiceId && questionData.correctChoiceId
        ? BigInt(studentChoiceId) === questionData.correctChoiceId
        : false;

      if (isCorrect) correctCount++;

      // Create answer record (choiceId is null if unanswered)
      answerRecords.push({
        questionId: questionData.questionId,
        choiceId: studentChoiceId ? BigInt(studentChoiceId) : null,
        isCorrect
      });
    });

    // Create submission with answers in a transaction
    const submission = await Prisma.$transaction(async (prisma) => {
      if (isTest) {
        // Find the CourseTest
        const courseTest = await prisma.courseTest.findFirst({
          where: {
            testId: BigInt(assessmentId),
            course: {
              enrollments: {
                some: {
                  studentId: student.uuid,
                  status: 'active'
                }
              }
            }
          }
        });

        if (!courseTest) {
          throw new Error('You are not enrolled in a course that includes this test');
        }

        // Create TestSubmission
        const newSubmission = await prisma.testSubmission.create({
          data: {
            courseTestId: courseTest.id,
            studentId: student.uuid,
            score: correctCount
          }
        });

        // Create TestAnswer records
        await prisma.testAnswer.createMany({
          data: answerRecords.map(answer => ({
            submissionId: newSubmission.id,
            questionId: answer.questionId,
            choiceId: answer.choiceId,
            isCorrect: answer.isCorrect
          }))
        });

        return newSubmission;
      } else {
        // Create HomeworkSubmission
        const newSubmission = await prisma.homeworkSubmission.create({
          data: {
            homeworkId: BigInt(assessmentId),
            studentId: student.uuid,
            score: correctCount
          }
        });

        // Create HomeworkAnswer records
        await prisma.homeworkAnswer.createMany({
          data: answerRecords.map(answer => ({
            submissionId: newSubmission.id,
            questionId: answer.questionId,
            choiceId: answer.choiceId,
            isCorrect: answer.isCorrect
          }))
        });

        return newSubmission;
      }
    });

    return createResponse(res, 201, 'Assessment submitted successfully', {
      submissionId: submission.id.toString(),
      score: correctCount,
      totalQuestions,
      percentage: ((correctCount / totalQuestions) * 100).toFixed(2),
      submittedAt: submission.submittedAt,
      message: `You scored ${correctCount} out of ${totalQuestions} (${((correctCount / totalQuestions) * 100).toFixed(2)}%)`
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return createErrorResponse(res, 500, error.message || 'Failed to submit assessment');
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

    const student = await Prisma.student.findUnique({
      where: { uuid: userId }
    });

    if (!student) {
      return createErrorResponse(res, 404, 'Student record not found');
    }

    // Try test submission first
    let submission = await Prisma.testSubmission.findFirst({
      where: {
        studentId: student.uuid,
        CourseTest: {
          testId: BigInt(assessmentId)
        }
      },
      include: {
        CourseTest: {
          include: {
            test: {
              select: {
                id: true,
                title: true,
                duration: true,
                passages: {
                  orderBy: { order: 'asc' },
                  include: {
                    questions: {
                      orderBy: { order: 'asc' }
                    }
                  }
                }
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              include: {
                choices: true
              }
            },
            choice: true
          }
        }
      }
    });

    let isTest = true;
    let assessment = null;

    // If not found, try homework submission
    if (!submission) {
      submission = await Prisma.homeworkSubmission.findFirst({
        where: {
          studentId: student.uuid,
          homeworkId: BigInt(assessmentId)
        },
        include: {
          homework: {
            select: {
              id: true,
              title: true,
              passages: {
                orderBy: { order: 'asc' },
                include: {
                  questions: {
                    orderBy: { order: 'asc' }
                  }
                }
              }
            }
          },
          answers: {
            include: {
              question: {
                include: {
                  choices: true
                }
              },
              choice: true
            }
          }
        }
      });
      isTest = false;
    }

    if (submission) {
      assessment = isTest ? submission.CourseTest.test : submission.homework;
    }

    if (!submission) {
      return createErrorResponse(res, 404, 'Submission not found. You have not submitted this assessment yet.');
    }

    // Build a map of answers by question ID
    const answersMap = {};
    submission.answers.forEach(answer => {
      answersMap[answer.questionId.toString()] = {
        questionId: answer.questionId.toString(),
        questionText: answer.question.questionText,
        selectedChoiceId: answer.choiceId?.toString() || null,
        selectedChoiceText: answer.choice?.choiceText || 'Not answered',
        isCorrect: answer.isCorrect,
        allChoices: answer.question.choices.map(choice => ({
          id: choice.id.toString(),
          text: choice.choiceText,
          isCorrect: choice.isCorrect,
          isSelected: choice.id === answer.choiceId
        }))
      };
    });

    // Transform submission data for detailed review
    const submissionData = {
      id: submission.id.toString(),
      assessmentId: assessmentId,
      assessmentTitle: assessment.title,
      score: submission.score,
      totalQuestions: submission.answers.length,
      percentage: ((submission.score / submission.answers.length) * 100).toFixed(2),
      submittedAt: submission.submittedAt,
      passages: assessment.passages.map(passage => ({
        id: passage.id.toString(),
        title: passage.title,
        content: passage.content,
        imageURL: passage.imageURL,
        order: passage.order,
        questions: passage.questions.map(q => {
          const answer = answersMap[q.id.toString()];
          return answer || null;
        }).filter(Boolean)
      })),
      answers: submission.answers.map(answer => ({
        questionId: answer.questionId.toString(),
        questionText: answer.question.questionText,
        selectedChoiceId: answer.choiceId?.toString() || null,
        selectedChoiceText: answer.choice?.choiceText || 'Not answered',
        isCorrect: answer.isCorrect,
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
