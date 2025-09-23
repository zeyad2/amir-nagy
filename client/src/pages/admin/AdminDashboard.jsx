import { useState, useEffect } from 'react'
import { useAuth } from '@/utils/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, AlertCircle, TrendingUp, Plus, FileText, UserCheck, MessageSquare, Loader2 } from 'lucide-react'
import { adminService } from '@/services/admin.service'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getDashboardStats()
      // The API returns data in response.data.data structure
      setStats(response.data.data)
    } catch (err) {
      setError('Failed to load dashboard statistics')
      console.error('Dashboard stats error:', err)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      description: 'Registered students',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Courses',
      value: stats?.activeCourses || 0,
      description: 'Published courses',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      description: 'Awaiting approval',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Recent Submissions',
      value: stats?.recentSubmissions || 0,
      description: 'Last 7 days',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Add new course',
      icon: Plus,
      href: '/admin/courses/create',
      color: 'bg-sat-primary hover:bg-sat-primary/90'
    },
    {
      title: 'Add Assessment',
      description: 'Create homework or test',
      icon: FileText,
      href: '/admin/assessments/create',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'View Requests',
      description: 'Manage enrollments',
      icon: UserCheck,
      href: '/admin/enrollment-requests',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Send Reports',
      description: 'WhatsApp reports',
      icon: MessageSquare,
      href: '/admin/reports',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage courses, students, and platform content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-sat-primary" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage courses, students, and platform content
          </p>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-600">{error}</p>
                <Button
                  onClick={fetchDashboardStats}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, Mr. {user?.firstName}. Here's your platform overview.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 text-white border-0 ${action.color}`}
                  onClick={() => window.location.href = action.href}
                >
                  <IconComponent className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Platform Status</CardTitle>
          <CardDescription>
            System overview and important updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">All systems operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Database: Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Payment gateway: Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}