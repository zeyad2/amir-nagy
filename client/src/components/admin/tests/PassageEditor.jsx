import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, GripVertical, Plus } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import PassageImageUpload from './PassageImageUpload'
import QuestionBuilder from './QuestionBuilder'
import { Badge } from "@/components/ui/badge"

const MenuBar = ({ editor }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
        Line Break
      </Button>
    </div>
  )
}

export default function PassageEditor({ passage, index, onUpdate, onDelete, errors }) {
  const [showLineNumbers, setShowLineNumbers] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Enter passage content... Use SAT-style formatting with proper paragraphs.',
      }),
    ],
    content: passage.content || '',
    onUpdate: ({ editor }) => {
      onUpdate({
        ...passage,
        content: editor.getHTML()
      })
    },
  })

  const handleTitleChange = (title) => {
    onUpdate({ ...passage, title })
  }

  const handleImageUpload = (imageURL) => {
    onUpdate({ ...passage, imageURL })
  }

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `temp-q-${Date.now()}`,
      questionText: '',
      order: passage.questions.length,
      choices: [
        { id: `temp-c-${Date.now()}-0`, choiceText: '', isCorrect: false, order: 0 },
        { id: `temp-c-${Date.now()}-1`, choiceText: '', isCorrect: false, order: 1 },
        { id: `temp-c-${Date.now()}-2`, choiceText: '', isCorrect: false, order: 2 },
        { id: `temp-c-${Date.now()}-3`, choiceText: '', isCorrect: false, order: 3 },
      ]
    }
    onUpdate({
      ...passage,
      questions: [...passage.questions, newQuestion]
    })
  }

  const handleUpdateQuestion = (qIndex, updatedQuestion) => {
    onUpdate({
      ...passage,
      questions: passage.questions.map((q, i) => i === qIndex ? updatedQuestion : q)
    })
  }

  const handleDeleteQuestion = (qIndex) => {
    onUpdate({
      ...passage,
      questions: passage.questions.filter((_, i) => i !== qIndex).map((q, i) => ({ ...q, order: i }))
    })
  }

  // Extract lines from HTML content for line numbering
  const getContentLines = (htmlContent) => {
    if (!htmlContent) return []

    // Create a temporary div to parse HTML
    const temp = document.createElement('div')
    temp.innerHTML = htmlContent

    // Get all text nodes and block elements
    const lines = []
    const traverse = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim()
        if (text) {
          // Split by actual line breaks in text
          text.split('\n').forEach(line => {
            if (line.trim()) lines.push(line)
          })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Handle block elements as new lines
        if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(node.nodeName)) {
          const text = node.textContent.trim()
          if (text) lines.push(text)
        } else if (node.nodeName === 'BR') {
          lines.push('')
        } else {
          // Traverse children for inline elements
          Array.from(node.childNodes).forEach(traverse)
        }
      }
    }

    Array.from(temp.childNodes).forEach(traverse)
    return lines
  }

  const contentLines = getContentLines(passage.content)

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
            <CardTitle className="text-base">Passage {index + 1}</CardTitle>
            <Badge variant="secondary">{passage.questions.length} questions</Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Passage Title */}
        <div className="space-y-2">
          <Label htmlFor={`passage-${index}-title`}>Passage Title (optional)</Label>
          <Input
            id={`passage-${index}-title`}
            value={passage.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., The History of Space Exploration"
          />
        </div>

        {/* Image Upload */}
        <PassageImageUpload
          imageURL={passage.imageURL}
          onImageUpload={handleImageUpload}
          passageIndex={index}
        />

        {/* Passage Content Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Passage Content *</Label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
            >
              {showLineNumbers ? 'Hide' : 'Show'} Line Numbers
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <MenuBar editor={editor} />
            <div
              className={`${showLineNumbers ? 'flex' : ''}`}
              onClick={() => editor?.commands.focus()}
            >
              {showLineNumbers && (
                <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground font-mono border-r">
                  {contentLines.map((_, i) => (
                    <div key={i} className="leading-relaxed">{i + 1}</div>
                  ))}
                </div>
              )}
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-[45ch] p-4 min-h-[300px] focus:outline-none cursor-text flex-1"
              />
            </div>
          </div>
          {errors[`passage-${index}-content`] && (
            <p className="text-sm text-red-600">{errors[`passage-${index}-content`]}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Use formatting tools to create SAT-style passages with proper paragraphs and line breaks.
          </p>
        </div>

        {/* Questions Section */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Questions</h4>
            <Button type="button" size="sm" variant="outline" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {errors[`passage-${index}-questions`] && (
            <p className="text-sm text-red-600">{errors[`passage-${index}-questions`]}</p>
          )}

          {passage.questions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No questions added yet. Click "Add Question" to create questions for this passage.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {passage.questions.map((question, qIndex) => (
                <QuestionBuilder
                  key={question.id}
                  question={question}
                  passageIndex={index}
                  questionIndex={qIndex}
                  onUpdate={(updatedQuestion) => handleUpdateQuestion(qIndex, updatedQuestion)}
                  onDelete={() => handleDeleteQuestion(qIndex)}
                  errors={errors}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
