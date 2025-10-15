/**
 * AssessmentPage
 * Unified page for taking tests and homework with confirmation, timer, and review
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentService } from '@/services/student.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import PassageRenderer from '@/components/student/PassageRenderer'
import QuestionCard from '@/components/student/QuestionCard'
import AssessmentTimer from '@/components/student/AssessmentTimer'
import QuestionNavigation from '@/components/student/QuestionNavigation'
import ScoreDisplay from '@/components/student/ScoreDisplay'
import AnswerReview from '@/components/student/AnswerReview'
import { Clock, FileText, AlertCircle, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const ASSESSMENT_STATES = {
  LOADING: 'loading',
  CONFIRMATION: 'confirmation',
  TAKING: 'taking',
  SUBMITTING: 'submitting',
  RESULTS: 'results'
}

export default function AssessmentPage() {
  const { id: assessmentId } = useParams()
  const navigate = useNavigate()

  const [state, setState] = useState(ASSESSMENT_STATES.LOADING)
  const [assessment, setAssessment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timerStartTime, setTimerStartTime] = useState(null)
  const [currentQuestionId, setCurrentQuestionId] = useState(null)
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [error, setError] = useState(null)

  // Load assessment on mount
  useEffect(() => {
    loadAssessment()
  }, [assessmentId])

  // Load saved answers from localStorage
  useEffect(() => {
    if (assessment && state === ASSESSMENT_STATES.TAKING) {
      const savedAnswers = localStorage.getItem(`assessment_${assessmentId}_answers`)
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers))
        } catch (e) {
          console.error('Failed to parse saved answers:', e)
        }
      }

      // Load timer if it exists
      if (assessment.duration) {
        const savedTimer = localStorage.getItem(`assessment_${assessmentId}_timer`)
        if (savedTimer) {
          try {
            const timerData = JSON.parse(savedTimer)
            setTimerStartTime(timerData.startTime)
          } catch (e) {
            console.error('Failed to parse saved timer:', e)
          }
        }
      }
    }
  }, [assessment, state, assessmentId])

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (state === ASSESSMENT_STATES.TAKING && Object.keys(answers).length > 0) {
      localStorage.setItem(`assessment_${assessmentId}_answers`, JSON.stringify(answers))
    }
  }, [answers, assessmentId, state])

  const loadAssessment = async () => {
    try {
      setState(ASSESSMENT_STATES.LOADING)

      // Check if already submitted
      try {
        const submissionResponse = await studentService.getAssessmentSubmission(assessmentId)
        setSubmission(submissionResponse.data)
        setState(ASSESSMENT_STATES.RESULTS)
        return
      } catch (submissionError) {
        // Not submitted yet, continue
      }

      // Check attempt status (for in-progress tests)
      try {
        const statusResponse = await studentService.getAssessmentAttemptStatus(assessmentId)
        const statusData = statusResponse.data

        if (statusData.status === 'in_progress') {
          // Test is in progress - resume it
          // Use GET endpoint to fetch assessment data (not POST which creates new attempt)
          const response = await studentService.getAssessmentData(assessmentId)
          const assessmentData = response.data.assessment

          setAssessment(assessmentData)
          setTimerStartTime(statusData.startedAt)

          // Set first question as current
          if (assessmentData.passages.length > 0 && assessmentData.passages[0].questions.length > 0) {
            setCurrentQuestionId(assessmentData.passages[0].questions[0].id)
          }

          // Check if time expired
          if (statusData.timeExpired) {
            toast.error('Test time has expired. Your answers will be automatically submitted.')
            // Auto-submit the test since time is up
            setState(ASSESSMENT_STATES.TAKING)
            // Trigger auto-submit after a short delay
            setTimeout(() => handleTimeUp(), 1000)
            return
          }

          toast.info(`Resuming test with ${Math.floor(statusData.remainingTimeMs / 60000)} minutes remaining`)
          setState(ASSESSMENT_STATES.TAKING)
          return
        }
      } catch (statusError) {
        // No in-progress attempt, continue to load assessment data
      }

      // Get assessment data (without creating attempt yet)
      const response = await studentService.getAssessmentData(assessmentId)
      const assessmentData = response.data.assessment

      setAssessment(assessmentData)

      // Set first question as current
      if (assessmentData.passages.length > 0 && assessmentData.passages[0].questions.length > 0) {
        setCurrentQuestionId(assessmentData.passages[0].questions[0].id)
      }

      // Determine next state
      if (assessmentData.duration) {
        // Timed test - show confirmation (don't create attempt yet)
        setState(ASSESSMENT_STATES.CONFIRMATION)
      } else {
        // Untimed homework - start immediately
        setState(ASSESSMENT_STATES.TAKING)
      }
    } catch (err) {
      console.error('Error loading assessment:', err)
      setError(err.response?.data?.message || 'Failed to load assessment')
      toast.error('Failed to load assessment')
    }
  }

  const handleStartTest = async () => {
    try {
      // Create the test attempt now
      const response = await studentService.startAssessment(assessmentId)
      const startedAt = response.data.startedAt || new Date().toISOString()

      setTimerStartTime(startedAt)
      setState(ASSESSMENT_STATES.TAKING)
    } catch (err) {
      console.error('Error starting test:', err)
      toast.error(err.response?.data?.message || 'Failed to start test')
      setError(err.response?.data?.message || 'Failed to start test')
    }
  }

  const handleSelectAnswer = (questionId, choiceId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }))
  }

  const handleTimeUp = useCallback(async () => {
    toast.error('Time is up! Submitting your answers...')
    await submitAssessment(true)
  }, [answers, assessmentId])

  const handleSubmitClick = () => {
    // Only for homework (untimed), validate all questions answered
    // For tests (timed), allow early submission with unanswered questions
    if (!assessment.duration) {
      const allQuestions = assessment.passages.flatMap(p => p.questions)
      const unanswered = allQuestions.filter(q => !answers[q.id])

      if (unanswered.length > 0) {
        toast.error(`Please answer all questions before submitting. ${unanswered.length} question(s) remaining.`)
        return
      }
    }

    setShowSubmitDialog(true)
  }

  const submitAssessment = async (autoSubmit = false) => {
    // Prevent double submission
    if (state === ASSESSMENT_STATES.SUBMITTING || state === ASSESSMENT_STATES.RESULTS) {
      return
    }

    try {
      setState(ASSESSMENT_STATES.SUBMITTING)

      // Convert answers object to array format
      const answersArray = Object.entries(answers).map(([questionId, choiceId]) => ({
        questionId,
        choiceId
      }))

      const response = await studentService.submitAssessment(assessmentId, answersArray)

      // Clear localStorage
      localStorage.removeItem(`assessment_${assessmentId}_answers`)
      localStorage.removeItem(`assessment_${assessmentId}_timer`)

      // Load submission details
      const submissionResponse = await studentService.getAssessmentSubmission(assessmentId)
      setSubmission(submissionResponse.data)

      setState(ASSESSMENT_STATES.RESULTS)

      if (!autoSubmit) {
        toast.success('Assessment submitted successfully!')
      }
    } catch (err) {
      console.error('Error submitting assessment:', err)
      toast.error(err.response?.data?.message || 'Failed to submit assessment')
      setState(ASSESSMENT_STATES.TAKING)
    }
  }

  const handleConfirmSubmit = () => {
    setShowSubmitDialog(false)
    submitAssessment(false)
  }

  // Get all questions for navigation
  const getAllQuestions = () => {
    if (!assessment) return []
    return assessment.passages.flatMap(p => p.questions)
  }

  // Handle navigation to a specific question (may require changing passage)
  const handleNavigateToQuestion = (questionId) => {
    // Find which passage contains this question
    const passageIndex = assessment.passages.findIndex(passage =>
      passage.questions.some(q => q.id === questionId)
    )

    if (passageIndex !== -1) {
      // Switch to the correct passage first
      setCurrentPassageIndex(passageIndex)

      // Update current question
      setCurrentQuestionId(questionId)

      // Wait for render, then scroll to question
      setTimeout(() => {
        const element = document.getElementById(`question-${questionId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  // Render different states
  if (state === ASSESSMENT_STATES.LOADING) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Confirmation state (tests only)
  if (state === ASSESSMENT_STATES.CONFIRMATION && assessment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              {assessment.title}
            </CardTitle>
            <CardDescription>Timed Test - Read Before Starting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a timed test. Once you click "Start Test", the timer will begin and cannot be paused.
                Make sure you are ready before starting.
              </AlertDescription>
            </Alert>

            {assessment.instructions && (
              <div>
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <p className="text-sm text-muted-foreground">{assessment.instructions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{assessment.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{assessment.duration}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStartTest} className="flex-1">
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Taking assessment state
  if (state === ASSESSMENT_STATES.TAKING && assessment) {
    const allQuestions = getAllQuestions()
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== null).length
    const currentPassage = assessment.passages[currentPassageIndex]
    const totalPassages = assessment.passages.length

    // Calculate starting question number for this passage
    const startingQuestionNumber = assessment.passages
      .slice(0, currentPassageIndex)
      .reduce((sum, p) => sum + p.questions.length, 0)

    return (
      <div className="min-h-screen bg-muted/30 pb-16">
        {/* Timer (if timed) */}
        {assessment.duration && timerStartTime && (
          <AssessmentTimer
            assessmentId={assessmentId}
            durationInMinutes={assessment.duration}
            startTime={timerStartTime}
            onTimeUp={handleTimeUp}
          />
        )}

        {/* Header */}
        <div className="bg-background border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">{assessment.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {answeredCount} of {allQuestions.length} answered
                </p>
              </div>
              <Button onClick={handleSubmitClick} size="lg">
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-6">
          {/* Passage pagination controls and question navigation */}
          <div className="mb-6 space-y-4">
            {totalPassages > 1 && (
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Passage {currentPassageIndex + 1} of {totalPassages}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPassageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentPassageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous Passage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPassageIndex(prev => Math.min(totalPassages - 1, prev + 1))}
                    disabled={currentPassageIndex === totalPassages - 1}
                  >
                    Next Passage
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Question navigation - horizontal layout (desktop only) */}
            <div className="hidden lg:block">
              <QuestionNavigation
                questions={allQuestions}
                answers={answers}
                currentQuestionId={currentQuestionId}
                onNavigate={handleNavigateToQuestion}
              />
            </div>
          </div>

          {/* Single passage view */}
          <div
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
          >
            {/* Passage */}
            <div className="lg:col-span-2">
              <Card className="p-6 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                <PassageRenderer
                  title={currentPassage.title}
                  content={currentPassage.content}
                  imageURL={currentPassage.imageURL}
                />
              </Card>
            </div>

            {/* Questions */}
            <div className="lg:col-span-3 space-y-4">
              {currentPassage.questions.map((question, qIndex) => {
                const questionNumber = startingQuestionNumber + qIndex + 1
                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    questionNumber={questionNumber}
                    selectedChoiceId={answers[question.id]}
                    onSelectChoice={(choiceId) => handleSelectAnswer(question.id, choiceId)}
                  />
                )
              })}
            </div>
          </div>

          {/* Bottom passage navigation (duplicated for easier access) */}
          {totalPassages > 1 && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Passage {currentPassageIndex + 1} of {totalPassages}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPassageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentPassageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous Passage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPassageIndex(prev => Math.min(totalPassages - 1, prev + 1))}
                    disabled={currentPassageIndex === totalPassages - 1}
                  >
                    Next Passage
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit? You cannot change your answers after submission.
                {answeredCount < allQuestions.length && (
                  <div className="mt-2 text-yellow-600">
                    Warning: You have {allQuestions.length - answeredCount} unanswered question(s).
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSubmit}>
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Submitting state
  if (state === ASSESSMENT_STATES.SUBMITTING) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Submitting your assessment...</p>
          </div>
        </div>
      </div>
    )
  }

  // Results state
  if (state === ASSESSMENT_STATES.RESULTS && submission) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
              ← Back to Course
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">{submission.assessmentTitle}</h1>
            <p className="text-muted-foreground">Assessment Results</p>
          </div>

          {/* Score display */}
          <div className="mb-8">
            <ScoreDisplay
              score={submission.score}
              totalQuestions={submission.totalQuestions}
              submittedAt={submission.submittedAt}
              assessmentTitle={submission.assessmentTitle}
            />
          </div>

          {/* Answer review */}
          <AnswerReview submission={submission} />
        </div>
      </div>
    )
  }

  return null
}
