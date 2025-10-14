/**
 * CourseLearnPage
 * Main learning interface for students - displays lessons, homework, and tests
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentService } from '@/services/student.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, FileText, Clock, Calendar, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourseLearnPage() {
  const { id: courseId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourseDetails()
  }, [courseId])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const response = await studentService.getCourseDetails(courseId)
      setCourse(response.data.course)
    } catch (err) {
      console.error('Error fetching course:', err)
      setError(err.response?.data?.message || 'Failed to load course details')
      toast.error('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  const handleStartAssessment = (assessmentId) => {
    navigate(`/student/assessment/${assessmentId}`)
  }

  const handlePlayLesson = (videoLink) => {
    window.open(videoLink, '_blank')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error || 'Course not found'}</p>
            <Button onClick={() => navigate('/student/courses')} className="mt-4">
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lessons = course.courseLessons || []
  const homework = course.courseHomeworks || []
  const tests = course.courseTests || []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{course.title}</h1>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lessons">
            <PlayCircle className="h-4 w-4 mr-2" />
            Lessons ({lessons.length})
          </TabsTrigger>
          <TabsTrigger value="homework">
            <FileText className="h-4 w-4 mr-2" />
            Homework ({homework.length})
          </TabsTrigger>
          <TabsTrigger value="tests">
            <Clock className="h-4 w-4 mr-2" />
            Tests ({tests.length})
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6">
          {lessons.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No lessons available yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((courseLesson) => (
                <Card key={courseLesson.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-2">
                      <PlayCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{courseLesson.lesson.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handlePlayLesson(courseLesson.lesson.videoLink)}
                      className="w-full"
                    >
                      Watch Lesson
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Homework Tab */}
        <TabsContent value="homework" className="mt-6">
          {homework.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No homework assigned yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {homework.map((courseHomework) => (
                <Card key={courseHomework.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-2">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{courseHomework.homework.title}</span>
                    </CardTitle>
                    {courseHomework.dueDate && (
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(courseHomework.dueDate).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="secondary">Untimed</Badge>
                      <Button
                        onClick={() => handleStartAssessment(courseHomework.homework.id)}
                        className="w-full"
                      >
                        Start Homework
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="mt-6">
          {tests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No tests assigned yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((courseTest) => (
                <Card key={courseTest.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-2">
                      <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{courseTest.test.title}</span>
                    </CardTitle>
                    {courseTest.dueDate && (
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(courseTest.dueDate).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Timed</Badge>
                        {courseTest.test.duration && (
                          <span className="text-sm text-muted-foreground">
                            {courseTest.test.duration} min
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleStartAssessment(courseTest.test.id)}
                        className="w-full"
                        variant="default"
                      >
                        Take Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
