/**
 * Assessment Start Page
 * Shows instructions and confirmation before starting the assessment
 */
import React from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const AssessmentStartPage = ({ assessment, onStart, onCancel }) => {
  const isTimed = assessment.duration && assessment.duration > 0;
  const totalQuestions = assessment.passages?.reduce(
    (sum, p) => sum + (p.questions?.length || 0),
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {assessment.title}
            </h1>
            <p className="text-gray-600">
              {isTimed ? 'Timed Test' : 'Homework Assignment'}
            </p>
          </div>

          {/* Assessment Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600 mt-1">Questions</div>
            </div>
            {isTimed && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{assessment.duration}</div>
                <div className="text-sm text-gray-600 mt-1">Minutes</div>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {assessment.passages?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {assessment.passages?.length === 1 ? 'Passage' : 'Passages'}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
            {assessment.instructions ? (
              <p className="text-gray-700 leading-relaxed mb-4">
                {assessment.instructions}
              </p>
            ) : (
              <p className="text-gray-700 leading-relaxed mb-4">
                Read each passage carefully and answer all questions to the best of your ability.
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  You can navigate between questions using the Previous/Next buttons or the question navigation panel
                </span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  Your answers are tracked automatically as you select them
                </span>
              </div>
              {isTimed ? (
                <>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      <strong>Timer starts immediately</strong> when you click "Start Test" and cannot be paused
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      You will receive a warning at 5 minutes remaining
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      <strong>Test will auto-submit when time expires</strong> - unanswered questions will be marked incorrect
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      You must answer all questions before you can submit
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      Take your time - there is no time limit for homework
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Warning for timed tests */}
          {isTimed && (
            <Alert className="mb-6 bg-orange-50 border-orange-200">
              <AlertDescription className="text-orange-800">
                <strong>⏰ Important:</strong> Once you start, the {assessment.duration}-minute timer will begin immediately and cannot be stopped. Make sure you're ready and have a stable internet connection.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onStart}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isTimed ? 'Start Test' : 'Start Homework'}
            </Button>
          </div>
        </div>

        {/* Additional Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Tips for Success</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Read each passage carefully before attempting the questions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Use the passage text to support your answers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Review all questions before submitting</span>
            </li>
            {isTimed && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Manage your time wisely - aim to spend about {Math.ceil(assessment.duration / totalQuestions)} minutes per question</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssessmentStartPage;
