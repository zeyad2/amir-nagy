/**
 * AssessmentTimer Component
 * Countdown timer with localStorage persistence for timed assessments
 */
import { useState, useEffect, useRef } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AssessmentTimer({
  assessmentId,
  durationInMinutes,
  onTimeUp,
  startTime // ISO string of when timer started
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(null)
  const [isWarning, setIsWarning] = useState(false)
  const intervalRef = useRef(null)
  const timeUpCalledRef = useRef(false)

  useEffect(() => {
    if (!durationInMinutes || !startTime) return

    const calculateTimeRemaining = () => {
      const start = new Date(startTime).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - start) / 1000)
      const total = durationInMinutes * 60
      const remaining = total - elapsed

      return Math.max(0, remaining)
    }

    // Initialize timer
    const remaining = calculateTimeRemaining()
    setSecondsRemaining(remaining)

    // Save to localStorage
    localStorage.setItem(`assessment_${assessmentId}_timer`, JSON.stringify({
      startTime,
      durationInMinutes
    }))

    // Check if time is already up
    if (remaining === 0 && !timeUpCalledRef.current) {
      timeUpCalledRef.current = true
      onTimeUp()
      return
    }

    // Set up interval to update every second
    intervalRef.current = setInterval(() => {
      const newRemaining = calculateTimeRemaining()
      setSecondsRemaining(newRemaining)

      // Warning at 5 minutes
      if (newRemaining <= 300 && newRemaining > 0) {
        setIsWarning(true)
      }

      // Time's up
      if (newRemaining === 0 && !timeUpCalledRef.current) {
        timeUpCalledRef.current = true
        clearInterval(intervalRef.current)
        onTimeUp()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [assessmentId, durationInMinutes, startTime])

  if (secondsRemaining === null) return null

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-mono text-lg font-semibold
                      ${isWarning ? 'bg-red-100 text-red-700 border-2 border-red-500 animate-pulse' : 'bg-card border-2 border-border'}`}>
        <Clock className={`h-5 w-5 ${isWarning ? 'text-red-600' : 'text-muted-foreground'}`} />
        <span>{formattedTime}</span>
      </div>

      {isWarning && (
        <Alert className="mt-2 bg-yellow-50 border-yellow-500">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800">
            Less than 5 minutes remaining!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
