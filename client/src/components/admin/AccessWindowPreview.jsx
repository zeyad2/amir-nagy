import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Eye,
  BookOpen,
  FileText,
  GraduationCap,
  AlertTriangle,
  Lock,
  Unlock,
  TrendingUp,
  PieChart
} from 'lucide-react'

export default function AccessWindowPreview({
  accessWindow,
  courseData,
  studentData,
  onClose
}) {
  const [activeView, setActiveView] = useState('overview') // 'overview', 'sessions', 'pricing', 'content'

  if (!accessWindow) {
    return (
      <div className="text-center py-8">
        <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No access window selected for preview</p>
      </div>
    )
  }

  // Calculate derived data
  const totalSessions = courseData?.totalSessions || 0
  const sessionCount = accessWindow.sessionCount || 0
  const percentage = totalSessions > 0 ? Math.round((sessionCount / totalSessions) * 100) : 0
  const pricePerSession = accessWindow.calculatedPrice && sessionCount > 0 ?
    Math.round(accessWindow.calculatedPrice / sessionCount) : 0

  // Mock content data - in real implementation, this would come from API
  const contentBreakdown = {
    lessons: Math.round(sessionCount * 0.7), // Assume 70% are lessons
    homework: Math.round(sessionCount * 0.2), // 20% homework
    tests: Math.round(sessionCount * 0.1) // 10% tests
  }

  const mockSessions = Array.from({ length: sessionCount }, (_, index) => ({
    id: `session-${index + 1}`,
    title: `Session ${index + 1}`,
    date: new Date(Date.now() + (index * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    type: index % 7 === 0 ? 'test' : index % 3 === 0 ? 'homework' : 'lesson',
    duration: 90,
    status: 'accessible'
  }))

  // Pricing tiers for comparison
  const pricingTiers = [
    {
      name: 'Single Session',
      sessions: 1,
      price: pricePerSession || 100,
      savings: 0
    },
    {
      name: 'Current Selection',
      sessions: sessionCount,
      price: accessWindow.calculatedPrice || 0,
      savings: sessionCount > 1 ? Math.round((pricePerSession * sessionCount - accessWindow.calculatedPrice) / (pricePerSession * sessionCount) * 100) : 0,
      highlighted: true
    },
    {
      name: 'Full Course',
      sessions: totalSessions,
      price: courseData?.price || 0,
      savings: courseData?.price && accessWindow.calculatedPrice ?
        Math.round((courseData.price - accessWindow.calculatedPrice) / courseData.price * 100) : 0
    }
  ]

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Eye className="h-6 w-6 text-blue-600" />
            <span>Access Window Preview</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Student view for {studentData?.name || 'selected student'}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {percentage}% of course
        </Badge>
      </div>

      {/* View Selector */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'sessions', label: 'Sessions', icon: Calendar },
          { id: 'pricing', label: 'Pricing', icon: DollarSign },
          { id: 'content', label: 'Content', icon: BookOpen }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Access Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{sessionCount}</span>
                  </div>
                  <p className="text-sm text-gray-600">Accessible Sessions</p>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{accessWindow.calculatedPrice || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Price (EGP)</p>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">{sessionCount * 90}</span>
                  </div>
                  <p className="text-sm text-gray-600">Total Minutes</p>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">{pricePerSession}</span>
                  </div>
                  <p className="text-sm text-gray-600">Per Session (EGP)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Access Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start Date</p>
                    <p className="text-lg text-blue-600">
                      {accessWindow.startDate ? new Date(accessWindow.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not set'}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">End Date</p>
                    <p className="text-lg text-blue-600">
                      {accessWindow.endDate ? new Date(accessWindow.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not set'}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                {accessWindow.startDate && accessWindow.endDate && (
                  <div className="text-center p-3 border-2 border-dashed border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600">Total Duration</p>
                    <p className="text-lg font-bold text-blue-600">
                      {Math.ceil((new Date(accessWindow.endDate) - new Date(accessWindow.startDate)) / (1000 * 60 * 60 * 24 * 7))} weeks
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions Tab */}
      {activeView === 'sessions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session Timeline</span>
                <Badge variant="secondary">{sessionCount} sessions</Badge>
              </CardTitle>
              <CardDescription>
                Sessions the student will have access to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {mockSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="flex items-center space-x-4 p-3 border rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                      <span className="text-sm font-medium text-green-600">{index + 1}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{session.title}</p>
                        <Badge
                          variant="outline"
                          className={
                            session.type === 'test' ? 'border-purple-500 text-purple-600' :
                            session.type === 'homework' ? 'border-orange-500 text-orange-600' :
                            'border-blue-500 text-blue-600'
                          }
                        >
                          {session.type === 'test' ? <GraduationCap className="h-3 w-3 mr-1" /> :
                           session.type === 'homework' ? <FileText className="h-3 w-3 mr-1" /> :
                           <BookOpen className="h-3 w-3 mr-1" />}
                          {session.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()} • {session.duration} minutes
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Unlock className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Accessible</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Locked Sessions Preview */}
          {totalSessions > sessionCount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-600">
                  <Lock className="h-5 w-5" />
                  <span>Locked Sessions</span>
                </CardTitle>
                <CardDescription>
                  Sessions not included in this access window
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{totalSessions - sessionCount} sessions locked</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Student will not have access to these sessions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pricing Tab */}
      {activeView === 'pricing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
              <CardDescription>
                Compare different access options and their pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingTiers.map((tier, index) => (
                  <div
                    key={tier.name}
                    className={`p-4 border rounded-lg ${
                      tier.highlighted
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium flex items-center space-x-2">
                          <span>{tier.name}</span>
                          {tier.highlighted && (
                            <Badge className="bg-blue-600">Selected</Badge>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {tier.sessions} session{tier.sessions > 1 ? 's' : ''}
                          {tier.savings > 0 && (
                            <span className="text-green-600 ml-2">
                              • {tier.savings}% savings
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{tier.price} EGP</p>
                        <p className="text-sm text-gray-600">
                          {Math.round(tier.price / tier.sessions)} EGP/session
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Calculation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Price Calculation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Base course price:</span>
                  <span className="font-medium">{courseData?.price || 0} EGP</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Total sessions:</span>
                  <span className="font-medium">{totalSessions}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Price per session:</span>
                  <span className="font-medium">{Math.round((courseData?.price || 0) / totalSessions)} EGP</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Selected sessions:</span>
                  <span className="font-medium">{sessionCount}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2 text-lg">
                  <span className="font-semibold">Final price:</span>
                  <span className="font-bold text-green-600">{accessWindow.calculatedPrice || 0} EGP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tab */}
      {activeView === 'content' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-600">
                <BookOpen className="h-5 w-5" />
                <span>Lessons</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">{contentBreakdown.lessons}</p>
                <p className="text-sm text-gray-600">Video lessons accessible</p>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: Math.min(contentBreakdown.lessons, 3) }, (_, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Lesson {i + 1}</span>
                    </div>
                  ))}
                  {contentBreakdown.lessons > 3 && (
                    <p className="text-xs text-gray-500">+{contentBreakdown.lessons - 3} more</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <FileText className="h-5 w-5" />
                <span>Homework</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">{contentBreakdown.homework}</p>
                <p className="text-sm text-gray-600">Practice assignments</p>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: Math.min(contentBreakdown.homework, 3) }, (_, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Assignment {i + 1}</span>
                    </div>
                  ))}
                  {contentBreakdown.homework > 3 && (
                    <p className="text-xs text-gray-500">+{contentBreakdown.homework - 3} more</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-600">
                <GraduationCap className="h-5 w-5" />
                <span>Tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">{contentBreakdown.tests}</p>
                <p className="text-sm text-gray-600">Graded assessments</p>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: Math.min(contentBreakdown.tests, 3) }, (_, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Test {i + 1}</span>
                    </div>
                  ))}
                  {contentBreakdown.tests > 3 && (
                    <p className="text-xs text-gray-500">+{contentBreakdown.tests - 3} more</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warning Messages */}
      {percentage > 80 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-amber-900 font-medium">Consider Full Access</p>
              <p className="text-amber-700 text-sm">
                This access window covers {percentage}% of the course. Full access might be more cost-effective.
              </p>
            </div>
          </div>
        </div>
      )}

      {onClose && (
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      )}
    </div>
  )
}