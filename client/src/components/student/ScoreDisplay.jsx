/**
 * ScoreDisplay Component
 * Shows assessment results with score breakdown
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

export default function ScoreDisplay({ score, totalQuestions, submittedAt, assessmentTitle }) {
  const percentage = ((score / totalQuestions) * 100).toFixed(1)
  const incorrectCount = totalQuestions - score

  // Determine performance level
  let performanceColor = 'text-red-600'
  let performanceText = 'Needs Improvement'
  let performanceBg = 'bg-red-50'

  if (percentage >= 90) {
    performanceColor = 'text-green-600'
    performanceText = 'Excellent!'
    performanceBg = 'bg-green-50'
  } else if (percentage >= 80) {
    performanceColor = 'text-blue-600'
    performanceText = 'Great Job!'
    performanceBg = 'bg-blue-50'
  } else if (percentage >= 70) {
    performanceColor = 'text-yellow-600'
    performanceText = 'Good'
    performanceBg = 'bg-yellow-50'
  }

  return (
    <div className="space-y-6">
      <Card className={`${performanceBg} border-2`}>
        <CardHeader>
          <CardTitle className="text-center">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className={`h-12 w-12 ${performanceColor}`} />
              <span className={`text-3xl font-bold ${performanceColor}`}>
                {percentage}%
              </span>
              <span className={`text-lg ${performanceColor}`}>
                {performanceText}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-foreground">{score}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Correct
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-foreground">{incorrectCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4 text-red-600" />
                Incorrect
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-foreground">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
            Submitted: {new Date(submittedAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Review your answers below to see which questions you got right and wrong.
      </div>
    </div>
  )
}
