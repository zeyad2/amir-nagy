import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Search, Edit, Trash2, ExternalLink, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '@/services/admin.service'
import { formatDate } from '@/utils/helpers'
import TestBuilder from '@/components/admin/tests/TestBuilder'
import HomeworkBuilder from '@/components/admin/homework/HomeworkBuilder'

export default function AdminResources() {
  const [activeTab, setActiveTab] = useState('lessons')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lessonDialog, setLessonDialog] = useState({ open: false, lesson: null, loading: false })

  // Form state for lesson creation/editing
  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoLink: ''
  })

  // Load lessons data
  useEffect(() => {
    if (activeTab === 'lessons') {
      loadLessons()
    }
  }, [activeTab])

  // Load lessons with search - debounced
  useEffect(() => {
    if (activeTab === 'lessons') {
      const timeoutId = setTimeout(() => {
        loadLessons()
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const filters = searchQuery ? { search: searchQuery } : {}
      const response = await adminService.getAllLessons(filters)
      // The API returns data in response.data.data structure
      setLessons(response.data.data?.lessons || [])
    } catch (error) {
      toast.error('Failed to load lessons')
      console.error('Load lessons error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Validate Google Drive URL
  const isValidGoogleDriveUrl = (url) => {
    return url.includes('drive.google.com') || url.includes('docs.google.com')
  }

  // Handle lesson form submission
  const handleLessonSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!lessonForm.title.trim()) {
      toast.error('Please enter a lesson title')
      return
    }

    if (!lessonForm.videoLink.trim()) {
      toast.error('Please enter a video URL')
      return
    }

    if (!isValidGoogleDriveUrl(lessonForm.videoLink)) {
      toast.error('Please enter a valid Google Drive URL')
      return
    }

    try {
      setLessonDialog(prev => ({ ...prev, loading: true }))

      if (lessonDialog.lesson) {
        // Update existing lesson
        await adminService.updateLesson(lessonDialog.lesson.id, lessonForm)
        toast.success('Lesson updated successfully')
      } else {
        // Create new lesson
        await adminService.createLesson(lessonForm)
        toast.success('Lesson created successfully')
      }

      setLessonDialog({ open: false, lesson: null, loading: false })
      setLessonForm({ title: '', videoLink: '' })
      loadLessons()
    } catch (error) {
      toast.error(lessonDialog.lesson ? 'Failed to update lesson' : 'Failed to create lesson')
      console.error('Lesson submit error:', error)
    } finally {
      setLessonDialog(prev => ({ ...prev, loading: false }))
    }
  }

  // Handle lesson deletion
  const handleDeleteLesson = async (lesson) => {
    const confirmMessage = lesson.usageCount > 0
      ? `Are you sure you want to delete "${lesson.title}"?\n\nThis lesson is used in ${lesson.usageCount} course(s). It will be removed from all courses.`
      : `Are you sure you want to delete "${lesson.title}"?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      await adminService.deleteLesson(lesson.id)
      toast.success('Lesson deleted successfully')
      loadLessons()
    } catch (error) {
      toast.error('Failed to delete lesson')
      console.error('Delete lesson error:', error)
    }
  }

  // Open lesson dialog for editing
  const openEditDialog = (lesson) => {
    setLessonForm({
      title: lesson.title,
      videoLink: lesson.videoLink
    })
    setLessonDialog({ open: true, lesson, loading: false })
  }

  // Open lesson dialog for creating
  const openCreateDialog = () => {
    setLessonForm({ title: '', videoLink: '' })
    setLessonDialog({ open: true, lesson: null, loading: false })
  }

  // The lessons are already filtered by the backend, no need for client-side filtering

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
          <CardDescription>Create and manage lessons, homework and tests for your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-6">
              {/* Lessons Management Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Lessons Management</h3>
                  <p className="text-sm text-muted-foreground">Create and manage video lessons for your courses</p>
                </div>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lesson
                </Button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Lessons Table */}
              <div className="border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner className="h-6 w-6" />
                    <span className="ml-2">Loading lessons...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Video URL</TableHead>
                        <TableHead>Courses Used</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? 'No lessons found matching your search.' : 'No lessons created yet.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        lessons.map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell className="font-medium">{lesson.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground truncate max-w-xs">
                                  {lesson.videoLink}
                                </span>
                                <a
                                  href={lesson.videoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {lesson.usageCount || 0} courses
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {lesson.createdAt ? formatDate(lesson.createdAt) : 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(lesson)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteLesson(lesson)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="homework" className="space-y-6">
              <HomeworkBuilder />
            </TabsContent>

            <TabsContent value="tests" className="space-y-6">
              <TestBuilder />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lesson Create/Edit Dialog */}
      <Dialog open={lessonDialog.open} onOpenChange={(open) => setLessonDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleLessonSubmit}>
            <DialogHeader>
              <DialogTitle>
                {lessonDialog.lesson ? 'Edit Lesson' : 'Create New Lesson'}
              </DialogTitle>
              <DialogDescription>
                {lessonDialog.lesson
                  ? 'Update the lesson details below.'
                  : 'Enter the lesson details below.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lesson title..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoLink">Google Drive Video URL</Label>
                <Input
                  id="videoLink"
                  value={lessonForm.videoLink}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, videoLink: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Paste the shareable link from Google Drive
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLessonDialog(prev => ({ ...prev, open: false }))}
                disabled={lessonDialog.loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={lessonDialog.loading}>
                {lessonDialog.loading && <LoadingSpinner className="h-4 w-4 mr-2" />}
                {lessonDialog.lesson ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}