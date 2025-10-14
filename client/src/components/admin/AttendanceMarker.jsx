import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, UserCheck, UserX, CheckCircle, XCircle, Save, Users } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function AttendanceMarker({ students, onSave }) {
  const [attendanceMap, setAttendanceMap] = useState(() => {
    // Initialize with existing attendance status
    const map = {}
    students.forEach(student => {
      map[student.studentId] = student.status // 'present', 'absent', or null
    })
    return map
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students

    const query = searchQuery.toLowerCase()
    return students.filter(student =>
      student.fullName.toLowerCase().includes(query) ||
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.phone.includes(query)
    )
  }, [students, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    const present = Object.values(attendanceMap).filter(status => status === 'present').length
    const absent = Object.values(attendanceMap).filter(status => status === 'absent').length
    const notMarked = Object.values(attendanceMap).filter(status => status === null).length

    return { present, absent, notMarked }
  }, [attendanceMap])

  const toggleAttendance = (studentId, newStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === newStatus ? null : newStatus
    }))
  }

  const markAllPresent = () => {
    const newMap = {}
    students.forEach(student => {
      newMap[student.studentId] = 'present'
    })
    setAttendanceMap(newMap)
  }

  const markAllAbsent = () => {
    const newMap = {}
    students.forEach(student => {
      newMap[student.studentId] = 'absent'
    })
    setAttendanceMap(newMap)
  }

  const handleSave = async () => {
    // Build records array for API
    const records = []
    Object.entries(attendanceMap).forEach(([studentId, status]) => {
      if (status !== null) {
        records.push({ studentId, status })
      }
    })

    if (records.length === 0) {
      return // Nothing to save
    }

    try {
      setSaving(true)
      await onSave(records)
    } catch (error) {
      // Error handled by parent
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-gray-900">Mark Attendance</span>
              <p className="text-sm text-gray-600 font-normal">
                {filteredStudents.length} of {students.length} students
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={markAllPresent}
              disabled={saving}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              All Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAbsent}
              disabled={saving}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <UserX className="h-4 w-4 mr-2" />
              All Absent
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-around text-sm">
          <div className="text-center">
            <span className="font-bold text-green-600">{stats.present}</span>
            <span className="text-gray-600 ml-1">Present</span>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="text-center">
            <span className="font-bold text-red-600">{stats.absent}</span>
            <span className="text-gray-600 ml-1">Absent</span>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="text-center">
            <span className="font-bold text-amber-600">{stats.notMarked}</span>
            <span className="text-gray-600 ml-1">Not Marked</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Students List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No students found</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const status = attendanceMap[student.studentId]

              return (
                <div
                  key={student.studentId}
                  className={cn(
                    "p-3 border rounded-lg transition-all duration-200",
                    status === 'present' && "border-green-300 bg-green-50",
                    status === 'absent' && "border-red-300 bg-red-50",
                    status === null && "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {student.fullName}
                      </p>
                      <p className="text-sm text-gray-600">{student.phone}</p>
                    </div>

                    {/* Attendance Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Present Button */}
                      <Button
                        size="sm"
                        variant={status === 'present' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(student.studentId, 'present')}
                        disabled={saving}
                        className={cn(
                          "gap-2",
                          status === 'present'
                            ? "bg-green-600 hover:bg-green-700"
                            : "text-green-600 border-green-300 hover:bg-green-50"
                        )}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Present
                      </Button>

                      {/* Absent Button */}
                      <Button
                        size="sm"
                        variant={status === 'absent' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(student.studentId, 'absent')}
                        disabled={saving}
                        className={cn(
                          "gap-2",
                          status === 'absent'
                            ? "bg-red-600 hover:bg-red-700"
                            : "text-red-600 border-red-300 hover:bg-red-50"
                        )}
                      >
                        <XCircle className="h-4 w-4" />
                        Absent
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saving || stats.notMarked === students.length}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
          {stats.notMarked === students.length && (
            <p className="text-center text-sm text-amber-600 mt-2">
              Please mark attendance for at least one student
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
