/**
 * QuestionCard Component
 * Displays a single SAT-style question with multiple choice options
 */
import ChoiceButton from './ChoiceButton'

export default function QuestionCard({
  question,
  questionNumber,
  selectedChoiceId,
  onSelectChoice,
  disabled = false,
  isReviewMode = false,
  correctChoiceId = null
}) {
  const choiceLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="question-card border rounded-lg p-6 bg-card select-none" id={`question-${question.id}`}>
      {/* Question number and text */}
      <div className="mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground
                         flex items-center justify-center font-semibold text-sm">
            {questionNumber}
          </div>
          <div className="flex-1">
            <p className="text-base leading-relaxed text-foreground">
              {question.questionText}
            </p>
          </div>
        </div>
      </div>

      {/* Choices */}
      <div className="space-y-3 ml-11">
        {question.choices.map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            label={choiceLabels[index]}
            selected={selectedChoiceId === choice.id}
            onSelect={onSelectChoice}
            disabled={disabled}
            isReviewMode={isReviewMode}
            showCorrectAnswer={isReviewMode}
            isCorrectChoice={correctChoiceId === choice.id}
          />
        ))}
      </div>
    </div>
  )
}
