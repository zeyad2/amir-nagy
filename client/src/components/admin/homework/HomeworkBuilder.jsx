import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '@/services/admin.service'
import HomeworkList from './HomeworkList'
import HomeworkEditor from './HomeworkEditor'

export default function HomeworkBuilder() {
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedHomework, setSelectedHomework] = useState(null)
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(false)

  // Load homework when component mounts or when returning to list view
  useEffect(() => {
    if (view === 'list') {
      loadHomework()
    }
  }, [view])

  const loadHomework = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllHomework()
      setHomework(response.data.data?.homework || [])
    } catch (error) {
      toast.error('Failed to load homework')
      console.error('Load homework error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedHomework(null)
    setView('create')
  }

  const handleEdit = async (hw) => {
    try {
      setLoading(true)
      // Fetch full homework data including passages and questions
      const response = await adminService.getHomeworkById(hw.id)
      const fullHomeworkData = response.data.data?.homework
      setSelectedHomework(fullHomeworkData)
      setView('edit')
    } catch (error) {
      toast.error('Failed to load homework details')
      console.error('Load homework details error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (homeworkId) => {
    try {
      await adminService.deleteHomework(homeworkId)
      toast.success('Homework deleted successfully')
      loadHomework()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete homework'
      toast.error(errorMsg)
      console.error('Delete homework error:', error)
    }
  }

  const handleSave = async (homeworkData) => {
    try {
      if (selectedHomework) {
        await adminService.updateHomework(selectedHomework.id, homeworkData)
        toast.success('Homework updated successfully')
      } else {
        await adminService.createHomework(homeworkData)
        toast.success('Homework created successfully')
      }
      setView('list')
      loadHomework()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save homework'
      toast.error(errorMsg)
      throw error
    }
  }

  const handleCancel = () => {
    setView('list')
    setSelectedHomework(null)
  }

  return (
    <div className="space-y-6">
      {view === 'list' ? (
        <HomeworkList
          homework={homework}
          loading={loading}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadHomework}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Homework
            </Button>
            <h2 className="text-2xl font-bold">
              {selectedHomework ? 'Edit Homework' : 'Create New Homework'}
            </h2>
          </div>

          <HomeworkEditor
            homework={selectedHomework}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}
