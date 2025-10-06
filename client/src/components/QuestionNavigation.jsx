/**
 * Question Navigation Component
 * Shows a grid of question numbers with answered/unanswered status
 */
import React from 'react';

const QuestionNavigation = ({ questions, answers, currentQuestionIndex, onQuestionSelect }) => {
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Question Navigation</h3>
        <p className="text-xs text-gray-600">
          {answeredCount} of {totalQuestions} answered
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((question, index) => {
          const isAnswered = answers[question.id] !== undefined;
          const isCurrent = index === currentQuestionIndex;

          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`
                h-10 w-10 rounded-lg font-medium text-sm transition-all
                ${isCurrent
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : ''
                }
                ${isAnswered
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-label={`Question ${index + 1}${isAnswered ? ' (answered)' : ' (unanswered)'}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
          <span className="text-gray-600">Unanswered</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;
