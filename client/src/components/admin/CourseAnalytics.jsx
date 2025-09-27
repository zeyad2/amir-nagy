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
      completionRate: 78.3
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
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span>Basic Information</span>
        </h2>
        <p className="text-gray-600 mt-1">Course overview and key details</p>
      </div>

      {/* Course Statistics */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Course Statistics</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Current enrollment and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{course.stats.activeEnrollments}</h3>
              <p className="text-lg font-medium text-gray-700 mb-2">Total Students Enrolled</p>
              <div className="flex items-center justify-center space-x-2">
                {getTrendIcon(course.stats.activeEnrollments, 18)}
                <span className={`text-sm font-medium ${getTrendColor(course.stats.activeEnrollments, 18)}`}>
                  {course.stats.activeEnrollments > 18 ? '+' : ''}{course.stats.activeEnrollments - 18} from last month
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Activity and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Statistics */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span>Assessment Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Student engagement with course assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center bg-white rounded-xl p-6 border border-green-100">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-4xl font-bold text-green-600 block">
                  {mockAnalyticsData.performanceMetrics.totalAssessments}
                </span>
                <p className="text-sm text-gray-600 mt-2 font-medium">Total Attempts</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-white rounded-lg p-4 border border-green-100">
                  <span className="text-2xl font-bold text-green-600 block">
                    {Math.round(mockAnalyticsData.performanceMetrics.totalAssessments * 0.68)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Homework</p>
                </div>
                <div className="text-center bg-white rounded-lg p-4 border border-green-100">
                  <span className="text-2xl font-bold text-purple-600 block">
                    {Math.round(mockAnalyticsData.performanceMetrics.totalAssessments * 0.32)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Tests</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest course interactions and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-purple-100">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-medium">5 new enrollments today</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-purple-100">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-medium">12 assignments submitted</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-purple-100">
                <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-medium">3 tests completed</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-purple-100">
                <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-medium">Average session duration: 45min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}