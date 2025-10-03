import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, GripVertical, AlertCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export default function QuestionBuilder({
  question,
  passageIndex,
  questionIndex,
  onUpdate,
  onDelete,
  errors
}) {
  const handleQuestionTextChange = (questionText) => {
    onUpdate({ ...question, questionText })
  }

  const handleChoiceChange = (choiceIndex, choiceText) => {
    onUpdate({
      ...question,
      choices: question.choices.map((c, i) =>
        i === choiceIndex ? { ...c, choiceText } : c
      )
    })
  }

  const handleCorrectAnswerChange = (choiceIndex) => {
    onUpdate({
      ...question,
      choices: question.choices.map((c, i) => ({
        ...c,
        isCorrect: i === parseInt(choiceIndex)
      }))
    })
  }

  const correctChoiceIndex = question.choices.findIndex(c => c.isCorrect)
  const choiceLabels = ['A', 'B', 'C', 'D']

  const hasErrors = Object.keys(errors).some(key =>
    key.startsWith(`passage-${passageIndex}-question-${questionIndex}`)
  )

  return (
    <Card className={`${hasErrors ? 'border-red-300 bg-red-50/50' : ''}`}>
      <CardContent className="pt-4 space-y-4">
        {/* Question Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            <Badge variant="outline">Q{questionIndex + 1}</Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor={`q-${passageIndex}-${questionIndex}-text`}>
            Question Text *
          </Label>
          <Textarea
            id={`q-${passageIndex}-${questionIndex}-text`}
            value={question.questionText}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            placeholder="Enter the question..."
            rows={2}
            className={
              errors[`passage-${passageIndex}-question-${questionIndex}-text`]
                ? 'border-red-500'
                : ''
            }
          />
          {errors[`passage-${passageIndex}-question-${questionIndex}-text`] && (
            <p className="text-sm text-red-600">
              {errors[`passage-${passageIndex}-question-${questionIndex}-text`]}
            </p>
          )}
        </div>

        {/* Answer Choices */}
        <div className="space-y-3">
          <Label>Answer Choices *</Label>

          <RadioGroup
            value={correctChoiceIndex.toString()}
            onValueChange={handleCorrectAnswerChange}
          >
            {question.choices.map((choice, choiceIndex) => (
              <div
                key={choice.id}
                className={`flex items-start gap-3 p-3 border rounded-lg ${
                  choice.isCorrect ? 'bg-green-50 border-green-300' : 'bg-white'
                }`}
              >
                <RadioGroupItem
                  value={choiceIndex.toString()}
                  id={`q-${passageIndex}-${questionIndex}-choice-${choiceIndex}`}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`q-${passageIndex}-${questionIndex}-choice-${choiceIndex}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Choice {choiceLabels[choiceIndex]}
                    {choice.isCorrect && (
                      <Badge variant="success" className="ml-2 text-xs">
                        Correct
                      </Badge>
                    )}
                  </Label>
                  <Input
                    value={choice.choiceText}
                    onChange={(e) => handleChoiceChange(choiceIndex, e.target.value)}
                    placeholder={`Enter choice ${choiceLabels[choiceIndex]}...`}
                    className={
                      errors[
                        `passage-${passageIndex}-question-${questionIndex}-choice-${choiceIndex}`
                      ]
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {errors[
                    `passage-${passageIndex}-question-${questionIndex}-choice-${choiceIndex}`
                  ] && (
                    <p className="text-xs text-red-600">
                      {
                        errors[
                          `passage-${passageIndex}-question-${questionIndex}-choice-${choiceIndex}`
                        ]
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>

          {/* Validation Messages */}
          {errors[`passage-${passageIndex}-question-${questionIndex}-choices`] && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{errors[`passage-${passageIndex}-question-${questionIndex}-choices`]}</p>
            </div>
          )}

          {errors[`passage-${passageIndex}-question-${questionIndex}-correct`] && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{errors[`passage-${passageIndex}-question-${questionIndex}-correct`]}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Select the radio button next to the correct answer choice.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
