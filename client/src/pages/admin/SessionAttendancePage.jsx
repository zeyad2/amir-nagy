import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from "react-hot-toast"
import AttendanceMarker from '@/components/admin/AttendanceMarker'
import { attendanceService } from '@/services/attendance.service'

export default function SessionAttendancePage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [students, setStudents] = useState([])
  const [statistics, setStatistics] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSessionAttendance()
  }, [sessionId])

  const fetchSessionAttendance = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await attendanceService.getSessionAttendance(sessionId)
      setSession(response.data.session)
      setStudents(response.data.students)
      setStatistics(response.data.statistics)
    } catch (err) {
      console.error('Error fetching session attendance:', err)
      setError(err.response?.data?.message || 'Failed to load session attendance')
      toast.error('Failed to load session attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAttendance = async (attendanceRecords) => {
    try {
      await attendanceService.markAttendance(sessionId, attendanceRecords)
      toast.success('Attendance saved successfully')
      // Refresh data to show updated statistics
      await fetchSessionAttendance()
    } catch (err) {
      console.error('Error saving attendance:', err)
      toast.error(err.response?.data?.message || 'Failed to save attendance')
      throw err // Re-throw to let AttendanceMarker handle loading state
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session attendance...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <div>
                <p className="font-medium">Error Loading Session</p>
                <p className="text-sm text-red-500">{error || 'Session not found'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>
      </div>

      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{session.title || 'Session Attendance'}</h2>
                <p className="text-sm text-gray-600 font-normal">{session.courseName}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm">
              Mark Attendance
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Session Date & Time */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Session Date</p>
                <p className="font-medium text-gray-900">{session.formattedDate}</p>
              </div>
            </div>

            {/* Total Students */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Total Students</p>
                <p className="font-medium text-gray-900">{statistics.totalStudents || 0}</p>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Attendance Rate</p>
                <p className="font-medium text-gray-900">{statistics.attendanceRate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="mt-4 flex items-center justify-center space-x-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{statistics.presentCount || 0}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Present</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{statistics.absentCount || 0}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Absent</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-2xl font-bold text-amber-600">{statistics.notMarkedCount || 0}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Not Marked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Marker Component */}
      <AttendanceMarker
        students={students}
        onSave={handleSaveAttendance}
      />
    </div>
  )
}
