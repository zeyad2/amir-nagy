import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { adminService } from '@/services/admin.service'
import { Search, Eye, Check, X, Users, UserPlus, Calendar, Mail, Phone, BookOpen } from 'lucide-react'

export default function AdminStudents() {
  // State for students tab
  const [students, setStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(false)

  // State for enrollment requests tab
  const [enrollmentRequests, setEnrollmentRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequests, setSelectedRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [accessWindowDialogOpen, setAccessWindowDialogOpen] = useState(false)
  const [accessType, setAccessType] = useState('full')
  const [startSession, setStartSession] = useState('')
  const [endSession, setEndSession] = useState('')

  // Loading states
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadStudents()
    loadEnrollmentRequests()
  }, [])

  const loadStudents = async () => {
    setStudentsLoading(true)
    try {
      const response = await adminService.getAllStudents()
      // The API returns data in response.data.data structure
      setStudents(response.data.data?.students || [])
    } catch (error) {
      toast.error('Failed to load students')
      console.error('Error loading students:', error)
      setStudents([]) // Ensure it's always an array
    } finally {
      setStudentsLoading(false)
    }
  }

  const loadEnrollmentRequests = async () => {
    setRequestsLoading(true)
    try {
      const response = await adminService.getEnrollmentRequests()
      // The API returns data in response.data.data structure
      setEnrollmentRequests(response.data.data?.requests || [])
    } catch (error) {
      toast.error('Failed to load enrollment requests')
      console.error('Error loading enrollment requests:', error)
      setEnrollmentRequests([]) // Ensure it's always an array
    } finally {
      setRequestsLoading(false)
    }
  }

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  )

  // Filter enrollment requests based on status
  const filteredRequests = enrollmentRequests.filter(request => {
    if (statusFilter === 'all') return true
    return request.status === statusFilter
  })

  const handleStudentDetails = async (studentId) => {
    try {
      const response = await adminService.getStudentById(studentId)
      // The API returns data in response.data.data structure
      setSelectedStudent(response.data.data?.student)
      setStudentDetailsOpen(true)
    } catch (error) {
      toast.error('Failed to load student details')
      console.error('Error loading student details:', error)
    }
  }

  const handleApproveRequest = async (request) => {
    // Check if it's a live course that needs access window assignment
    if (request.course.type === 'live') {
      setSelectedRequest(request)
      setAccessWindowDialogOpen(true)
    } else {
      // Direct approval for finished courses
      await processApproval(request.id, null)
    }
  }

  const processApproval = async (requestId, accessWindow) => {
    setActionLoading(true)
    try {
      await adminService.approveEnrollmentRequest(requestId, accessWindow)
      toast.success('Enrollment request approved successfully')
      loadEnrollmentRequests() // Reload to get updated data
      setAccessWindowDialogOpen(false)
      setSelectedRequest(null)
      resetAccessWindowForm()
    } catch (error) {
      toast.error('Failed to approve enrollment request')
      console.error('Error approving request:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectRequest = async (requestId) => {
    setActionLoading(true)
    try {
      await adminService.rejectEnrollmentRequest(requestId)
      toast.success('Enrollment request rejected')
      loadEnrollmentRequests()
    } catch (error) {
      toast.error('Failed to reject enrollment request')
      console.error('Error rejecting request:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      toast.error('Please select requests to approve')
      return
    }

    setActionLoading(true)
    try {
      await adminService.bulkApproveEnrollmentRequests(selectedRequests)
      toast.success(`${selectedRequests.length} requests approved successfully`)
      setSelectedRequests([])
      loadEnrollmentRequests()
    } catch (error) {
      toast.error('Failed to approve selected requests')
      console.error('Error bulk approving:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) {
      toast.error('Please select requests to reject')
      return
    }

    setActionLoading(true)
    try {
      await adminService.bulkRejectEnrollmentRequests(selectedRequests)
      toast.success(`${selectedRequests.length} requests rejected`)
      setSelectedRequests([])
      loadEnrollmentRequests()
    } catch (error) {
      toast.error('Failed to reject selected requests')
      console.error('Error bulk rejecting:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const resetAccessWindowForm = () => {
    setAccessType('full')
    setStartSession('')
    setEndSession('')
  }

  const handleAccessWindowSubmit = () => {
    if (accessType === 'full') {
      processApproval(selectedRequest.id, null)
    } else {
      // For partial access, both start and end sessions are required
      if (accessType === 'partial' && (!startSession || !endSession)) {
        toast.error('Please select start and end sessions')
        return
      }

      // For late join, only start session is required
      if (accessType === 'late' && !startSession) {
        toast.error('Please select start session')
        return
      }

      const accessWindow = {
        type: accessType,
        startSessionId: startSession,
        endSessionId: accessType === 'late' ? null : endSession
      }

      processApproval(selectedRequest.id, accessWindow)
    }
  }

  const toggleRequestSelection = (requestId) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const selectAllRequests = () => {
    const pendingRequestIds = filteredRequests
      .filter(req => req.status === 'pending')
      .map(req => req.id)
    setSelectedRequests(pendingRequestIds)
  }

  const clearSelection = () => {
    setSelectedRequests([])
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Student Management
          </CardTitle>
          <CardDescription>
            Manage student enrollments, view details, and process enrollment requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Students ({students.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Enrollment Requests ({enrollmentRequests.filter(r => r.status === 'pending').length})
              </TabsTrigger>
            </TabsList>

            {/* All Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {studentsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Enrolled Courses</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.phone}</TableCell>
                            <TableCell>{formatDate(student.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {student.enrollments?.length || 0} courses
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStudentDetails(student.id)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {studentSearch ? 'No students found matching your search.' : 'No students registered yet.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Enrollment Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRequests.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedRequests.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkApprove}
                      disabled={actionLoading}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Approve Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkReject}
                      disabled={actionLoading}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Reject Selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {requestsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedRequests.length === filteredRequests.filter(r => r.status === 'pending').length && filteredRequests.filter(r => r.status === 'pending').length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectAllRequests()
                              } else {
                                clearSelection()
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course Requested</TableHead>
                        <TableHead>Course Type</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              {request.status === 'pending' && (
                                <Checkbox
                                  checked={selectedRequests.includes(request.id)}
                                  onCheckedChange={() => toggleRequestSelection(request.id)}
                                />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {request.student.firstName} {request.student.lastName}
                            </TableCell>
                            <TableCell>{request.course.title}</TableCell>
                            <TableCell>
                              <Badge variant={request.course.type === 'live' ? 'default' : 'secondary'}>
                                {request.course.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Enrollment Request Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Student Information</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div><strong>Name:</strong> {request.student.firstName} {request.student.lastName}</div>
                                          <div><strong>Email:</strong> {request.student.email}</div>
                                          <div><strong>Phone:</strong> {request.student.phone}</div>
                                          <div><strong>Parent:</strong> {request.student.parentFirstName} {request.student.parentLastName}</div>
                                        </div>
                                      </div>
                                      <Separator />
                                      <div>
                                        <h4 className="font-medium mb-2">Course Information</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div><strong>Course:</strong> {request.course.title}</div>
                                          <div><strong>Type:</strong> {request.course.type}</div>
                                          <div><strong>Price:</strong> {request.course.price} EGP</div>
                                          <div><strong>Status:</strong> {request.course.status}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveRequest(request)}
                                      disabled={actionLoading}
                                      className="flex items-center gap-1"
                                    >
                                      <Check className="h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRejectRequest(request.id)}
                                      disabled={actionLoading}
                                      className="flex items-center gap-1"
                                    >
                                      <X className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            {statusFilter === 'all' ? 'No enrollment requests found.' : `No ${statusFilter} requests found.`}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      <Dialog open={studentDetailsOpen} onOpenChange={setStudentDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information about the student
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="text-sm text-gray-600">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Registration Date
                    </Label>
                    <p className="text-sm text-gray-600">{formatDate(selectedStudent.createdAt)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Parent Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Parent Name</Label>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.parentFirstName} {selectedStudent.parentLastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Parent Email
                    </Label>
                    <p className="text-sm text-gray-600">{selectedStudent.parentEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Parent Phone
                    </Label>
                    <p className="text-sm text-gray-600">{selectedStudent.parentPhone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Enrolled Courses */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Enrolled Courses ({selectedStudent.enrollments?.length || 0})
                </h3>
                {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.enrollments.map((enrollment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{enrollment.course?.title || 'Course Title'}</p>
                          <p className="text-sm text-gray-600">
                            Enrolled: {formatDate(enrollment.createdAt)}
                          </p>
                        </div>
                        <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                          {enrollment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No course enrollments yet</p>
                )}
              </div>

              <Separator />

              {/* Performance Summary Placeholder */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Performance Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">-</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">-</p>
                    <p className="text-sm text-gray-600">Assessments Completed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">-</p>
                    <p className="text-sm text-gray-600">Hours Studied</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Performance analytics will be available once the student completes assessments
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Access Window Assignment Dialog */}
      <Dialog open={accessWindowDialogOpen} onOpenChange={setAccessWindowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Course Access</DialogTitle>
            <DialogDescription>
              Configure access permissions for this live course enrollment
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Course Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Course: {selectedRequest.course.title}</h4>
                <p className="text-sm text-gray-600">Student: {selectedRequest.student.firstName} {selectedRequest.student.lastName}</p>
                <p className="text-sm text-gray-600">Course Type: Live Course</p>
              </div>

              {/* Access Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Access Type</Label>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="full"
                      name="accessType"
                      value="full"
                      checked={accessType === 'full'}
                      onChange={(e) => setAccessType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="full" className="flex-1">
                      <div>
                        <p className="font-medium">Full Access</p>
                        <p className="text-sm text-gray-600">Student can access all course sessions</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="partial"
                      name="accessType"
                      value="partial"
                      checked={accessType === 'partial'}
                      onChange={(e) => setAccessType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="partial" className="flex-1">
                      <div>
                        <p className="font-medium">Partial Access</p>
                        <p className="text-sm text-gray-600">Student can access specific session range</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="late"
                      name="accessType"
                      value="late"
                      checked={accessType === 'late'}
                      onChange={(e) => setAccessType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="late" className="flex-1">
                      <div>
                        <p className="font-medium">Late Join</p>
                        <p className="text-sm text-gray-600">Student joins from a specific session onwards</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Session Range Selection */}
              {(accessType === 'partial' || accessType === 'late') && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium">Session Range</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startSession">
                        {accessType === 'late' ? 'Start From Session' : 'Start Session'}
                      </Label>
                      <Select value={startSession} onValueChange={setStartSession}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="session-1">Session 1</SelectItem>
                          <SelectItem value="session-2">Session 2</SelectItem>
                          <SelectItem value="session-3">Session 3</SelectItem>
                          <SelectItem value="session-4">Session 4</SelectItem>
                          <SelectItem value="session-5">Session 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {accessType === 'partial' && (
                      <div>
                        <Label htmlFor="endSession">End Session</Label>
                        <Select value={endSession} onValueChange={setEndSession}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="session-3">Session 3</SelectItem>
                            <SelectItem value="session-4">Session 4</SelectItem>
                            <SelectItem value="session-5">Session 5</SelectItem>
                            <SelectItem value="session-6">Session 6</SelectItem>
                            <SelectItem value="session-7">Session 7</SelectItem>
                            <SelectItem value="session-8">Session 8</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Access Preview */}
                  {startSession && (accessType === 'late' || (accessType === 'partial' && endSession)) && (
                    <div className="mt-4 p-3 bg-white border rounded">
                      <p className="text-sm font-medium mb-2">Access Preview:</p>
                      <p className="text-sm text-gray-600">
                        Student will have access to {accessType === 'late' ? `${startSession} onwards` : `${startSession} to ${endSession}`}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Estimated price: {selectedRequest.course.price} EGP
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAccessWindowDialogOpen(false)
                    resetAccessWindowForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAccessWindowSubmit}
                  disabled={actionLoading}
                >
                  {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                  Approve Enrollment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}