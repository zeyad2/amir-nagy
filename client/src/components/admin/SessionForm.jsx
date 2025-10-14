import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { Calendar } from 'lucide-react'

export default function SessionForm({ open, onOpenChange, onSubmit, loading }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convert date to ISO format
    const sessionDate = new Date(date)

    // Call onSubmit prop with form data
    await onSubmit({ title: title || null, date: sessionDate.toISOString() })

    // Reset form
    setTitle('')
    setDate('')
  }

  const handleCancel = () => {
    setTitle('')
    setDate('')
    onOpenChange(false)
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Add Session</span>
          </DialogTitle>
          <DialogDescription>
            Create a new session for this live course to track attendance and schedule.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title Field (Optional) */}
            <div>
              <Label htmlFor="title">
                Session Title <span className="text-gray-500 text-sm">(optional)</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Session 1: Introduction"
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                If left empty, session will be numbered automatically
              </p>
            </div>

            {/* Date Field (Required) */}
            <div>
              <Label htmlFor="date">
                Session Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Select the date and time for this session
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !date}
            >
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
