import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from 'lucide-react'

export default function TestPreview({ testData }) {
  const choiceLabels = ['A', 'B', 'C', 'D']

  const getTotalQuestions = () => {
    return testData.passages.reduce((total, passage) => total + passage.questions.length, 0)
  }

  const getContentWithLineNumbers = (htmlContent) => {
    if (!htmlContent) return []

    // Remove HTML tags and split into lines
    const text = htmlContent.replace(/<[^>]*>/g, '\n').split('\n').filter(line => line.trim())
    return text
  }

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">{testData.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{testData.duration} minutes</span>
          </div>
          <Badge variant="secondary">{getTotalQuestions()} Questions</Badge>
          <Badge variant="secondary">{testData.passages.length} Passages</Badge>
        </div>
        {testData.instructions && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm">{testData.instructions}</p>
          </div>
        )}
      </div>

      {/* Passages and Questions */}
      {testData.passages.map((passage, pIndex) => (
        <div key={passage.id} className="space-y-6">
          {/* Passage Content */}
          <Card>
            <CardContent className="pt-6">
              {passage.title && (
                <h3 className="font-semibold text-lg mb-4">{passage.title}</h3>
              )}

              {passage.imageURL && (
                <div className="mb-4">
                  <img
                    src={passage.imageURL}
                    alt="Passage illustration"
                    className="max-w-full h-auto rounded border"
                  />
                </div>
              )}

              {/* Passage Text with Line Numbers */}
              <div className="flex gap-4">
                <div className="text-right text-xs text-muted-foreground font-mono space-y-1 select-none">
                  {getContentWithLineNumbers(passage.content).map((_, i) => (
                    <div key={i} className="leading-relaxed">{i + 1}</div>
                  ))}
                </div>
                <div
                  className="flex-1 prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: passage.content }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions for this Passage */}
          <div className="space-y-4 pl-8">
            {passage.questions.map((question, qIndex) => {
              const absoluteQuestionNumber = testData.passages
                .slice(0, pIndex)
                .reduce((sum, p) => sum + p.questions.length, 0) + qIndex + 1

              return (
                <Card key={question.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <Badge variant="outline" className="mb-2">
                        Question {absoluteQuestionNumber}
                      </Badge>
                      <p className="font-medium">{question.questionText}</p>
                    </div>

                    <div className="space-y-2">
                      {question.choices.map((choice, cIndex) => (
                        <div
                          key={choice.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            choice.isCorrect
                              ? 'bg-green-50 border-green-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-400 flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium">
                                {choiceLabels[cIndex]}
                              </span>
                            </div>
                            <p className="flex-1">{choice.choiceText}</p>
                            {choice.isCorrect && (
                              <Badge variant="success" className="text-xs">
                                Correct
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {testData.passages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No passages to preview. Add passages to see the test preview.</p>
        </div>
      )}
    </div>
  )
}
