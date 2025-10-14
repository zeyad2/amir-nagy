import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Calendar, Plus, Users, Clock, Edit2, Trash2, AlertCircle, ClipboardCheck } from 'lucide-react'
import { toast } from "react-hot-toast"
import SessionForm from './SessionForm'
import { sessionService } from '@/services/session.service'

export default function SessionManager({ courseId, courseType }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionFormOpen, setSessionFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [enrolledCount, setEnrolledCount] = useState(0)
  const [editingSession, setEditingSession] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)

  // Only show for live courses
  if (courseType !== 'live') {
    return null
  }

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions()
  }, [courseId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await sessionService.getCourseSessions(courseId)
      setSessions(response.data.sessions || [])
      setEnrolledCount(response.data.enrolledStudents || 0)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (sessionData) => {
    try {
      setSubmitting(true)
      await sessionService.createSession(courseId, sessionData)
      toast.success('Session created successfully')
      setSessionFormOpen(false)
      await fetchSessions() // Reload sessions
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error(error.response?.data?.message || 'Failed to create session')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSession = async (sessionData) => {
    try {
      setSubmitting(true)
      await sessionService.updateSession(editingSession.id, sessionData)
      toast.success('Session updated successfully')
      setEditingSession(null)
      setSessionFormOpen(false)
      await fetchSessions() // Reload sessions
    } catch (error) {
      console.error('Error updating session:', error)
      toast.error(error.response?.data?.message || 'Failed to update session')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (session) => {
    setEditingSession(session)
    setSessionFormOpen(true)
  }

  const handleDeleteClick = (session) => {
    setSessionToDelete(session)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return

    try {
      setSubmitting(true)
      const response = await sessionService.deleteSession(sessionToDelete.id)
      const attendanceCount = response.data?.deletedAttendanceRecords || 0

      if (attendanceCount > 0) {
        toast.success(`Session deleted successfully. ${attendanceCount} attendance records removed.`)
      } else {
        toast.success('Session deleted successfully')
      }

      setDeleteConfirmOpen(false)
      setSessionToDelete(null)
      await fetchSessions() // Reload sessions
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error(error.response?.data?.message || 'Failed to delete session')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormClose = () => {
    setSessionFormOpen(false)
    setEditingSession(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading sessions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <span className="text-gray-900">Sessions</span>
                <p className="text-sm text-gray-600 font-normal">
                  Live class meetings
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {sessions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {sessions.length > 0 ? (
            <>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="group/item p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all duration-200 bg-white"
                  >
                    {/* Session Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-base">
                            {session.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {session.formattedDate}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {session.formattedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Info & Actions */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm">
                        {enrolledCount > 0 ? (
                          <>
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">
                              <span className="font-medium text-gray-900">{session.attendanceCount}</span>
                              <span className="text-gray-500"> / {enrolledCount}</span>
                              <span className="text-gray-400 ml-1">({session.attendanceRate}%)</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">No students enrolled</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/sessions/${session.id}/attendance`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 gap-1.5"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5" />
                          <span>Attendance</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(session)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(session)}
                          className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSessionFormOpen(true)}
                className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More Sessions
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">No sessions yet</h4>
              <p className="text-sm text-gray-600 mb-4">
                Schedule live class meetings for this course
              </p>
              <Button
                size="sm"
                onClick={() => setSessionFormOpen(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Form Dialog */}
      <SessionForm
        open={sessionFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
        loading={submitting}
        initialData={editingSession}
        isEditing={!!editingSession}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Delete Session</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session?
            </DialogDescription>
          </DialogHeader>

          {sessionToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium text-gray-900">{sessionToDelete.title}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{sessionToDelete.formattedDate}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{sessionToDelete.formattedTime}</span>
              </div>
              {sessionToDelete.attendanceCount > 0 && (
                <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    This session has {sessionToDelete.attendanceCount} attendance record(s) that will also be deleted.
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
