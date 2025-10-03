import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import PassageEditor from '../tests/PassageEditor'
import TestPreview from '../tests/TestPreview'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function HomeworkEditor({ homework, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    passages: []
  })
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [errors, setErrors] = useState({})

  // Load homework data if editing
  useEffect(() => {
    if (homework) {
      // Map the backend data structure to our form structure
      const mappedPassages = (homework.passages || []).map((passage, pIndex) => ({
        id: passage.id || `temp-${Date.now()}-${pIndex}`,
        title: passage.title || '',
        content: passage.content || '',
        imageURL: passage.imageURL || null,
        order: passage.order !== undefined ? passage.order : pIndex,
        questions: (passage.questions || []).map((question, qIndex) => ({
          id: question.id || `temp-q-${Date.now()}-${qIndex}`,
          questionText: question.questionText || '',
          order: question.order !== undefined ? question.order : qIndex,
          choices: (question.choices || []).map((choice, cIndex) => ({
            id: choice.id || `temp-c-${Date.now()}-${cIndex}`,
            choiceText: choice.choiceText || '',
            isCorrect: choice.isCorrect || false,
            order: choice.order !== undefined ? choice.order : cIndex
          }))
        }))
      }))

      setFormData({
        title: homework.title || '',
        instructions: homework.instructions || '',
        passages: mappedPassages
      })
    }
  }, [homework])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleAddPassage = () => {
    const newPassage = {
      id: `temp-${Date.now()}`,
      title: '',
      content: '',
      imageURL: null,
      order: formData.passages.length,
      questions: []
    }
    setFormData(prev => ({
      ...prev,
      passages: [...prev.passages, newPassage]
    }))
  }

  const handleUpdatePassage = (index, updatedPassage) => {
    setFormData(prev => ({
      ...prev,
      passages: prev.passages.map((p, i) => i === index ? updatedPassage : p)
    }))
  }

  const handleDeletePassage = (index) => {
    setFormData(prev => ({
      ...prev,
      passages: prev.passages.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i }))
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Homework title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title cannot exceed 255 characters'
    }

    if (formData.instructions && formData.instructions.length > 2000) {
      newErrors.instructions = 'Instructions cannot exceed 2000 characters'
    }

    if (formData.passages.length === 0) {
      newErrors.passages = 'Homework must have at least one passage'
    }

    // Validate each passage
    formData.passages.forEach((passage, pIndex) => {
      if (!passage.content || passage.content.trim().length < 10) {
        newErrors[`passage-${pIndex}-content`] = 'Passage content must be at least 10 characters'
      }

      if (passage.questions.length === 0) {
        newErrors[`passage-${pIndex}-questions`] = 'Each passage must have at least one question'
      }

      // Validate each question
      passage.questions.forEach((question, qIndex) => {
        if (!question.questionText || question.questionText.trim().length < 5) {
          newErrors[`passage-${pIndex}-question-${qIndex}-text`] = 'Question text must be at least 5 characters'
        }

        if (question.choices.length !== 4) {
          newErrors[`passage-${pIndex}-question-${qIndex}-choices`] = 'Each question must have exactly 4 choices'
        }

        const correctCount = question.choices.filter(c => c.isCorrect).length
        if (correctCount !== 1) {
          newErrors[`passage-${pIndex}-question-${qIndex}-correct`] = 'Exactly one choice must be marked as correct'
        }

        question.choices.forEach((choice, cIndex) => {
          if (!choice.choiceText || choice.choiceText.trim().length === 0) {
            newErrors[`passage-${pIndex}-question-${qIndex}-choice-${cIndex}`] = 'Choice text cannot be empty'
          }
        })
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    try {
      setSaving(true)

      // Prepare data for API (remove temp IDs and format correctly)
      const dataToSave = {
        title: formData.title.trim(),
        instructions: formData.instructions?.trim() || '',
        passages: formData.passages.map((passage, pIndex) => ({
          title: passage.title?.trim() || '',
          content: passage.content,
          imageURL: passage.imageURL || '',
          order: pIndex,
          questions: passage.questions.map((question, qIndex) => ({
            questionText: question.questionText,
            order: qIndex,
            choices: question.choices.map((choice, cIndex) => ({
              choiceText: choice.choiceText,
              isCorrect: choice.isCorrect,
              order: cIndex
            }))
          }))
        }))
      }

      await onSave(dataToSave)
    } catch (error) {
      console.error('Error saving homework:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTotalQuestions = () => {
    return formData.passages.reduce((total, passage) => total + passage.questions.length, 0)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Homework Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Homework Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Homework Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., SAT Reading Homework 1"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions (optional)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="Enter homework instructions..."
                rows={3}
                className={errors.instructions ? 'border-red-500' : ''}
              />
              {errors.instructions && (
                <p className="text-sm text-red-600">{errors.instructions}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.instructions.length} / 2000 characters
              </p>
            </div>

            {/* Homework Stats */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">Passages:</span>{' '}
                <span className="font-medium">{formData.passages.length}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Questions:</span>{' '}
                <span className="font-medium">{getTotalQuestions()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Passages & Questions</h3>
            <Button type="button" onClick={handleAddPassage} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Passage
            </Button>
          </div>

          {errors.passages && (
            <p className="text-sm text-red-600">{errors.passages}</p>
          )}

          {formData.passages.map((passage, index) => (
            <PassageEditor
              key={passage.id}
              passage={passage}
              index={index}
              onUpdate={(updatedPassage) => handleUpdatePassage(index, updatedPassage)}
              onDelete={() => handleDeletePassage(index)}
              errors={errors}
            />
          ))}

          {formData.passages.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No passages added yet. Click "Add Passage" to create your first passage.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between sticky bottom-0 bg-background border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              disabled={formData.passages.length === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <LoadingSpinner className="h-4 w-4 mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              {homework ? 'Update Homework' : 'Create Homework'}
            </Button>
          </div>
        </div>
      </form>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Homework Preview</DialogTitle>
          </DialogHeader>
          <TestPreview testData={formData} />
        </DialogContent>
      </Dialog>
    </>
  )
}
