/**
 * QuestionNavigation Component
 * Sidebar showing all questions with answered status and quick navigation
 */
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle } from 'lucide-react'

export default function QuestionNavigation({ questions, answers, currentQuestionId, onNavigate }) {
  return (
    <div className="question-navigation border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-foreground">Questions</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>{Object.keys(answers).filter(k => answers[k] !== null).length}/{questions.length}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => {
          const isAnswered = answers[question.id] !== undefined && answers[question.id] !== null
          const isCurrent = question.id === currentQuestionId

          return (
            <Button
              key={question.id}
              type="button"
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNavigate(question.id)}
              className={`relative h-9 w-12 ${isCurrent ? '' : isAnswered ? 'border-green-500' : ''}`}
            >
              {index + 1}
              {isAnswered && !isCurrent && (
                <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-green-600 bg-white rounded-full" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
