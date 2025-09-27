import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PullToRefresh from '@/components/common/PullToRefresh'
import { toast } from 'react-hot-toast'
import { coursesService } from '@/services/courses.service'
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Users,
  DollarSign,
  RefreshCw
} from 'lucide-react'

export default function AdminCourses() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0
  })

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await coursesService.getCourses()
      setCourses(data.courses || [])

      // Calculate stats from courses data
      if (data.courses) {
        const stats = {
          totalCourses: data.courses.length,
          totalStudents: data.courses.reduce((sum, course) => sum + (course.stats?.activeEnrollments || 0), 0),
          totalRevenue: data.courses.reduce((sum, course) => {
            if (course.type === 'finished' && course.price) {
              return sum + (course.price * (course.stats?.activeEnrollments || 0))
            }
            return sum
          }, 0),
          activeCourses: data.courses.filter(course => course.status === 'published').length
        }
        setStats(stats)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  // Load courses on component mount
  useEffect(() => {
    fetchCourses()
  }, [])

  // Refresh function that fetches from API
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCourses()
    toast.success('Courses updated!')
    setIsRefreshing(false)
  }

  // Handle course deletion
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await coursesService.deleteCourse(courseId)
      toast.success('Course deleted successfully')
      await fetchCourses() // Refresh the list
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    }
  }

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className="max-w-7xl mx-auto"
      enabled={true}
    >
      <div className="space-y-6">
      {/* Page Header - Mobile Optimized */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 md:h-5 md:w-5 text-sat-primary" />
            <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Courses</h1>
          </div>

          {/* Desktop refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hidden md:flex"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <p className="text-gray-600 flex-1">Create and manage your SAT courses</p>

          <Button
            asChild
            className="bg-sat-primary hover:bg-sat-primary/90 h-12 md:h-auto text-base md:text-sm font-medium"
          >
            <Link to="/admin/courses/create">
              <Plus className="h-5 w-5 md:h-4 md:w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Courses</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Total Students</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRevenue.toLocaleString()} EGP</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeCourses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Mobile Optimized */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 md:h-4 md:w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 md:py-2 text-base md:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sat-primary focus:border-transparent"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-12 md:h-auto md:flex-none text-base md:text-sm"
              >
                <Filter className="h-5 w-5 md:h-4 md:w-4 mr-2" />
                All Courses
              </Button>

              <Button
                variant="outline"
                className="flex-1 h-12 md:h-auto md:flex-none text-base md:text-sm"
              >
                Live
              </Button>

              <Button
                variant="outline"
                className="flex-1 h-12 md:h-auto md:flex-none text-base md:text-sm"
              >
                Finished
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sat-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading courses...</p>
        </div>
      )}

      {/* Courses List */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate capitalize">{course.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {course.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <Badge
                  variant={course.type === 'live' ? 'default' : 'secondary'}
                  className={
                    course.type === 'live'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }
                >
                  {course.type === 'live' ? 'Live' : 'Finished'}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    course.status === 'published'
                      ? 'border-green-600 text-green-600'
                      : 'border-yellow-600 text-yellow-600'
                  }
                >
                  {course.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{course.stats?.activeEnrollments || 0}</span>
                    </div>
                    {course.price && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{course.price} EGP</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions - Improved Layout */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    className="sm:flex-1 h-11 sm:h-9 text-base sm:text-sm min-w-0 truncate"
                    asChild
                  >
                    <Link to={`/admin/courses/${course.id}`} className="flex items-center justify-center">
                      <Eye className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1 flex-shrink-0" />
                      <span className="truncate">View Details</span>
                    </Link>
                  </Button>


                  <Button
                    variant="outline"
                    className="sm:w-auto sm:px-3 h-11 sm:h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 min-w-0"
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                  >
                    <Trash2 className="h-4 w-4 sm:h-3 sm:w-3 flex-shrink-0" />
                    <span className="sm:hidden ml-2 truncate">Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

          {/* Empty State when no courses match search */}
          {filteredCourses.length === 0 && courses.length > 0 && (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No courses match your search criteria
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State when no courses exist */}
          {courses.length === 0 && !loading && (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first SAT course
                  </p>
                  <Button asChild className="bg-sat-primary hover:bg-sat-primary/90">
                    <Link to="/admin/courses/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
      </div>
    </PullToRefresh>
  )
}