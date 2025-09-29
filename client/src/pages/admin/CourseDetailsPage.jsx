import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { storageService } from '@/services/storage.service'
import { adminService } from '@/services/admin.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import AccessWindowManager from '@/components/admin/AccessWindowManager'
import CourseAnalytics from '@/components/admin/CourseAnalytics'
import {
  ArrowLeft,
  Edit3,
  Eye,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  Calendar,
  DollarSign,
  Settings,
  Trash2,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Archive,
  Plus,
  Minus
} from 'lucide-react'

export default function CourseDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Editing states
  const [editingField, setEditingField] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)

  // Dialog states
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [contentDialogOpen, setContentDialogOpen] = useState(false)
  const [contentType, setContentType] = useState('lessons') // 'lessons', 'homework', 'tests'
  const [availableContent, setAvailableContent] = useState([])
  const [loadingContent, setLoadingContent] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [dueDates, setDueDates] = useState({})

  // Enrollment request handling states
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [accessWindowDialogOpen, setAccessWindowDialogOpen] = useState(false)
  const [accessType, setAccessType] = useState('full')
  const [startSession, setStartSession] = useState('')
  const [endSession, setEndSession] = useState('')

  // Fetch course data
  const fetchCourse = async () => {
    try {
      setLoading(true)
      const token = storageService.getToken()
      const response = await fetch(`http://localhost:5000/api/admin/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch course details')
      }

      const data = await response.json()
      setCourse(data.data.course)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourse()
  }, [id])

  // Handle inline editing
  const startEditing = (field, currentValue) => {
    setEditingField(field)
    setEditValues({ [field]: currentValue })
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValues({})
  }

  const saveField = async (field) => {
    try {
      setSaving(true)
      const token = storageService.getToken()

      const updateData = { [field]: editValues[field] }

      const response = await fetch(`http://localhost:5000/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to update course')
      }

      const data = await response.json()
      setCourse({ ...course, [field]: editValues[field] })
      setEditingField(null)
      setEditValues({})
      toast.success(`Course ${field} updated successfully`)
    } catch (err) {
      toast.error(`Failed to update ${field}`)
    } finally {
      setSaving(false)
    }
  }

  // Handle status toggle
  const toggleStatus = async (newStatus) => {
    try {
      setSaving(true)
      const token = storageService.getToken()

      const response = await fetch(`http://localhost:5000/api/admin/courses/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setCourse({ ...course, status: newStatus })
      toast.success(`Course ${newStatus} successfully`)
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  // Handle course deletion
  const handleDelete = async () => {
    try {
      setSaving(true)
      const token = storageService.getToken()

      const response = await fetch(`http://localhost:5000/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete course')
      }

      toast.success('Course deleted successfully')
      navigate('/admin/courses')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
      setDeleteConfirmOpen(false)
    }
  }

  // Content management functions
  const openContentDialog = async (type) => {
    setContentType(type)
    setLoadingContent(true)
    setContentDialogOpen(true)
    setSelectedItems([])
    setDueDates({})

    try {
      const token = storageService.getToken()
      let endpoint = ''

      switch(type) {
        case 'lessons':
          endpoint = 'http://localhost:5000/api/admin/lessons'
          break
        case 'homework':
          endpoint = 'http://localhost:5000/api/admin/homework'
          break
        case 'tests':
          endpoint = 'http://localhost:5000/api/admin/tests'
          break
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`)
      }

      const data = await response.json()
      setAvailableContent(data.data[type] || [])
    } catch (err) {
      toast.error(`Failed to load ${type}`)
      setAvailableContent([])
    } finally {
      setLoadingContent(false)
    }
  }

  const assignContent = async () => {
    try {
      if (selectedItems.length === 0) {
        toast.error('Please select at least one item to assign')
        return
      }

      const token = storageService.getToken()
      const assignmentData = {
        type: contentType,
        contentIds: selectedItems
      }

      // Add due dates for homework and tests
      if (contentType === 'homework' || contentType === 'tests') {
        assignmentData.dueDates = dueDates
      }

      const response = await fetch(`http://localhost:5000/api/admin/courses/${id}/content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      })

      if (!response.ok) {
        throw new Error(`Failed to assign ${contentType}`)
      }

      // Refresh course data
      await fetchCourse()
      toast.success(`${contentType} assigned successfully`)
      setContentDialogOpen(false)
      setSelectedItems([])
      setDueDates({})
    } catch (err) {
      toast.error(err.message)
    }
  }

  const removeContent = async (contentId, type) => {
    try {
      const token = storageService.getToken()
      const response = await fetch(`http://localhost:5000/api/admin/courses/${id}/content/${contentId}?type=${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to remove ${type}`)
      }

      // Refresh course data
      await fetchCourse()
      toast.success(`${type} removed successfully`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Enrollment request handlers
  const handleApproveRequest = async (request) => {
    // Check if it's a live course that needs access window assignment
    if (course.type === 'live') {
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
      fetchCourse() // Reload course data to get updated pending requests
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
      fetchCourse() // Reload course data to get updated pending requests
    } catch (error) {
      toast.error('Failed to reject enrollment request')
      console.error('Error rejecting request:', error)
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/admin/courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{course.title}</h1>
            <p className="text-gray-600 mt-1">Course Management Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={course.status === 'published' ? 'default' : 'outline'}
            onClick={() => toggleStatus(course.status === 'published' ? 'archived' : 'published')}
            disabled={saving}
          >
            {course.status === 'published' ? 'Archive' : 'Publish'}
          </Button>
          {course.canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Course Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl capitalize">{course.title}</CardTitle>
                <Badge
                  variant={course.type === 'live' ? 'default' : 'secondary'}
                  className={
                    course.type === 'live'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }
                >
                  {course.type === 'live' ? 'Live Course' : 'Finished Course'}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    course.status === 'published'
                      ? 'border-green-600 text-green-600'
                      : course.status === 'draft'
                      ? 'border-yellow-600 text-yellow-600'
                      : 'border-gray-600 text-gray-600'
                  }
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </Badge>
              </div>
              <CardDescription className="mt-2 max-w-2xl">
                {course.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{course.stats.activeEnrollments}</span>
              </div>
              <p className="text-sm text-gray-600">Active Students</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{course.stats.totalContent}</span>
              </div>
              <p className="text-sm text-gray-600">Total Content</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-900">{course.stats.pendingRequests}</span>
              </div>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {course.price ? `${course.price} EGP` : 'Free'}
                </span>
              </div>
              <p className="text-sm text-gray-600">Price</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Course Analytics */}
          <CourseAnalytics course={course} />

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Course Title */}
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Course Title</Label>
                  {editingField === 'title' ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={editValues.title || ''}
                        onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                        placeholder="Enter course title"
                      />
                      <Button size="sm" onClick={() => saveField('title')} disabled={saving}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-900 capitalize">{course.title}</p>
                      <Button size="sm" variant="ghost" onClick={() => startEditing('title', course.title)}>
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Course Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  {editingField === 'description' ? (
                    <div className="space-y-2 mt-1">
                      <Textarea
                        value={editValues.description || ''}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        placeholder="Enter course description"
                        rows={4}
                      />
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={() => saveField('description')} disabled={saving}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEditing}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-1">
                      <div className="flex items-start justify-between">
                        <p className="text-gray-900 flex-1">{course.description}</p>
                        <Button size="sm" variant="ghost" onClick={() => startEditing('description', course.description)}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Price */}
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">Price (EGP)</Label>
                  {editingField === 'price' ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type="number"
                        min="0"
                        value={editValues.price || ''}
                        onChange={(e) => setEditValues({ ...editValues, price: parseFloat(e.target.value) || null })}
                        placeholder="Enter price (leave empty for free)"
                      />
                      <Button size="sm" onClick={() => saveField('price')} disabled={saving}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-900">
                        {course.price ? `${course.price} EGP` : 'Free'}
                      </p>
                      <Button size="sm" variant="ghost" onClick={() => startEditing('price', course.price)}>
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Course Type</Label>
                    <p className="text-gray-900 mt-1">{course.type === 'live' ? 'Live Course' : 'Finished Course'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-gray-900 mt-1">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Course Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Total Lessons</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{course.stats.totalLessons}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">Homework Assignments</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{course.stats.totalHomework}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium">Tests</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">{course.stats.totalTests}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium">Total Content Items</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{course.stats.totalContent}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Content Overview Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Course Content Management
                </h3>
                <p className="text-gray-600">
                  Manage lessons, homework assignments, and tests for this course.
                  Set due dates and track student progress.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {course.stats.totalContent}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Lessons */}
            <Card className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-gray-900">Lessons</span>
                      <p className="text-sm text-gray-600 font-normal">
                        Course learning materials
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {course.content.lessons.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {course.content.lessons.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {course.content.lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="group/item flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate group-hover/item:text-blue-900">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Lesson {index + 1} • Learning Material
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeContent(lesson.id, 'lesson')}
                            className="opacity-0 group-hover/item:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openContentDialog('lessons')}
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Lessons
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">No lessons yet</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Start building your course by adding lessons
                    </p>
                    <Button
                      size="sm"
                      onClick={() => openContentDialog('lessons')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Lesson
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Homework */}
            <Card className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-gray-900">Homework</span>
                      <p className="text-sm text-gray-600 font-normal">
                        Practice assignments
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {course.content.homework.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {course.content.homework.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {course.content.homework.map((hw, index) => (
                        <div
                          key={hw.id}
                          className="group/item p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded text-white text-xs font-bold flex items-center justify-center">
                                  {index + 1}
                                </div>
                                <p className="font-medium text-gray-900 truncate group-hover/item:text-green-900">
                                  {hw.title}
                                </p>
                              </div>
                              {hw.dueDate && (
                                <div className="flex items-center space-x-1 ml-8">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    Due: {new Date(hw.dueDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeContent(hw.id, 'homework')}
                              className="opacity-0 group-hover/item:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2 transition-all duration-200"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openContentDialog('homework')}
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Homework
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">No homework yet</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Add homework assignments for student practice
                    </p>
                    <Button
                      size="sm"
                      onClick={() => openContentDialog('homework')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Homework
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tests */}
            <Card className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-900">Tests</span>
                      <p className="text-sm text-gray-600 font-normal">
                        Assessment evaluations
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {course.content.tests.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {course.content.tests.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {course.content.tests.map((test, index) => (
                        <div
                          key={test.id}
                          className="group/item p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded text-white text-xs font-bold flex items-center justify-center">
                                  {index + 1}
                                </div>
                                <p className="font-medium text-gray-900 truncate group-hover/item:text-purple-900">
                                  {test.title}
                                </p>
                              </div>
                              {test.dueDate && (
                                <div className="flex items-center space-x-1 ml-8">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    Due: {new Date(test.dueDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeContent(test.id, 'test')}
                              className="opacity-0 group-hover/item:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2 transition-all duration-200"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openContentDialog('tests')}
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Tests
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">No tests yet</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Add tests to evaluate student understanding
                    </p>
                    <Button
                      size="sm"
                      onClick={() => openContentDialog('tests')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Bar */}
          {course.stats.totalContent > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{course.stats.totalContent}</span> content items assigned
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{course.stats.activeEnrollments}</span> students enrolled
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Course
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Student Portal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrolled Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Enrolled Students</span>
                  </div>
                  <Badge variant="secondary">{course.enrolledStudents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.enrolledStudents.length > 0 ? (
                  <div className="space-y-3">
                    {course.enrolledStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600 truncate">{student.email}</p>
                          <p className="text-xs text-gray-500">
                            Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No enrolled students</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span>Pending Requests</span>
                  </div>
                  <Badge variant="secondary">{course.pendingRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {course.pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{request.studentName}</p>
                          <p className="text-sm text-gray-600 truncate">{request.email}</p>
                          <p className="text-xs text-gray-500">
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveRequest(request)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No pending requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Access Window Management - Only for Live Courses */}
          {course.type === 'live' && (
            <div>
              <AccessWindowManager
                courseId={id}
                courseData={course}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Course Settings</span>
              </CardTitle>
              <CardDescription>
                Manage course status, visibility, and advanced options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Management */}
              <div>
                <Label className="text-sm font-medium">Course Status</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Button
                    variant={course.status === 'published' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatus('published')}
                    disabled={saving || course.status === 'published'}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Course
                  </Button>
                  <Button
                    variant={course.status === 'archived' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatus('archived')}
                    disabled={saving || course.status === 'archived'}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Course
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Current status: <strong>{course.status.charAt(0).toUpperCase() + course.status.slice(1)}</strong>
                </p>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div>
                <Label className="text-sm font-medium text-red-600">Danger Zone</Label>
                <div className="mt-2 p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">Delete Course</p>
                      <p className="text-sm text-red-700">
                        {course.canDelete
                          ? 'Permanently delete this course and all its data.'
                          : `Cannot delete - ${course.stats.activeEnrollments} active enrollments and ${course.stats.pendingRequests} pending requests.`
                        }
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={!course.canDelete || saving}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Course
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Course Preview - Student View</span>
            </DialogTitle>
            <DialogDescription>
              This is how students will see your course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <Badge variant={course.type === 'live' ? 'default' : 'secondary'}>
                    {course.type === 'live' ? 'Live Course' : 'Finished Course'}
                  </Badge>
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{course.stats.totalLessons}</p>
                    <p className="text-sm text-gray-600">Lessons</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{course.stats.totalHomework}</p>
                    <p className="text-sm text-gray-600">Homework</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{course.stats.totalTests}</p>
                    <p className="text-sm text-gray-600">Tests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {course.price && (
              <div className="text-center py-4 border-t">
                <p className="text-3xl font-bold text-green-600">{course.price} EGP</p>
                <p className="text-gray-600">Course Price</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Delete Course</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                <li>Course information and settings</li>
                <li>All associated content assignments</li>
                <li>Student enrollment history</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Assignment Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Assign {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</span>
            </DialogTitle>
            <DialogDescription>
              Select {contentType} to assign to this course{(contentType === 'homework' || contentType === 'tests') && ' and set due dates'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
            {loadingContent ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading {contentType}...</span>
              </div>
            ) : availableContent.length > 0 ? (
              <>
                {/* Selection Summary */}
                {selectedItems.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {selectedItems.length} {contentType} selected
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItems([])
                          setDueDates({})
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}

                {/* Content List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
                  {availableContent.map((item) => {
                    const isAssigned = course.content[contentType]?.some(assigned => assigned.id === item.id)
                    const isSelected = selectedItems.includes(item.id)
                    const needsDueDate = (contentType === 'homework' || contentType === 'tests') && isSelected

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "border rounded-lg p-4 transition-all duration-200",
                          isAssigned
                            ? "bg-gray-50 border-gray-300"
                            : isSelected
                            ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
                            : "hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                        )}
                        onClick={() => {
                          if (!isAssigned && !isSelected) {
                            setSelectedItems([...selectedItems, item.id])
                            if (contentType === 'homework' || contentType === 'tests') {
                              const defaultDate = new Date()
                              defaultDate.setDate(defaultDate.getDate() + (contentType === 'homework' ? 7 : 14))
                              setDueDates({ ...dueDates, [item.id]: defaultDate })
                            }
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={item.id}
                            checked={isSelected}
                            disabled={isAssigned}
                            onCheckedChange={(checked) => {
                              if (checked && !isAssigned) {
                                setSelectedItems([...selectedItems, item.id])
                                if (contentType === 'homework' || contentType === 'tests') {
                                  const defaultDate = new Date()
                                  defaultDate.setDate(defaultDate.getDate() + (contentType === 'homework' ? 7 : 14))
                                  setDueDates({ ...dueDates, [item.id]: defaultDate })
                                }
                              } else if (!checked) {
                                setSelectedItems(selectedItems.filter(id => id !== item.id))
                                if (dueDates[item.id]) {
                                  const newDueDates = { ...dueDates }
                                  delete newDueDates[item.id]
                                  setDueDates(newDueDates)
                                }
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <label
                                htmlFor={item.id}
                                className={cn(
                                  "font-medium cursor-pointer",
                                  isAssigned ? "text-gray-500" : "text-gray-900"
                                )}
                              >
                                {item.title}
                              </label>
                              {isAssigned && (
                                <Badge variant="secondary" className="text-xs">
                                  Assigned
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {isAssigned && (
                              <p className="text-xs text-gray-500 mt-1">
                                Already assigned to this course
                              </p>
                            )}

                            {/* Due Date Picker for Homework and Tests */}
                            {needsDueDate && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <Label className="text-sm font-medium text-blue-900">
                                  Due Date
                                </Label>
                                <Input
                                  type="date"
                                  value={dueDates[item.id] ? dueDates[item.id].toISOString().split('T')[0] : ''}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setDueDates({ ...dueDates, [item.id]: new Date(e.target.value) })
                                    }
                                  }}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {contentType === 'lessons' && <BookOpen className="h-12 w-12 mx-auto" />}
                  {contentType === 'homework' && <FileText className="h-12 w-12 mx-auto" />}
                  {contentType === 'tests' && <GraduationCap className="h-12 w-12 mx-auto" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {contentType} available
                </h3>
                <p className="text-gray-600 mb-4">
                  Create {contentType} in the Resources section first
                </p>
                <Button variant="outline" onClick={() => setContentDialogOpen(false)}>
                  Go to Resources
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 border-t pt-4 flex-shrink-0">
            <div className="flex-1 text-sm text-gray-600">
              {selectedItems.length > 0 && (
                <span>
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  {(contentType === 'homework' || contentType === 'tests') && (
                    <span className="block sm:inline sm:ml-2">
                      • Due dates: {Object.keys(dueDates).length}/{selectedItems.length} set
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setContentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={assignContent}
                disabled={selectedItems.length === 0 || (
                  (contentType === 'homework' || contentType === 'tests') &&
                  Object.keys(dueDates).length < selectedItems.length
                )}
              >
                Assign {selectedItems.length > 0 && `(${selectedItems.length})`}
              </Button>
            </div>
          </DialogFooter>
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
                <h4 className="font-medium mb-2">Course: {course.title}</h4>
                <p className="text-sm text-gray-600">Student: {selectedRequest.studentName}</p>
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
                        Estimated price: {course.price} EGP
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