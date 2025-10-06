/**
 * Assessment Results Component
 * Shows detailed results with question-by-question review
 */
import React, { useState } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

const AssessmentResults = ({ submission, courseId }) => {
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [expandedPassages, setExpandedPassages] = useState(new Set());

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const togglePassage = (passageId) => {
    setExpandedPassages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(passageId)) {
        newSet.delete(passageId);
      } else {
        newSet.add(passageId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allQuestionIds = submission.answers.map(a => a.questionId);
    setExpandedQuestions(new Set(allQuestionIds));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 70) return 'bg-blue-50 border-blue-200';
    if (percentage >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header with Score */}
        <div className={`bg-white rounded-lg shadow-sm border-2 mb-6 p-6 ${getScoreBgColor(parseFloat(submission.percentage))}`}>
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {submission.assessmentTitle}
            </h1>
            <p className="text-gray-600">Submitted on {new Date(submission.submittedAt).toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(parseFloat(submission.percentage))}`}>
                {submission.score}/{submission.totalQuestions}
              </div>
              <p className="text-gray-600 mt-2">Questions Correct</p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(parseFloat(submission.percentage))}`}>
                {submission.percentage}%
              </div>
              <p className="text-gray-600 mt-2">Score</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Question-by-Question Review
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={expandAll}
                variant="outline"
                size="sm"
              >
                Expand All
              </Button>
              <Button
                onClick={collapseAll}
                variant="outline"
                size="sm"
              >
                Collapse All
              </Button>
              <Button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                Back to Course
              </Button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {submission.answers.map((answer, index) => {
            const isExpanded = expandedQuestions.has(answer.questionId);
            const isCorrect = answer.isCorrect;
            const correctChoice = answer.allChoices.find(c => c.isCorrect);

            return (
              <div
                key={answer.questionId}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  isCorrect ? 'border-green-200' : 'border-red-200'
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(answer.questionId)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {answer.questionText}
                      </p>
                      <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Question Details (Expandable) */}
                {isExpanded && (
                  <div className="p-4 border-t bg-gray-50">
                    {/* Passage Reference */}
                    {answer.passage && (
                      <div className="mb-4 p-4 bg-white rounded-lg border">
                        <button
                          onClick={() => togglePassage(answer.passage.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <h4 className="font-semibold text-gray-900">
                            {answer.passage.title || 'Reading Passage'}
                          </h4>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${expandedPassages.has(answer.passage.id) ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedPassages.has(answer.passage.id) && (
                          <div className="mt-3 pt-3 border-t">
                            <div
                              className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-serif"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(answer.passage.content) }}
                            />
                            {answer.passage.imageURL && (
                              <img
                                src={answer.passage.imageURL}
                                alt="Passage illustration"
                                className="mt-3 rounded-lg max-w-full"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-gray-900 font-medium mb-4">
                      {answer.questionText}
                    </p>

                    {/* All Choices */}
                    <div className="space-y-2">
                      {answer.allChoices.map((choice, choiceIndex) => {
                        const choiceLabel = String.fromCharCode(65 + choiceIndex); // A, B, C, D
                        const isSelected = choice.isSelected;
                        const isCorrectAnswer = choice.isCorrect;

                        let borderColor = 'border-gray-200';
                        let bgColor = 'bg-white';
                        let badgeColor = '';
                        let badge = '';

                        if (isCorrectAnswer) {
                          borderColor = 'border-green-300';
                          bgColor = 'bg-green-50';
                          badge = '✓ Correct Answer';
                          badgeColor = 'text-green-700 bg-green-100';
                        }

                        if (isSelected && !isCorrectAnswer) {
                          borderColor = 'border-red-300';
                          bgColor = 'bg-red-50';
                          badge = '✗ Your Answer';
                          badgeColor = 'text-red-700 bg-red-100';
                        }

                        if (isSelected && isCorrectAnswer) {
                          badge = '✓ Your Answer (Correct)';
                          badgeColor = 'text-green-700 bg-green-100';
                        }

                        return (
                          <div
                            key={choice.id}
                            className={`p-3 rounded-lg border-2 ${borderColor} ${bgColor}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-gray-700">
                                  {choiceLabel}.
                                </span>
                                <span className="text-gray-800">
                                  {choice.text}
                                </span>
                              </div>
                              {badge && (
                                <span className={`text-xs font-medium px-2 py-1 rounded ${badgeColor} whitespace-nowrap ml-2`}>
                                  {badge}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation (if incorrect) */}
                    {!isCorrect && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Correct Answer: </span>
                          {correctChoice?.text}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Return to Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
