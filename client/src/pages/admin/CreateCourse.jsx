import { useNavigate } from 'react-router-dom'
import CourseForm from '@/components/admin/CourseForm'
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function CreateCourse() {
  const navigate = useNavigate()

  const handleSuccess = (newCourse) => {
    // Navigate back to courses list after successful creation
    navigate('/admin/courses', {
      state: {
        message: 'Course created successfully!',
        newCourseId: newCourse.id
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/courses')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>

          <div className="border-l border-gray-300 pl-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-sat-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            </div>
            <p className="text-gray-600 mt-1">
              Add a new SAT course with all the details and settings
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="hidden lg:block text-right">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Quick Tips</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use descriptive titles for better SEO</li>
              <li>• Set clear pricing for finished courses</li>
              <li>• Upload attractive thumbnails</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Course Creation Form */}
      <CourseForm onSuccess={handleSuccess} />

      {/* Help Section */}
      <div className="bg-gray-50 rounded-lg p-6 lg:hidden">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Course Types:</h4>
            <ul className="text-gray-600 space-y-1">
              <li><strong>Live:</strong> Ongoing classes with enrollment requests</li>
              <li><strong>Finished:</strong> Pre-recorded content for purchase</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Best Practices:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Keep titles under 100 characters</li>
              <li>• Write detailed descriptions</li>
              <li>• Use high-quality thumbnails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}