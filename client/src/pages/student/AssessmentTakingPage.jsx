/**
 * Assessment Taking Page
 * Main page for taking homework and tests with routing
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import assessmentService from '../../services/assessment.service';
import AssessmentTaking from '../../components/AssessmentTaking';
import AssessmentResults from '../../components/AssessmentResults';
import AssessmentStartPage from '../../components/AssessmentStartPage';
import toast from 'react-hot-toast';

const AssessmentTakingPage = () => {
  const { courseId, type, assessmentId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('loading'); // loading, start, taking, results
  const [hasStarted, setHasStarted] = useState(false);

  // Fetch assessment status first
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['assessment-status', assessmentId, type],
    queryFn: () => assessmentService.getAssessmentStatus(assessmentId, type),
    retry: 1
  });

  // Fetch assessment data for taking
  const { data: assessmentData, isLoading: assessmentLoading } = useQuery({
    queryKey: ['assessment-attempt', assessmentId, type],
    queryFn: () => assessmentService.startAssessment(assessmentId, type),
    enabled: statusData?.data?.status === 'not_started',
    retry: false
  });

  // Fetch submission details if already submitted
  const { data: submissionData, isLoading: submissionLoading } = useQuery({
    queryKey: ['assessment-submission', assessmentId, type],
    queryFn: () => assessmentService.getSubmissionDetails(assessmentId, type),
    enabled: statusData?.data?.status === 'submitted',
    retry: false
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (answers) => assessmentService.submitAssessment(assessmentId, type, answers),
    onSuccess: (data) => {
      toast.success('Assessment submitted successfully!');
      setView('results');
      // Refetch submission details to show results
      setTimeout(() => {
        window.location.reload(); // Simple refresh to load results
      }, 500);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to submit assessment';
      toast.error(errorMessage);
    }
  });

  // Handle submission
  const handleSubmit = (answers) => {
    submitMutation.mutate(answers);
  };

  // Handle auto-submit (for timed tests)
  const handleAutoSubmit = (answers) => {
    submitMutation.mutate(answers);
  };

  // Determine view based on status
  useEffect(() => {
    if (statusData?.data?.status === 'submitted') {
      setView('results');
    } else if (statusData?.data?.status === 'not_started' && assessmentData) {
      // Show start page first, only show taking view after user confirms
      setView(hasStarted ? 'taking' : 'start');
    }
  }, [statusData, assessmentData, hasStarted]);

  // Handle start confirmation
  const handleStart = () => {
    setHasStarted(true);
    setView('taking');
  };

  // Handle cancel from start page
  const handleCancelStart = () => {
    navigate(`/courses/${courseId}`);
  };

  // Prevent navigation away while taking assessment (but not on start page)
  useEffect(() => {
    if (view === 'taking' && hasStarted) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [view, hasStarted]);

  // Loading state
  if (statusLoading || assessmentLoading || submissionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!statusData && !assessmentData && !submissionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
          <p className="text-gray-600 mb-6">
            The assessment you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate view
  if (view === 'results' && submissionData?.data) {
    return (
      <AssessmentResults
        submission={submissionData.data}
        courseId={courseId}
      />
    );
  }

  if (view === 'start' && assessmentData?.data?.assessment) {
    return (
      <AssessmentStartPage
        assessment={assessmentData.data.assessment}
        onStart={handleStart}
        onCancel={handleCancelStart}
      />
    );
  }

  if (view === 'taking' && assessmentData?.data?.assessment && hasStarted) {
    return (
      <AssessmentTaking
        assessment={assessmentData.data.assessment}
        onSubmit={handleSubmit}
        onAutoSubmit={handleAutoSubmit}
        isSubmitting={submitMutation.isLoading}
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Preparing assessment...</p>
      </div>
    </div>
  );
};

export default AssessmentTakingPage;
