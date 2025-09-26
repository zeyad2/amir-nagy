import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-hot-toast"
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  DollarSign,
  Settings,
  CalendarDays,
  Target,
  BookOpen,
  X,
  Save
} from 'lucide-react'
import { storageService } from '@/services/storage.service'

export default function AccessWindowManager({ courseId, courseData }) {
  const [accessWindows, setAccessWindows] = useState([])
  const [courseSessions, setCourseSessions] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false)

  // Form states
  const [selectedEnrollment, setSelectedEnrollment] = useState('')
  const [accessType, setAccessType] = useState('partial') // 'full', 'partial', 'late_join'
  const [startSession, setStartSession] = useState('')
  const [endSession, setEndSession] = useState('')
  const [editingWindow, setEditingWindow] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  // Bulk operations
  const [selectedWindows, setSelectedWindows] = useState([])
  const [bulkOperationMode, setBulkOperationMode] = useState(false)

  // Fetch data on component mount
  useEffect(() => {
    if (courseId) {
      fetchCourseSessions()
      fetchEnrollments()
    }
  }, [courseId])

  // Fetch course sessions for dropdowns
  const fetchCourseSessions = async () => {
    try {
      const token = storageService.getToken()
      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch course sessions')
      }

      const data = await response.json()
      setCourseSessions(data.data.sessions)
    } catch (err) {
      console.error('Error fetching sessions:', err)
      toast.error('Failed to load course sessions')
    }
  }

  // Fetch course enrollments
  const fetchEnrollments = async () => {
    try {
      const token = storageService.getToken()
      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}/enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch enrollments')
      }

      const data = await response.json()
      setEnrollments(data.data.enrollments || [])
    } catch (err) {
      console.error('Error fetching enrollments:', err)
      // Continue even if this fails - not critical for UI demo
    } finally {
      setLoading(false)
    }
  }

  // Fetch access windows for a specific enrollment
  const fetchAccessWindows = async (enrollmentId) => {
    try {
      const token = storageService.getToken()
      const response = await fetch(`http://localhost:5000/api/admin/enrollments/${enrollmentId}/access-windows`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch access windows')
      }

      const data = await response.json()
      return data.data.accessWindows || []
    } catch (err) {
      console.error('Error fetching access windows:', err)
      return []
    }
  }

  // Create access window
  const createAccessWindow = async () => {
    try {
      if (!selectedEnrollment) {
        toast.error('Please select an enrollment')
        return
      }

      if (accessType !== 'full' && (!startSession || !endSession)) {
        toast.error('Please select start and end sessions')
        return
      }

      const token = storageService.getToken()
      const requestBody = {
        startSessionId: startSession,
        endSessionId: endSession
      }

      const response = await fetch(`http://localhost:5000/api/admin/enrollments/${selectedEnrollment}/access-windows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create access window')
      }

      toast.success('Access window created successfully')
      setCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Delete access window
  const deleteAccessWindow = async (windowId) => {
    try {
      const token = storageService.getToken()
      const response = await fetch(`http://localhost:5000/api/admin/access-windows/${windowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete access window')
      }

      toast.success('Access window deleted successfully')
      // Refresh the data
      if (selectedEnrollment) {
        const windows = await fetchAccessWindows(selectedEnrollment)
        setAccessWindows(windows)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Generate preview data for access window
  const generatePreview = (startSessionId, endSessionId) => {
    if (!startSessionId || !endSessionId || courseSessions.length === 0) {
      return null
    }

    const startIndex = courseSessions.findIndex(s => s.id === startSessionId)
    const endIndex = courseSessions.findIndex(s => s.id === endSessionId)

    if (startIndex === -1 || endIndex === -1) return null

    const sessionCount = endIndex - startIndex + 1
    const accessibleSessions = courseSessions.slice(startIndex, endIndex + 1)

    // Mock pricing calculation - would come from backend in real implementation
    const basePrice = courseData?.price || 1000
    const pricePerSession = Math.round(basePrice / courseSessions.length)
    const calculatedPrice = pricePerSession * sessionCount

    return {
      sessionCount,
      totalSessions: courseSessions.length,
      accessibleSessions,
      calculatedPrice,
      pricePerSession,
      startDate: accessibleSessions[0]?.date,
      endDate: accessibleSessions[accessibleSessions.length - 1]?.date
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedEnrollment('')
    setAccessType('partial')
    setStartSession('')
    setEndSession('')
    setEditingWindow(null)
  }

  // Handle bulk selection
  const toggleWindowSelection = (windowId) => {
    setSelectedWindows(prev =>
      prev.includes(windowId)
        ? prev.filter(id => id !== windowId)
        : [...prev, windowId]
    )
  }

  // Apply template
  const applyTemplate = (template) => {
    switch (template) {
      case 'full_access':
        setAccessType('full')
        setStartSession('')
        setEndSession('')
        break
      case 'monthly_access':
        if (courseSessions.length >= 4) {
          setAccessType('partial')
          setStartSession(courseSessions[0]?.id)
          setEndSession(courseSessions[3]?.id) // First 4 sessions
        }
        break
      case 'exam_period':
        if (courseSessions.length >= 2) {
          setAccessType('partial')
          setStartSession(courseSessions[courseSessions.length - 2]?.id) // Last 2 sessions
          setEndSession(courseSessions[courseSessions.length - 1]?.id)
        }
        break
    }
    setTemplatesDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <span>Access Window Management</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Control partial course access for live course enrollments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTemplatesDialogOpen(true)}
          >
            <Target className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Access Window
          </Button>
        </div>
      </div>

      {/* Access Type Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Access Window Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Full Access</span>
              </div>
              <p className="text-xs text-gray-600">Student can access all course sessions</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Partial Access</span>
              </div>
              <p className="text-xs text-gray-600">Student accesses specific session range</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-sm">Late Join</span>
              </div>
              <p className="text-xs text-gray-600">Student joins from specific session onwards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Access Windows */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Current Access Windows</span>
            </CardTitle>
            {accessWindows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkOperationMode(!bulkOperationMode)}
              >
                {bulkOperationMode ? 'Cancel Bulk' : 'Bulk Operations'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {accessWindows.length > 0 ? (
            <div className="space-y-3">
              {accessWindows.map((window) => (
                <div
                  key={window.id}
                  className={`p-4 border rounded-lg ${
                    selectedWindows.includes(window.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {bulkOperationMode && (
                        <Checkbox
                          checked={selectedWindows.includes(window.id)}
                          onCheckedChange={() => toggleWindowSelection(window.id)}
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{window.startSession.title}</h4>
                          <span className="text-gray-400">→</span>
                          <h4 className="font-medium">{window.endSession.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {window.sessionCount} sessions
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(window.startSession.date).toLocaleDateString()} - {new Date(window.endSession.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewData(generatePreview(window.startSession.id, window.endSession.id))
                          setPreviewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingWindow(window)
                          setSelectedEnrollment(window.enrollmentId)
                          setStartSession(window.startSession.id)
                          setEndSession(window.endSession.id)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteAccessWindow(window.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Session conflict warnings */}
                  {window.hasConflict && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">Session overlap detected</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Bulk operations bar */}
              {bulkOperationMode && selectedWindows.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedWindows.length} access window{selectedWindows.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="destructive" size="sm">
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No access windows created</p>
              <p className="text-sm text-gray-500 mb-4">
                Create access windows to control partial course access for enrolled students
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Access Window
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Access Window Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create Access Window</span>
            </DialogTitle>
            <DialogDescription>
              Configure partial access for a student enrollment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Enrollment Selection */}
            <div>
              <Label htmlFor="enrollment">Select Enrollment</Label>
              <Select value={selectedEnrollment} onValueChange={setSelectedEnrollment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student enrollment" />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map((enrollment) => (
                    <SelectItem key={enrollment.id} value={enrollment.id}>
                      {enrollment.student.name} - {enrollment.student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access Type Selection */}
            <div>
              <Label>Access Type</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setAccessType('full')}
                  className={`p-3 border rounded-lg text-left ${
                    accessType === 'full' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 text-green-600 mb-1" />
                  <div className="text-sm font-medium">Full Access</div>
                  <div className="text-xs text-gray-600">All sessions</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType('partial')}
                  className={`p-3 border rounded-lg text-left ${
                    accessType === 'partial' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Clock className="h-4 w-4 text-blue-600 mb-1" />
                  <div className="text-sm font-medium">Partial Access</div>
                  <div className="text-xs text-gray-600">Session range</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType('late_join')}
                  className={`p-3 border rounded-lg text-left ${
                    accessType === 'late_join' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <Users className="h-4 w-4 text-orange-600 mb-1" />
                  <div className="text-sm font-medium">Late Join</div>
                  <div className="text-xs text-gray-600">From session onwards</div>
                </button>
              </div>
            </div>

            {/* Session Selection (only for partial/late join) */}
            {accessType !== 'full' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startSession">Start Session</Label>
                  <Select value={startSession} onValueChange={setStartSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start session" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.title || `Session ${session.id}`} - {new Date(session.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endSession">End Session</Label>
                  <Select value={endSession} onValueChange={setEndSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end session" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.title || `Session ${session.id}`} - {new Date(session.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Preview */}
            {accessType !== 'full' && startSession && endSession && (
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-medium mb-2">Access Preview</h4>
                {(() => {
                  const preview = generatePreview(startSession, endSession)
                  if (!preview) return <p className="text-sm text-red-600">Invalid session selection</p>

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Sessions:</span>
                        <span className="font-medium">{preview.sessionCount} of {preview.totalSessions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Date Range:</span>
                        <span className="font-medium">
                          {new Date(preview.startDate).toLocaleDateString()} - {new Date(preview.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Estimated Price:</span>
                        <span className="font-medium text-green-600">{preview.calculatedPrice} EGP</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createAccessWindow}>
              <Save className="h-4 w-4 mr-2" />
              Create Access Window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Access Window Templates</span>
            </DialogTitle>
            <DialogDescription>
              Quick setups for common access patterns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <button
              onClick={() => applyTemplate('full_access')}
              className="w-full p-4 border rounded-lg text-left hover:border-green-500 hover:bg-green-50"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Full Course Access</div>
                  <div className="text-sm text-gray-600">Complete access to all sessions</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => applyTemplate('monthly_access')}
              className="w-full p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Monthly Access</div>
                  <div className="text-sm text-gray-600">First 4 sessions (typical monthly package)</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => applyTemplate('exam_period')}
              className="w-full p-4 border rounded-lg text-left hover:border-purple-500 hover:bg-purple-50"
            >
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Exam Period Only</div>
                  <div className="text-sm text-gray-600">Last 2 sessions (exam preparation)</div>
                </div>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplatesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Access Window Preview</span>
            </DialogTitle>
            <DialogDescription>
              Preview of what the student will have access to
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{previewData.sessionCount}</p>
                  <p className="text-sm text-gray-600">Accessible Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{previewData.calculatedPrice} EGP</p>
                  <p className="text-sm text-gray-600">Calculated Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{previewData.pricePerSession} EGP</p>
                  <p className="text-sm text-gray-600">Per Session</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Accessible Sessions</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {previewData.accessibleSessions.map((session, index) => (
                    <div key={session.id} className="flex items-center space-x-3 p-2 border rounded">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{session.title || `Session ${session.id}`}</p>
                        <p className="text-xs text-gray-600">{new Date(session.date).toLocaleDateString()}</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}