import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import {
  Target,
  CheckCircle,
  Calendar,
  Clock,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Award,
  ArrowRight
} from 'lucide-react'

export default function AccessWindowTemplates({
  courseSessions = [],
  courseData,
  onApplyTemplate,
  open,
  onClose
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  // Calculate template configurations based on course data
  const calculateTemplateConfig = (templateType) => {
    const totalSessions = courseSessions.length
    const basePrice = courseData?.price || 1000
    const pricePerSession = Math.round(basePrice / totalSessions)

    switch (templateType) {
      case 'full_access':
        return {
          type: 'full',
          sessionCount: totalSessions,
          startIndex: 0,
          endIndex: totalSessions - 1,
          price: basePrice,
          pricePerSession,
          description: 'Complete access to all course content',
          features: [
            'All lessons, homework, and tests',
            'Full course timeline',
            'Maximum learning value',
            'Best price per session'
          ]
        }

      case 'monthly_package':
        const monthlyCount = Math.min(4, totalSessions)
        return {
          type: 'partial',
          sessionCount: monthlyCount,
          startIndex: 0,
          endIndex: monthlyCount - 1,
          price: pricePerSession * monthlyCount,
          pricePerSession,
          description: 'Perfect for trying out the course',
          features: [
            `First ${monthlyCount} sessions`,
            'Foundation building content',
            'Flexible commitment',
            'Good starter package'
          ]
        }

      case 'intensive_package':
        const intensiveCount = Math.min(8, totalSessions)
        const midPoint = Math.floor(totalSessions / 2)
        const startIdx = Math.max(0, midPoint - Math.floor(intensiveCount / 2))
        const endIdx = Math.min(totalSessions - 1, startIdx + intensiveCount - 1)
        return {
          type: 'partial',
          sessionCount: intensiveCount,
          startIndex: startIdx,
          endIndex: endIdx,
          price: Math.round(pricePerSession * intensiveCount * 0.9), // 10% discount
          pricePerSession: Math.round(pricePerSession * 0.9),
          description: 'Core curriculum with focused learning',
          features: [
            `${intensiveCount} core sessions`,
            'Key concepts coverage',
            '10% discount included',
            'Balanced content mix'
          ]
        }

      case 'exam_prep':
        const examCount = Math.min(3, totalSessions)
        const examStartIdx = Math.max(0, totalSessions - examCount)
        return {
          type: 'partial',
          sessionCount: examCount,
          startIndex: examStartIdx,
          endIndex: totalSessions - 1,
          price: pricePerSession * examCount,
          pricePerSession,
          description: 'Final preparation for exams',
          features: [
            `Last ${examCount} sessions`,
            'Exam-focused content',
            'Review and practice',
            'Test preparation'
          ]
        }

      case 'late_join':
        const lateJoinPoint = Math.floor(totalSessions * 0.3) // Join 30% into course
        const remainingCount = totalSessions - lateJoinPoint
        return {
          type: 'late_join',
          sessionCount: remainingCount,
          startIndex: lateJoinPoint,
          endIndex: totalSessions - 1,
          price: Math.round(pricePerSession * remainingCount * 0.85), // 15% late join discount
          pricePerSession: Math.round(pricePerSession * 0.85),
          description: 'Catch up and continue with the class',
          features: [
            `${remainingCount} remaining sessions`,
            'Late joiner discount (15%)',
            'Catch-up materials included',
            'Join ongoing class'
          ]
        }

      case 'sample_package':
        const sampleCount = Math.min(2, totalSessions)
        return {
          type: 'partial',
          sessionCount: sampleCount,
          startIndex: 0,
          endIndex: sampleCount - 1,
          price: Math.round(pricePerSession * sampleCount * 0.7), // 30% sample discount
          pricePerSession: Math.round(pricePerSession * 0.7),
          description: 'Try before you commit to more',
          features: [
            `First ${sampleCount} sessions`,
            '30% sample discount',
            'Course introduction',
            'Minimal commitment'
          ]
        }

      default:
        return null
    }
  }

  // Template definitions with metadata
  const templates = [
    {
      id: 'full_access',
      name: 'Full Course Access',
      icon: CheckCircle,
      color: 'green',
      popular: true,
      recommended: courseData?.type === 'finished',
      config: calculateTemplateConfig('full_access')
    },
    {
      id: 'monthly_package',
      name: 'Monthly Package',
      icon: Calendar,
      color: 'blue',
      popular: true,
      recommended: courseData?.type === 'live',
      config: calculateTemplateConfig('monthly_package')
    },
    {
      id: 'intensive_package',
      name: 'Intensive Package',
      icon: Zap,
      color: 'purple',
      popular: false,
      recommended: false,
      config: calculateTemplateConfig('intensive_package')
    },
    {
      id: 'exam_prep',
      name: 'Exam Preparation',
      icon: GraduationCap,
      color: 'orange',
      popular: true,
      recommended: false,
      config: calculateTemplateConfig('exam_prep')
    },
    {
      id: 'late_join',
      name: 'Late Join',
      icon: Users,
      color: 'amber',
      popular: false,
      recommended: false,
      config: calculateTemplateConfig('late_join')
    },
    {
      id: 'sample_package',
      name: 'Sample Package',
      icon: Star,
      color: 'pink',
      popular: false,
      recommended: false,
      config: calculateTemplateConfig('sample_package')
    }
  ]

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setPreviewData(template.config)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }

    const config = selectedTemplate.config
    if (!config) {
      toast.error('Invalid template configuration')
      return
    }

    // Apply the template
    onApplyTemplate({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      accessType: config.type,
      startSessionId: config.type !== 'full' && courseSessions[config.startIndex] ? courseSessions[config.startIndex].id : null,
      endSessionId: config.type !== 'full' && courseSessions[config.endIndex] ? courseSessions[config.endIndex].id : null,
      sessionCount: config.sessionCount,
      estimatedPrice: config.price
    })

    // Close dialog
    onClose()
  }

  const getColorClasses = (color, variant = 'default') => {
    const colors = {
      green: {
        default: 'border-green-500 bg-green-50 text-green-700',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800'
      },
      blue: {
        default: 'border-blue-500 bg-blue-50 text-blue-700',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      },
      purple: {
        default: 'border-purple-500 bg-purple-50 text-purple-700',
        icon: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800'
      },
      orange: {
        default: 'border-orange-500 bg-orange-50 text-orange-700',
        icon: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800'
      },
      amber: {
        default: 'border-amber-500 bg-amber-50 text-amber-700',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-800'
      },
      pink: {
        default: 'border-pink-500 bg-pink-50 text-pink-700',
        icon: 'text-pink-600',
        badge: 'bg-pink-100 text-pink-800'
      }
    }
    return colors[color]?.[variant] || colors.blue[variant]
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Access Window Templates</span>
          </DialogTitle>
          <DialogDescription>
            Choose from pre-configured access patterns or customize your own
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const IconComponent = template.icon
                const config = template.config
                const isSelected = selectedTemplate?.id === template.id

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? getColorClasses(template.color, 'default')
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`h-5 w-5 ${getColorClasses(template.color, 'icon')}`} />
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                        </div>
                        <div className="flex space-x-1">
                          {template.popular && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {template.recommended && (
                            <Badge className={`text-xs ${getColorClasses(template.color, 'badge')}`}>
                              <Award className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{config?.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Sessions:</span>
                          <span className="font-medium">{config?.sessionCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium text-green-600">{config?.price || 0} EGP</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {config?.features?.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Template Preview */}
          <div className="lg:col-span-1">
            {previewData ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base">Template Preview</CardTitle>
                  <CardDescription>
                    {selectedTemplate?.name} configuration
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <BookOpen className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-blue-600">{previewData.sessionCount}</p>
                      <p className="text-xs text-gray-600">Sessions</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-600">{previewData.price}</p>
                      <p className="text-xs text-gray-600">EGP</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Features List */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Included Features:</h4>
                    <div className="space-y-1">
                      {previewData.features?.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Session Range */}
                  {previewData.type !== 'full' && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Session Range:</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>From: Session {(previewData.startIndex || 0) + 1}</div>
                        <div>To: Session {(previewData.endIndex || 0) + 1}</div>
                        <div>Total: {previewData.sessionCount} sessions</div>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span>Per session:</span>
                      <span className="font-medium">{previewData.pricePerSession} EGP</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span>Total cost:</span>
                      <span className="font-bold text-green-600">{previewData.price} EGP</span>
                    </div>
                  </div>

                  {/* Savings indicator */}
                  {previewData.type !== 'full' && courseData?.price && (
                    <div className="text-center">
                      {previewData.price < courseData.price ? (
                        <div className="flex items-center justify-center space-x-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {Math.round((1 - previewData.price / courseData.price) * 100)}% savings
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          Compare with full course: {courseData.price} EGP
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="text-center py-8">
                  <Target className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Select a template</p>
                  <p className="text-sm text-gray-500">
                    Choose a template to see the preview and configuration
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Templates can be customized after selection</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
              className="flex items-center space-x-2"
            >
              <span>Apply Template</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}