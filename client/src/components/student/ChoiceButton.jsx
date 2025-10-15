/**
 * ChoiceButton Component
 * SAT-style multiple choice button with cross-out elimination feature
 */
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChoiceButton({
  choice,
  label, // A, B, C, D
  selected,
  onSelect,
  disabled = false,
  showCorrectAnswer = false,
  isCorrectChoice = false,
  isReviewMode = false
}) {
  const [crossedOut, setCrossedOut] = useState(false)

  const handleCrossOut = (e) => {
    e.stopPropagation()
    if (!disabled && !isReviewMode) {
      setCrossedOut(!crossedOut)
    }
  }

  const handleSelect = () => {
    if (!disabled && !isReviewMode) {
      onSelect(choice.id)
    }
  }

  // Determine button styling based on state
  let buttonClass = 'relative flex items-start gap-3 w-full min-h-[60px] p-4 text-left transition-all border-2 rounded-lg select-none'

  if (isReviewMode) {
    // Review mode: show correct/incorrect
    if (showCorrectAnswer && isCorrectChoice) {
      buttonClass += ' bg-green-50 border-green-500 hover:bg-green-50'
    } else if (selected && !isCorrectChoice) {
      buttonClass += ' bg-red-50 border-red-500 hover:bg-red-50'
    } else if (selected) {
      buttonClass += ' bg-green-50 border-green-500 hover:bg-green-50'
    } else {
      buttonClass += ' bg-background border-border hover:bg-muted/50'
    }
  } else {
    // Taking mode
    if (selected) {
      buttonClass += ' bg-blue-50 border-blue-500 hover:bg-blue-100'
    } else {
      buttonClass += ' bg-background border-border hover:bg-muted'
    }
  }

  if (crossedOut) {
    buttonClass += ' opacity-50'
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled}
        className={buttonClass}
      >
        {/* Choice label (A, B, C, D) */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                        ${selected ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}
                        ${isReviewMode && isCorrectChoice ? 'bg-green-500 text-white' : ''}
                        ${isReviewMode && selected && !isCorrectChoice ? 'bg-red-500 text-white' : ''}
                        `}>
          {label}
        </div>

        {/* Choice text */}
        <div className={`flex-1 text-sm leading-relaxed ${crossedOut ? 'line-through' : ''}`}>
          {choice.choiceText}
        </div>

        {/* Cross-out button */}
        {!disabled && !isReviewMode && (
          <button
            type="button"
            onClick={handleCrossOut}
            className="absolute top-2 right-2 h-6 w-6 p-1 rounded hover:bg-muted"
          >
            <X className={`h-4 w-4 ${crossedOut ? 'text-red-500' : 'text-muted-foreground'}`} />
          </button>
        )}

        {/* Correct answer indicator in review mode */}
        {isReviewMode && isCorrectChoice && (
          <div className="absolute top-2 right-2 text-green-600 font-semibold text-xs">
            ✓ Correct
          </div>
        )}
      </button>
    </div>
  )
}
