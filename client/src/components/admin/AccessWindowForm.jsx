import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import {
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  Eye
} from 'lucide-react'

export default function AccessWindowForm({
  enrollments = [],
  courseSessions = [],
  courseData,
  onSubmit,
  onCancel,
  initialData = null,
  loading = false
}) {
  const [formData, setFormData] = useState({
    enrollmentId: '',
    accessType: 'partial', // 'full', 'partial', 'late_join'
    startSessionId: '',
    endSessionId: ''
  })

  const [validation, setValidation] = useState({
    isValid: false,
    errors: [],
    warnings: []
  })

  const [previewData, setPreviewData] = useState(null)

  // Initialize form with existing data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        enrollmentId: initialData.enrollmentId,
        accessType: 'partial', // Always partial since we're editing existing windows
        startSessionId: initialData.startSessionId,
        endSessionId: initialData.endSessionId
      })
    }
  }, [initialData])

  // Validate form and generate preview whenever form data changes
  useEffect(() => {
    validateForm()
    generatePreview()
  }, [formData, courseSessions])

  // Form validation
  const validateForm = () => {
    const errors = []
    const warnings = []

    if (!formData.enrollmentId) {
      errors.push('Please select an enrollment')
    }

    if (formData.accessType !== 'full') {
      if (!formData.startSessionId) {
        errors.push('Please select a start session')
      }
      if (!formData.endSessionId) {
        errors.push('Please select an end session')
      }

      // Validate session order
      if (formData.startSessionId && formData.endSessionId && courseSessions.length > 0) {
        const startSession = courseSessions.find(s => s.id === formData.startSessionId)
        const endSession = courseSessions.find(s => s.id === formData.endSessionId)

        if (startSession && endSession) {
          if (new Date(startSession.date) > new Date(endSession.date)) {
            errors.push('Start session must be before or same as end session')
          }

          // Check for potential overlaps (warning)
          const startIndex = courseSessions.findIndex(s => s.id === formData.startSessionId)
          const endIndex = courseSessions.findIndex(s => s.id === formData.endSessionId)

          if (startIndex !== -1 && endIndex !== -1) {
            const sessionCount = endIndex - startIndex + 1
            if (sessionCount > courseSessions.length * 0.8) {
              warnings.push('This access window covers most of the course - consider full access instead')
            }
          }
        }
      }
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    })
  }

  // Generate preview data
  const generatePreview = () => {
    if (formData.accessType === 'full') {
      setPreviewData({
        type: 'full',
        sessionCount: courseSessions.length,
        totalSessions: courseSessions.length,
        accessibleSessions: courseSessions,
        calculatedPrice: courseData?.price || 0,
        pricePerSession: courseData?.price ? Math.round(courseData.price / courseSessions.length) : 0,
        startDate: courseSessions[0]?.date,
        endDate: courseSessions[courseSessions.length - 1]?.date
      })
      return
    }

    if (!formData.startSessionId || !formData.endSessionId || courseSessions.length === 0) {
      setPreviewData(null)
      return
    }

    const startIndex = courseSessions.findIndex(s => s.id === formData.startSessionId)
    const endIndex = courseSessions.findIndex(s => s.id === formData.endSessionId)

    if (startIndex === -1 || endIndex === -1) {
      setPreviewData(null)
      return
    }

    const sessionCount = endIndex - startIndex + 1
    const accessibleSessions = courseSessions.slice(startIndex, endIndex + 1)

    // Calculate pricing based on session count
    const basePrice = courseData?.price || 1000
    const pricePerSession = Math.round(basePrice / courseSessions.length)
    const calculatedPrice = pricePerSession * sessionCount

    setPreviewData({
      type: formData.accessType,
      sessionCount,
      totalSessions: courseSessions.length,
      accessibleSessions,
      calculatedPrice,
      pricePerSession,
      startDate: accessibleSessions[0]?.date,
      endDate: accessibleSessions[accessibleSessions.length - 1]?.date,
      percentage: Math.round((sessionCount / courseSessions.length) * 100)
    })
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!validation.isValid) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    // For full access, we don't create access windows - just approve enrollment
    if (formData.accessType === 'full') {
      onSubmit({
        type: 'full_access',
        enrollmentId: formData.enrollmentId
      })
      return
    }

    // For partial/late join, create access window
    onSubmit({
      type: 'create_window',
      enrollmentId: formData.enrollmentId,
      startSessionId: formData.startSessionId,
      endSessionId: formData.endSessionId,
      accessType: formData.accessType
    })
  }

  // Handle field changes
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Auto-adjust end session for late join
    if (field === 'accessType' && value === 'late_join' && formData.startSessionId) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        endSessionId: courseSessions[courseSessions.length - 1]?.id || ''
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Selection */}
      <div>
        <Label htmlFor="enrollment">Select Student Enrollment</Label>
        <Select
          value={formData.enrollmentId}
          onValueChange={(value) => updateField('enrollmentId', value)}
          disabled={!!initialData} // Disable if editing
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a student enrollment" />
          </SelectTrigger>
          <SelectContent>
            {enrollments.map((enrollment) => (
              <SelectItem key={enrollment.id} value={enrollment.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{enrollment.student?.name || 'Unknown Student'}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {enrollment.student?.email}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {initialData && (
          <p className="text-xs text-gray-500 mt-1">
            Editing access window for this enrollment
          </p>
        )}
      </div>

      {/* Access Type Selection */}
      <div>
        <Label>Access Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <button
            type="button"
            onClick={() => updateField('accessType', 'full')}
            className={`p-4 border rounded-lg text-left transition-colors ${
              formData.accessType === 'full'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
            disabled={!!initialData} // Disable if editing - can't change to full access
          >
            <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
            <div className="font-medium">Full Access</div>
            <div className="text-sm text-gray-600">All {courseSessions.length} sessions</div>
            {courseData?.price && (
              <div className="text-xs text-green-600 mt-1">{courseData.price} EGP</div>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateField('accessType', 'partial')}
            className={`p-4 border rounded-lg text-left transition-colors ${
              formData.accessType === 'partial'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Clock className="h-5 w-5 text-blue-600 mb-2" />
            <div className="font-medium">Partial Access</div>
            <div className="text-sm text-gray-600">Custom session range</div>
            <div className="text-xs text-blue-600 mt-1">Flexible pricing</div>
          </button>

          <button
            type="button"
            onClick={() => updateField('accessType', 'late_join')}
            className={`p-4 border rounded-lg text-left transition-colors ${
              formData.accessType === 'late_join'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <Users className="h-5 w-5 text-orange-600 mb-2" />
            <div className="font-medium">Late Join</div>
            <div className="text-sm text-gray-600">From session onwards</div>
            <div className="text-xs text-orange-600 mt-1">Prorated pricing</div>
          </button>
        </div>

        {initialData && (
          <p className="text-xs text-amber-600 mt-2 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Cannot change access type when editing - delete and recreate for different type
          </p>
        )}
      </div>

      {/* Session Selection (only for partial/late join) */}
      {formData.accessType !== 'full' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startSession">Start Session</Label>
              <Select
                value={formData.startSessionId}
                onValueChange={(value) => updateField('startSessionId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start session" />
                </SelectTrigger>
                <SelectContent>
                  {courseSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{session.title || `Session ${session.id}`}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endSession">End Session</Label>
              <Select
                value={formData.endSessionId}
                onValueChange={(value) => updateField('endSessionId', value)}
                disabled={formData.accessType === 'late_join'} // Auto-set for late join
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end session" />
                </SelectTrigger>
                <SelectContent>
                  {courseSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{session.title || `Session ${session.id}`}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.accessType === 'late_join' && (
                <p className="text-xs text-gray-500 mt-1">
                  Automatically set to last session for late join
                </p>
              )}
            </div>
          </div>

          {/* Session Range Visualization */}
          {formData.startSessionId && formData.endSessionId && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Session Range Visualization
              </h4>
              <div className="flex items-center space-x-1">
                {courseSessions.map((session, index) => {
                  const isIncluded = courseSessions.findIndex(s => s.id === formData.startSessionId) <= index &&
                                   index <= courseSessions.findIndex(s => s.id === formData.endSessionId)
                  return (
                    <div
                      key={session.id}
                      className={`flex-1 h-2 rounded ${
                        isIncluded ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                      title={`${session.title || `Session ${index + 1}`} - ${new Date(session.date).toLocaleDateString()}`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Session 1</span>
                <span>Session {courseSessions.length}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-center space-x-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="flex items-center space-x-2 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Preview Section */}
      {previewData && (
        <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Access Preview</span>
            </h4>
            <Badge variant="secondary">
              {previewData.percentage ? `${previewData.percentage}% of course` : 'Full Course'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{previewData.sessionCount}</p>
              <p className="text-xs text-gray-600">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{previewData.calculatedPrice} EGP</p>
              <p className="text-xs text-gray-600">Total Price</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{previewData.pricePerSession} EGP</p>
              <p className="text-xs text-gray-600">Per Session</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">
                {Math.round(previewData.calculatedPrice / previewData.sessionCount)} EGP
              </p>
              <p className="text-xs text-gray-600">Avg/Session</p>
            </div>
          </div>

          {previewData.startDate && previewData.endDate && (
            <div className="text-sm text-gray-600 text-center">
              <Calendar className="h-4 w-4 inline mr-1" />
              {new Date(previewData.startDate).toLocaleDateString()} - {new Date(previewData.endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!validation.isValid || loading}
        >
          {loading ? 'Processing...' : (initialData ? 'Update Access Window' : 'Create Access Window')}
        </Button>
      </div>
    </div>
  )
}