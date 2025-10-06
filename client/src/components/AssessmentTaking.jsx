/**
 * Assessment Taking Component
 * SAT-style interface for taking homework and tests
 */
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import AssessmentTimer from './AssessmentTimer';
import QuestionNavigation from './QuestionNavigation';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';

const AssessmentTaking = ({ assessment, onSubmit, onAutoSubmit, isSubmitting }) => {
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const isTimed = assessment.duration && assessment.duration > 0;
  const isTest = isTimed; // Timed assessments are tests, untimed are homework

  // Flatten all questions from all passages for easier navigation
  const allQuestions = assessment.passages.flatMap((passage, pIndex) =>
    passage.questions.map((q, qIndex) => ({
      ...q,
      passageIndex: pIndex,
      questionIndexInPassage: qIndex,
      passage: passage
    }))
  );

  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentPassage = currentQuestion?.passage;

  // Handle answer selection
  const handleAnswerChange = (questionId, choiceId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  // Navigate to specific question
  const goToQuestion = (index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
      const question = allQuestions[index];
      setCurrentPassageIndex(question.passageIndex);
    }
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  // Handle submit button click
  const handleSubmitClick = () => {
    // For homework, check if all questions are answered
    if (!isTest && answeredCount < totalQuestions) {
      toast.error(`Please answer all questions before submitting. ${answeredCount}/${totalQuestions} answered.`);
      return;
    }

    // For tests, allow partial submission
    if (isTest && answeredCount < totalQuestions) {
      const unanswered = totalQuestions - answeredCount;
      toast.error(`Warning: ${unanswered} question(s) will be marked as incorrect.`, {
        duration: 5000
      });
    }

    setShowSubmitConfirm(true);
  };

  // Handle actual submission
  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);

    // Convert answers to array format: {questionId, choiceId}
    const answersArray = allQuestions.map(q => ({
      questionId: q.id,
      choiceId: answers[q.id] || null
    }));

    onSubmit(answersArray);
  };

  // Handle timer expiration (auto-submit for tests)
  const handleTimeUp = () => {
    toast.error('Time is up! Submitting your test automatically...', { duration: 3000 });

    // Convert answers to array format
    const answersArray = allQuestions.map(q => ({
      questionId: q.id,
      choiceId: answers[q.id] || null
    }));

    onAutoSubmit(answersArray);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showSubmitConfirm) return; // Don't navigate during confirmation

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextQuestion();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        previousQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, showSubmitConfirm]);

  if (!currentQuestion || !currentPassage) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            {isTimed && (
              <AssessmentTimer
                durationMinutes={assessment.duration}
                onTimeUp={handleTimeUp}
              />
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Question Navigation */}
          <div className="lg:col-span-1">
            <QuestionNavigation
              questions={allQuestions}
              answers={answers}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionSelect={goToQuestion}
            />

            {/* Submit Button */}
            <Button
              onClick={handleSubmitClick}
              disabled={isSubmitting || (!isTest && answeredCount < totalQuestions)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>

            {!isTest && answeredCount < totalQuestions && (
              <p className="text-xs text-orange-600 mt-2 text-center">
                Please answer all questions to submit
              </p>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Passage Panel */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentPassage.title || 'Reading Passage'}
                </h2>
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-gray-800 leading-relaxed font-serif"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentPassage.content) }}
                  />
                  {currentPassage.imageURL && (
                    <img
                      src={currentPassage.imageURL}
                      alt="Passage illustration"
                      className="mt-4 rounded-lg max-w-full"
                    />
                  )}
                </div>
              </div>

              {/* Question Panel */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {currentQuestionIndex + 1}
                    </span>
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  {/* Answer Choices */}
                  <div className="space-y-3">
                    {currentQuestion.choices.map((choice, index) => {
                      const choiceLabel = String.fromCharCode(65 + index); // A, B, C, D
                      const isSelected = answers[currentQuestion.id] === choice.id;

                      return (
                        <label
                          key={choice.id}
                          className={`
                            flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={choice.id}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(currentQuestion.id, choice.id)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-700 mr-2">
                              {choiceLabel}.
                            </span>
                            <span className="text-gray-800">
                              {choice.choiceText}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    {answeredCount}/{totalQuestions} answered
                  </span>
                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    variant="outline"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Submission
              </h3>
              <p className="text-gray-700 mb-2">
                Are you sure you want to submit your {isTest ? 'test' : 'homework'}?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                You have answered {answeredCount} out of {totalQuestions} questions.
                {answeredCount < totalQuestions && (
                  <span className="text-orange-600 font-medium">
                    {' '}Unanswered questions will be marked as incorrect.
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSubmitConfirm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentTaking;
