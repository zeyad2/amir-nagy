import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import {
  Line,
  Bar,
  Doughnut
} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  BookOpen,
  Download,
  Calendar,
  Target,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  PieChart,
  LineChart,
  FileText
} from 'lucide-react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function CourseAnalytics({ course, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d, 1y

  // Mock analytics data - in real app, this would come from API
  const mockAnalyticsData = useMemo(() => ({
    enrollmentTrend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [{
        label: 'New Enrollments',
        data: [5, 8, 12, 15, 18, 22],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    sessionPopularity: {
      labels: course.content?.lessons?.slice(0, 8)?.map((lesson, idx) => `Session ${idx + 1}`) ||
              ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Session 5'],
      datasets: [{
        label: 'Session Views',
        data: [45, 38, 42, 35, 41, 33, 39, 44],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)'
      }]
    },
    completionRates: {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [{
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)'
      }]
    },
    revenueData: {
      thisMonth: 15680,
      lastMonth: 12450,
      growth: 25.9
    },
    performanceMetrics: {
      averageScore: 82.5,
      totalAssessments: 156,
      completionRate: 78.3,
      engagementScore: 8.7
    },
    popularContent: [
      { name: 'Reading Comprehension Basics', views: 145, type: 'lesson' },
      { name: 'SAT Writing Practice Test 1', views: 132, type: 'test' },
      { name: 'Grammar Fundamentals', views: 128, type: 'lesson' },
      { name: 'Vocabulary Building Exercises', views: 98, type: 'homework' },
      { name: 'Critical Reading Strategies', views: 89, type: 'lesson' }
    ]
  }), [course])

  // Chart options with responsive design
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)'
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%'
          }
        }
      }
    },
    cutout: '60%'
  }

  // Calculate trend indicators
  const getTrendIcon = (current, previous) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-400'
  }

  // Export functionality
  const handleExport = async (format) => {
    setLoading(true)
    try {
      // Mock export - in real app, this would call API
      await new Promise(resolve => setTimeout(resolve, 1000))

      const reportData = {
        course: course.title,
        dateRange: timeRange,
        metrics: mockAnalyticsData.performanceMetrics,
        revenue: mockAnalyticsData.revenueData,
        students: course.stats.activeEnrollments,
        completionRate: mockAnalyticsData.performanceMetrics.completionRate
      }

      if (format === 'csv') {
        const csvContent = `Course Analytics Report
Course,${course.title}
Date Range,${timeRange}
Active Students,${course.stats.activeEnrollments}
Average Score,${mockAnalyticsData.performanceMetrics.averageScore}%
Completion Rate,${mockAnalyticsData.performanceMetrics.completionRate}%
This Month Revenue,${mockAnalyticsData.revenueData.thisMonth} EGP
Last Month Revenue,${mockAnalyticsData.revenueData.lastMonth} EGP
Revenue Growth,${mockAnalyticsData.revenueData.growth}%`

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `course-analytics-${course.title.replace(/\s+/g, '-').toLowerCase()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(reportData, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `course-analytics-${course.title.replace(/\s+/g, '-').toLowerCase()}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }

      toast.success(`Analytics report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export analytics report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Course Analytics</span>
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive performance insights and metrics</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={loading}
            className="justify-center sm:justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={loading}
            className="justify-center sm:justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{course.stats.activeEnrollments}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(course.stats.activeEnrollments, 18)}
                  <span className={`text-xs font-medium ${getTrendColor(course.stats.activeEnrollments, 18)}`}>
                    {course.stats.activeEnrollments > 18 ? '+' : ''}{course.stats.activeEnrollments - 18} from last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.performanceMetrics.averageScore}%</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(82.5, 78.2)}
                  <span className={`text-xs font-medium ${getTrendColor(82.5, 78.2)}`}>
                    +4.3% from last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.performanceMetrics.completionRate}%</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(78.3, 75.8)}
                  <span className={`text-xs font-medium ${getTrendColor(78.3, 75.8)}`}>
                    +2.5% from last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue This Month</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.revenueData.thisMonth.toLocaleString()} EGP</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(mockAnalyticsData.revenueData.thisMonth, mockAnalyticsData.revenueData.lastMonth)}
                  <span className={`text-xs font-medium ${getTrendColor(mockAnalyticsData.revenueData.thisMonth, mockAnalyticsData.revenueData.lastMonth)}`}>
                    +{mockAnalyticsData.revenueData.growth}% from last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Enrollment Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5 text-blue-600" />
              <span>Enrollment Trend</span>
            </CardTitle>
            <CardDescription>
              Student enrollment over the past 6 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72 lg:h-64">
              <Line
                data={mockAnalyticsData.enrollmentTrend}
                options={chartOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Popularity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Session Popularity</span>
            </CardTitle>
            <CardDescription>
              Most and least popular course sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72 lg:h-64">
              <Bar
                data={mockAnalyticsData.sessionPopularity}
                options={chartOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Completion Rates Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <span>Course Completion</span>
            </CardTitle>
            <CardDescription>
              Student progress distribution across the course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72 lg:h-64">
              <Doughnut
                data={mockAnalyticsData.completionRates}
                options={doughnutOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Popular Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Most Popular Content</span>
            </CardTitle>
            <CardDescription>
              Top performing lessons, homework, and tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.popularContent.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={item.type === 'lesson' ? 'default' : item.type === 'test' ? 'destructive' : 'secondary'} className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="text-sm text-gray-600">{item.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">
                  {mockAnalyticsData.performanceMetrics.engagementScore}/10
                </span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Excellent
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${mockAnalyticsData.performanceMetrics.engagementScore * 10}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                Based on session attendance, assignment completion, and interaction rates
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assessment Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-3xl font-bold text-blue-600">
                  {mockAnalyticsData.performanceMetrics.totalAssessments}
                </span>
                <p className="text-xs text-gray-600 mt-1">Total Attempts</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-lg font-semibold text-green-600">
                    {Math.round(mockAnalyticsData.performanceMetrics.totalAssessments * 0.68)}
                  </span>
                  <p className="text-xs text-gray-600">Homework</p>
                </div>
                <div>
                  <span className="text-lg font-semibold text-purple-600">
                    {Math.round(mockAnalyticsData.performanceMetrics.totalAssessments * 0.32)}
                  </span>
                  <p className="text-xs text-gray-600">Tests</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">5 new enrollments today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">12 assignments submitted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">3 tests completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Average session duration: 45min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}