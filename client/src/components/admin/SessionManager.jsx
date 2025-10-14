import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Plus, Users, Clock } from 'lucide-react'
import { toast } from "react-hot-toast"
import SessionForm from './SessionForm'
import { sessionService } from '@/services/session.service'

export default function SessionManager({ courseId, courseType }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionFormOpen, setSessionFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [enrolledCount, setEnrolledCount] = useState(0)

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
                    className="group/item p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded text-white text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </div>
                          <p className="font-medium text-gray-900 truncate group-hover/item:text-orange-900">
                            {session.title}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 ml-8">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {session.formattedDate}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {session.formattedTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-8 mt-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            Attendance: {session.attendanceCount}/{enrolledCount} ({session.attendanceRate}%)
                          </span>
                        </div>
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
        onOpenChange={setSessionFormOpen}
        onSubmit={handleCreateSession}
        loading={submitting}
      />
    </>
  )
}
