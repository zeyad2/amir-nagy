import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '@/services/admin.service'
import TestList from './TestList'
import TestEditor from './TestEditor'

export default function TestBuilder() {
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [selectedTest, setSelectedTest] = useState(null)
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)

  // Load tests when component mounts or when returning to list view
  useEffect(() => {
    if (view === 'list') {
      loadTests()
    }
  }, [view])

  const loadTests = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllTests()
      setTests(response.data.data?.assessments || [])
    } catch (error) {
      toast.error('Failed to load tests')
      console.error('Load tests error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedTest(null)
    setView('create')
  }

  const handleEdit = async (test) => {
    try {
      setLoading(true)
      // Fetch full test data including passages and questions
      const response = await adminService.getTestById(test.id)
      const fullTestData = response.data.data?.assessment
      setSelectedTest(fullTestData)
      setView('edit')
    } catch (error) {
      toast.error('Failed to load test details')
      console.error('Load test details error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (testId) => {
    try {
      await adminService.deleteTest(testId)
      toast.success('Test deleted successfully')
      loadTests()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete test'
      toast.error(errorMsg)
      console.error('Delete test error:', error)
    }
  }

  const handleSave = async (testData) => {
    try {
      if (selectedTest) {
        await adminService.updateTest(selectedTest.id, testData)
        toast.success('Test updated successfully')
      } else {
        await adminService.createTest(testData)
        toast.success('Test created successfully')
      }
      setView('list')
      loadTests()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save test'
      toast.error(errorMsg)
      throw error
    }
  }

  const handleCancel = () => {
    setView('list')
    setSelectedTest(null)
  }

  return (
    <div className="space-y-6">
      {view === 'list' ? (
        <TestList
          tests={tests}
          loading={loading}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadTests}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
            <h2 className="text-2xl font-bold">
              {selectedTest ? 'Edit Test' : 'Create New Test'}
            </h2>
          </div>

          <TestEditor
            test={selectedTest}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}
