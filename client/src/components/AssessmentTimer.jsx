/**
 * Assessment Timer Component
 * Countdown timer for timed tests with auto-submit
 */
import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from './ui/alert';

const AssessmentTimer = ({ durationMinutes, onTimeUp }) => {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60); // in seconds
  const [showWarning, setShowWarning] = useState(false);
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);

  useEffect(() => {
    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onTimeUp]);

  useEffect(() => {
    // Show warning at 5 minutes remaining (only once)
    if (timeRemaining === 300 && !warningShownRef.current) {
      setShowWarning(true);
      warningShownRef.current = true;

      // Hide warning after 10 seconds
      setTimeout(() => {
        setShowWarning(false);
      }, 10000);
    }
  }, [timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Determine color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-600'; // Last minute - red
    if (timeRemaining <= 300) return 'text-orange-600'; // Last 5 minutes - orange
    return 'text-gray-900'; // Normal - black
  };

  const getTimerBgColor = () => {
    if (timeRemaining <= 60) return 'bg-red-50 border-red-200';
    if (timeRemaining <= 300) return 'bg-orange-50 border-orange-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div>
      {/* Timer Display */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getTimerBgColor()}`}>
        <svg
          className={`w-5 h-5 ${getTimerColor()}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </span>
        <span className="text-xs text-gray-600">remaining</span>
      </div>

      {/* Warning Alert */}
      {showWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert className="bg-orange-50 border-orange-300 shadow-lg">
            <AlertDescription className="text-orange-800 font-medium">
              ⚠️ Warning: Only 5 minutes remaining! The test will auto-submit when time runs out.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default AssessmentTimer;
