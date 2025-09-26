import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { storageService } from '@/services/storage.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  Archive
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
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
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
                <CardTitle className="text-xl">{course.title}</CardTitle>
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
                      <p className="text-gray-900">{course.title}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Lessons</span>
                  </div>
                  <Badge variant="secondary">{course.content.lessons.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.content.lessons.length > 0 ? (
                  <div className="space-y-3">
                    {course.content.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No lessons assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Homework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Homework</span>
                  </div>
                  <Badge variant="secondary">{course.content.homework.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.content.homework.length > 0 ? (
                  <div className="space-y-3">
                    {course.content.homework.map((hw) => (
                      <div key={hw.id} className="p-3 border rounded-lg">
                        <p className="font-medium text-gray-900">{hw.title}</p>
                        {hw.dueDate && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              Due: {new Date(hw.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No homework assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <span>Tests</span>
                  </div>
                  <Badge variant="secondary">{course.content.tests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.content.tests.length > 0 ? (
                  <div className="space-y-3">
                    {course.content.tests.map((test) => (
                      <div key={test.id} className="p-3 border rounded-lg">
                        <p className="font-medium text-gray-900">{test.title}</p>
                        {test.dueDate && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              Due: {new Date(test.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No tests assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
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
    </div>
  )
}