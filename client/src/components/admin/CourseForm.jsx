import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/services/admin.service'
import { toast } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Upload,
  X,
  DollarSign,
  FileText,
  BookOpen,
  Users,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  Check
} from 'lucide-react'

export default function CourseForm({ course = null, onSuccess }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const isEditing = !!course

  // Form state
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    type: course?.type || 'live',
    price: course?.price?.toString() || '',
    status: course?.status || 'published',
    thumbnail: null
  })

  const [thumbnailPreview, setThumbnailPreview] = useState(course?.thumbnailUrl || null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRequiredFields, setShowRequiredFields] = useState(false)

  // Character limits
  const MAX_TITLE_LENGTH = 100
  const MAX_DESCRIPTION_LENGTH = 500

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required'
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required'
    } else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
    }

    // Type validation
    if (!formData.type || !['live', 'finished'].includes(formData.type)) {
      newErrors.type = 'Please select a valid course type'
    }

    // Price validation for finished courses
    if (formData.type === 'finished') {
      if (!formData.price || formData.price.trim() === '') {
        newErrors.price = 'Price is required for finished courses'
      } else {
        const price = parseFloat(formData.price)
        if (isNaN(price) || price < 0) {
          newErrors.price = 'Please enter a valid price'
        } else if (price > 10000) {
          newErrors.price = 'Price cannot exceed 10,000 EGP'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Handle file upload with mobile support
  const handleThumbnailChange = (event) => {
    const file = event.target.files[0]

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      setFormData(prev => ({ ...prev, thumbnail: file }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open camera/gallery with mobile support
  const openImagePicker = () => {
    if (fileInputRef.current) {
      // On mobile, this will automatically show camera and gallery options
      fileInputRef.current.click()
    }
  }

  // Remove thumbnail
  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null }))
    setThumbnailPreview(course?.thumbnailUrl || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowRequiredFields(true)

    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setIsSubmitting(true)

    try {
      // Use FormData when there's a file to upload
      const submitData = new FormData()

      submitData.append('title', formData.title.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('type', formData.type)
      submitData.append('status', formData.status)

      // Add price for finished courses
      if (formData.type === 'finished' && formData.price) {
        submitData.append('price', formData.price)
      }

      // Add thumbnail if it's a new file
      if (formData.thumbnail instanceof File) {
        submitData.append('thumbnail', formData.thumbnail)
      }

      let response
      if (isEditing) {
        response = await adminService.updateCourse(course.id, submitData)
        toast.success('Course updated successfully!')
      } else {
        response = await adminService.createCourse(submitData)
        toast.success('Course created successfully!')
      }

      if (onSuccess) {
        onSuccess(response.data)
      } else {
        navigate('/admin/courses')
      }

    } catch (error) {
      console.error('Course submission error:', error)
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to ${isEditing ? 'update' : 'create'} course`
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate remaining characters
  const remainingTitle = MAX_TITLE_LENGTH - formData.title.length
  const remainingDescription = MAX_DESCRIPTION_LENGTH - formData.description.length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-sat-primary" />
          <CardTitle>
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </CardTitle>
        </div>
        <p className="text-gray-600">
          {isEditing
            ? 'Update course information and settings'
            : 'Add a new SAT course with details and pricing'
          }
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <FormField>
            <FormLabel error={errors.title}>
              Course Title <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter course title (e.g., SAT Math Intensive Course)"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                maxLength={MAX_TITLE_LENGTH}
                className={errors.title ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                <FormMessage error={errors.title} />
                <span className={`text-xs ${remainingTitle < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {remainingTitle} characters remaining
                </span>
              </div>
            </FormControl>
          </FormField>

          {/* Course Description */}
          <FormField>
            <FormLabel error={errors.description}>
              Course Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what students will learn in this course..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-1">
                <FormMessage error={errors.description} />
                <span className={`text-xs ${remainingDescription < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                  {remainingDescription} characters remaining
                </span>
              </div>
            </FormControl>
          </FormField>

          {/* Course Type */}
          <FormField>
            <FormLabel error={errors.type}>
              Course Type <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.type === 'live'
                      ? 'border-sat-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange('type', 'live')}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="type"
                      value="live"
                      checked={formData.type === 'live'}
                      onChange={() => handleChange('type', 'live')}
                      className="text-sat-primary focus:ring-sat-primary"
                    />
                    <Users className="h-4 w-4 text-sat-primary" />
                    <label className="font-medium cursor-pointer">Live Course</label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 ml-6">
                    Ongoing classes with scheduled sessions and enrollment requests
                  </p>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.type === 'finished'
                      ? 'border-sat-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange('type', 'finished')}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="type"
                      value="finished"
                      checked={formData.type === 'finished'}
                      onChange={() => handleChange('type', 'finished')}
                      className="text-sat-primary focus:ring-sat-primary"
                    />
                    <Clock className="h-4 w-4 text-sat-primary" />
                    <label className="font-medium cursor-pointer">Finished Course</label>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 ml-6">
                    Pre-recorded content available for immediate purchase and access
                  </p>
                </div>
              </div>
            </FormControl>
            <FormMessage error={errors.type} />
          </FormField>

          {/* Course Price - Show for finished courses or when editing existing course */}
          {(formData.type === 'finished' || (isEditing && course?.price)) && (
            <FormField>
              <FormLabel error={errors.price}>
                Course Price (EGP) {formData.type === 'finished' && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    min="0"
                    max="10000"
                    step="0.01"
                    className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                  />
                </div>
              </FormControl>
              <FormMessage error={errors.price} />
              {formData.type === 'live' && (
                <FormDescription>
                  Leave empty for live courses that use enrollment requests
                </FormDescription>
              )}
            </FormField>
          )}

          {/* Thumbnail Upload - Mobile Optimized */}
          <FormField>
            <FormLabel>Course Thumbnail</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="Course thumbnail"
                      className="w-full max-w-xs h-48 md:w-32 md:h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 md:p-1 hover:bg-red-600 shadow-lg"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      <X className="h-4 w-4 md:h-3 md:w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
                    <ImageIcon className="h-12 w-12 md:h-8 md:w-8 text-gray-400 mx-auto mb-3 md:mb-2" />
                    <p className="text-sm text-gray-600">No thumbnail selected</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                )}

                {/* Mobile-optimized upload buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openImagePicker}
                    className="flex-1 md:flex-none h-12 md:h-auto text-base md:text-sm"
                  >
                    <Upload className="h-5 w-5 md:h-4 md:w-4 mr-2" />
                    {thumbnailPreview ? 'Change Photo' : 'Add Photo'}
                  </Button>

                  {/* Quick camera button on mobile */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openImagePicker}
                    className="sm:hidden h-12 text-base bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Camera
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment" // This enables camera on mobile devices
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </div>
            </FormControl>
            <FormDescription>
              Upload a course thumbnail image. On mobile, you can take a photo or choose from gallery.
            </FormDescription>
          </FormField>

          {/* Status Indicator */}
          <FormField>
            <FormLabel>Course Status</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Published
                </Badge>
                <span className="text-sm text-gray-600">
                  Course will be visible to students once created
                </span>
              </div>
            </FormControl>
          </FormField>

          {/* Required Fields Notice */}
          {showRequiredFields && Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Actions - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/courses')}
              className="w-full sm:w-auto h-12 md:h-auto text-base md:text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-full sm:w-auto h-12 md:h-auto text-base md:text-sm bg-sat-primary hover:bg-sat-primary/90 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-5 w-5 md:h-4 md:w-4 mr-2" />
                  {isEditing ? 'Updating Course...' : 'Creating Course...'}
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 md:h-4 md:w-4 mr-2" />
                  {isEditing ? 'Update Course' : 'Create Course'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}