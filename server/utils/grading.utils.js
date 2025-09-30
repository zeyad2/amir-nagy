/**
 * Grading Utilities
 * Auto-grading logic for assessments
 */

/**
 * Calculate assessment score and prepare answer records
 * @param {Object} assessment - Assessment with passages, questions, and choices
 * @param {Array} studentAnswers - Array of { questionId, choiceId }
 * @returns {Object} { score, totalQuestions, answerRecords }
 */
export const calculateAssessmentScore = (assessment, studentAnswers) => {
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

  // Build a map of student answers for quick lookup
  const answerMap = new Map();
  studentAnswers.forEach(answer => {
    answerMap.set(answer.questionId.toString(), answer.choiceId?.toString() || null);
  });

  // Grade each question and prepare answer records
  let score = 0;
  const answerRecords = [];

  questionMap.forEach((questionData, questionIdStr) => {
    const studentChoiceId = answerMap.get(questionIdStr);
    const correctChoiceId = questionData.correctChoiceId?.toString() || null;

    // Check if answer is correct
    const isCorrect = studentChoiceId !== null && studentChoiceId === correctChoiceId;

    if (isCorrect) {
      score++;
    }

    // Prepare answer record for database
    answerRecords.push({
      questionId: questionIdStr,
      choiceId: studentChoiceId,
      isCorrect
    });
  });

  return {
    score,
    totalQuestions,
    answerRecords
  };
};

/**
 * Validate that all questions in an assessment are answered
 * @param {Object} assessment - Assessment with passages and questions
 * @param {Array} answers - Student's answers
 * @returns {Object} { isValid, missingQuestions }
 */
export const validateAllQuestionsAnswered = (assessment, answers) => {
  const allQuestionIds = new Set();

  assessment.passages.forEach(passage => {
    passage.questions.forEach(question => {
      allQuestionIds.add(question.id.toString());
    });
  });

  const answeredQuestionIds = new Set(
    answers.map(a => a.questionId.toString())
  );

  const missingQuestions = [...allQuestionIds].filter(
    id => !answeredQuestionIds.has(id)
  );

  return {
    isValid: missingQuestions.length === 0,
    missingQuestions,
    totalQuestions: allQuestionIds.size,
    answeredQuestions: answeredQuestionIds.size
  };
};