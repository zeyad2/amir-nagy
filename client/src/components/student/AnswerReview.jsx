/**
 * AnswerReview Component
 * Displays passages with questions in paginated view
 */
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import PassageRenderer from './PassageRenderer'

export default function AnswerReview({ submission }) {
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)

  if (!submission.passages || submission.passages.length === 0) {
    return <div className="text-muted-foreground">No passages to review.</div>
  }

  const currentPassage = submission.passages[currentPassageIndex]
  const totalPassages = submission.passages.length

  // Calculate starting question number for this passage
  const startingQuestionNumber = submission.passages
    .slice(0, currentPassageIndex)
    .reduce((sum, p) => sum + p.questions.length, 0) + 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Detailed Review</h2>
        {totalPassages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPassageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPassageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Passage {currentPassageIndex + 1} of {totalPassages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPassageIndex(prev => Math.min(totalPassages - 1, prev + 1))}
              disabled={currentPassageIndex === totalPassages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Passage and Questions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
          {currentPassage.questions.map((answer, qIndex) => {
            const correctChoice = answer.allChoices.find(c => c.isCorrect)
            const questionNumber = startingQuestionNumber + qIndex

            return (
              <Card key={answer.questionId} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {questionNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed text-foreground font-medium">
                        {answer.questionText}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Choices */}
                  <div className="space-y-2 ml-11">
                    {answer.allChoices.map((choice) => {
                      const isSelected = choice.isSelected
                      const isCorrect = choice.isCorrect

                      let bgColor = 'bg-background'
                      let borderColor = 'border-border'

                      if (isSelected && isCorrect) {
                        bgColor = 'bg-green-50'
                        borderColor = 'border-green-500'
                      } else if (isSelected && !isCorrect) {
                        bgColor = 'bg-red-50'
                        borderColor = 'border-red-500'
                      } else if (!isSelected && isCorrect) {
                        bgColor = 'bg-green-50'
                        borderColor = 'border-green-300'
                      }

                      return (
                        <div
                          key={choice.id}
                          className={`relative flex items-start gap-3 p-3 rounded-lg border-2 ${bgColor} ${borderColor}`}
                        >
                          <div className="flex-1 text-sm">
                            {choice.text}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 text-xs font-semibold">
                              Your Answer
                            </div>
                          )}
                          {!isSelected && isCorrect && (
                            <div className="flex-shrink-0 text-xs font-semibold text-green-700">
                              Correct Answer
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  {!answer.isCorrect && (
                    <div className="mt-4 ml-11 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                      <span className="font-semibold text-red-800">Incorrect. </span>
                      <span className="text-red-700">
                        The correct answer is <strong>{correctChoice?.text}</strong>
                      </span>
                    </div>
                  )}

                  {answer.isCorrect && (
                    <div className="mt-4 ml-11 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                      <span className="font-semibold text-green-800">✓ Correct!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
