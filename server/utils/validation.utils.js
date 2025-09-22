/**
 * Validation utility functions
 */

/**
 * Validates Google Drive URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid Google Drive URL
 */
export const isValidGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  const googleDrivePatterns = [
    /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/,
    /^https:\/\/drive\.google\.com\/open\?id=[a-zA-Z0-9_-]+/,
    /^https:\/\/docs\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/
  ];

  return googleDrivePatterns.some(pattern => pattern.test(url));
};

/**
 * Validates homework structure business rules
 * @param {Object} homeworkData - The homework data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateHomeworkStructure = (homeworkData) => {
  const errors = [];

  // Validate homework has at least one passage
  if (!homeworkData.passages || homeworkData.passages.length === 0) {
    errors.push("Homework must have at least one passage");
  }

  homeworkData.passages?.forEach((passage, passageIndex) => {
    // Validate passage has at least one question
    if (!passage.questions || passage.questions.length === 0) {
      errors.push(`Passage ${passageIndex + 1} must have at least one question`);
    }

    passage.questions?.forEach((question, questionIndex) => {
      // Validate exactly 4 choices
      if (!question.choices || question.choices.length !== 4) {
        errors.push(`Passage ${passageIndex + 1}, Question ${questionIndex + 1} must have exactly 4 choices`);
      }

      // Validate exactly one correct choice
      const correctChoices = question.choices?.filter(choice => choice.isCorrect) || [];
      if (correctChoices.length !== 1) {
        errors.push(`Passage ${passageIndex + 1}, Question ${questionIndex + 1} must have exactly one correct choice`);
      }

      // Validate choice text length
      question.choices?.forEach((choice, choiceIndex) => {
        if (!choice.choiceText || choice.choiceText.trim().length === 0) {
          errors.push(`Passage ${passageIndex + 1}, Question ${questionIndex + 1}, Choice ${String.fromCharCode(65 + choiceIndex)} cannot be empty`);
        }
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates test structure business rules
 * @param {Object} testData - The test data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateTestStructure = (testData) => {
  const result = validateHomeworkStructure(testData);

  // Additional test-specific validations
  if (testData.duration && (typeof testData.duration !== 'number' || testData.duration <= 0)) {
    result.errors.push("Test duration must be a positive number (in minutes)");
    result.isValid = false;
  }

  return result;
};