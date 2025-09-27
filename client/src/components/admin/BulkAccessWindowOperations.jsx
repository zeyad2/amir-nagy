import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import {
  Users,
  Trash2,
  Edit3,
  Copy,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Settings,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Archive
} from 'lucide-react'
import { storageService } from '@/services/storage.service'

export default function BulkAccessWindowOperations({
  selectedWindows = [],
  allAccessWindows = [],
  enrollments = [],
  courseId,
  onSelectionChange,
  onOperationComplete,
  onClose
}) {
  const [currentOperation, setCurrentOperation] = useState(null)
  const [operationData, setOperationData] = useState({})
  const [processing, setProcessing] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null)

  // Get selected window details
  const selectedWindowsData = allAccessWindows.filter(window =>
    selectedWindows.includes(window.id)
  )

  // Calculate bulk statistics
  const bulkStats = {
    totalWindows: selectedWindows.length,
    totalStudents: new Set(selectedWindowsData.map(w => w.enrollmentId)).size,
    totalSessions: selectedWindowsData.reduce((sum, w) => sum + (w.sessionCount || 0), 0),
    totalValue: selectedWindowsData.reduce((sum, w) => sum + (w.calculatedPrice || 0), 0),
    dateRange: {
      earliest: selectedWindowsData.reduce((earliest, w) =>
        !earliest || (w.startSession?.date && new Date(w.startSession.date) < new Date(earliest))
          ? w.startSession?.date : earliest, null),
      latest: selectedWindowsData.reduce((latest, w) =>
        !latest || (w.endSession?.date && new Date(w.endSession.date) > new Date(latest))
          ? w.endSession?.date : latest, null)
    }
  }

  // Bulk operation definitions
  const bulkOperations = [
    {
      id: 'delete',
      name: 'Delete Selected',
      icon: Trash2,
      color: 'red',
      description: 'Permanently remove selected access windows',
      requiresConfirmation: true,
      destructive: true
    },
    {
      id: 'duplicate',
      name: 'Duplicate Windows',
      icon: Copy,
      color: 'blue',
      description: 'Create copies of selected access windows for other enrollments',
      requiresEnrollmentSelection: true
    },
    {
      id: 'extend',
      name: 'Extend Access',
      icon: Clock,
      color: 'green',
      description: 'Extend the end date for selected access windows',
      requiresSessionSelection: true
    },
    {
      id: 'update_pricing',
      name: 'Update Pricing',
      icon: DollarSign,
      color: 'purple',
      description: 'Apply pricing adjustments to selected windows',
      requiresPricingInput: true
    },
    {
      id: 'export',
      name: 'Export Data',
      icon: Download,
      color: 'gray',
      description: 'Export selected access windows to CSV',
      immediate: true
    },
    {
      id: 'archive',
      name: 'Archive Windows',
      icon: Archive,
      color: 'yellow',
      description: 'Archive selected access windows (soft delete)',
      requiresConfirmation: true
    }
  ]

  // Handle operation initiation
  const initiateOperation = (operationId) => {
    const operation = bulkOperations.find(op => op.id === operationId)
    if (!operation) return

    setCurrentOperation(operation)
    setOperationData({})

    if (operation.immediate) {
      executeOperation(operation)
    } else if (operation.requiresConfirmation) {
      setConfirmDialog({
        title: `Confirm ${operation.name}`,
        message: `Are you sure you want to ${operation.description.toLowerCase()} for ${selectedWindows.length} access window${selectedWindows.length > 1 ? 's' : ''}?`,
        operation: operation
      })
    }
  }

  // Execute the selected operation
  const executeOperation = async (operation) => {
    setProcessing(true)
    try {
      const token = storageService.getToken()

      switch (operation.id) {
        case 'delete':
          await bulkDeleteWindows(token)
          break
        case 'duplicate':
          await bulkDuplicateWindows(token)
          break
        case 'extend':
          await bulkExtendWindows(token)
          break
        case 'update_pricing':
          await bulkUpdatePricing(token)
          break
        case 'export':
          await exportWindowsData()
          break
        case 'archive':
          await bulkArchiveWindows(token)
          break
        default:
          throw new Error('Unknown operation')
      }

      toast.success(`${operation.name} completed successfully`)
      onOperationComplete()
    } catch (error) {
      toast.error(`Failed to ${operation.name.toLowerCase()}: ${error.message}`)
    } finally {
      setProcessing(false)
      setCurrentOperation(null)
      setConfirmDialog(null)
    }
  }

  // Bulk delete windows
  const bulkDeleteWindows = async (token) => {
    const promises = selectedWindows.map(windowId =>
      fetch(`http://localhost:5000/api/admin/access-windows/${windowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    )

    await Promise.all(promises)
  }

  // Bulk duplicate windows
  const bulkDuplicateWindows = async (token) => {
    if (!operationData.targetEnrollments?.length) {
      throw new Error('Please select target enrollments')
    }

    const promises = []
    for (const windowData of selectedWindowsData) {
      for (const enrollmentId of operationData.targetEnrollments) {
        promises.push(
          fetch(`http://localhost:5000/api/admin/enrollments/${enrollmentId}/access-windows`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              startSessionId: windowData.startSession.id,
              endSessionId: windowData.endSession.id
            })
          })
        )
      }
    }

    await Promise.all(promises)
  }

  // Bulk extend windows
  const bulkExtendWindows = async (token) => {
    if (!operationData.newEndSession) {
      throw new Error('Please select new end session')
    }

    const promises = selectedWindows.map(windowId =>
      fetch(`http://localhost:5000/api/admin/access-windows/${windowId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endSessionId: operationData.newEndSession
        })
      })
    )

    await Promise.all(promises)
  }

  // Bulk update pricing (this would require backend support for pricing updates)
  const bulkUpdatePricing = async (token) => {
    // This is a placeholder - actual implementation would depend on backend API
    toast.info('Pricing updates would be processed by backend recalculation')
  }

  // Bulk archive windows (soft delete)
  const bulkArchiveWindows = async (token) => {
    // This would require backend support for archiving
    toast.info('Archive functionality would be implemented with backend support')
  }

  // Export windows data to CSV
  const exportWindowsData = () => {
    const csvData = selectedWindowsData.map(window => ({
      'Window ID': window.id,
      'Student Name': window.enrollment?.student?.name || 'Unknown',
      'Student Email': window.enrollment?.student?.email || 'Unknown',
      'Start Session': window.startSession?.title || 'N/A',
      'End Session': window.endSession?.title || 'N/A',
      'Start Date': window.startSession?.date ? new Date(window.startSession.date).toLocaleDateString() : 'N/A',
      'End Date': window.endSession?.date ? new Date(window.endSession.date).toLocaleDateString() : 'N/A',
      'Session Count': window.sessionCount || 0,
      'Calculated Price': window.calculatedPrice || 0,
      'Created At': new Date(window.createdAt).toLocaleDateString()
    }))

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `access-windows-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Bulk Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Selection Summary</span>
            <Badge variant="secondary">{selectedWindows.length} selected</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{bulkStats.totalStudents}</p>
              <p className="text-sm text-gray-600">Students Affected</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{bulkStats.totalSessions}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{bulkStats.totalValue}</p>
              <p className="text-sm text-gray-600">Combined Value (EGP)</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {bulkStats.dateRange.earliest && bulkStats.dateRange.latest ?
                  Math.ceil((new Date(bulkStats.dateRange.latest) - new Date(bulkStats.dateRange.earliest)) / (1000 * 60 * 60 * 24 * 7)) :
                  0
                }
              </p>
              <p className="text-sm text-gray-600">Weeks Span</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <CardDescription>
            Perform actions on all selected access windows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bulkOperations.map((operation) => {
              const IconComponent = operation.icon
              const colorClasses = {
                red: 'border-red-200 hover:border-red-400 text-red-700 bg-red-50',
                blue: 'border-blue-200 hover:border-blue-400 text-blue-700 bg-blue-50',
                green: 'border-green-200 hover:border-green-400 text-green-700 bg-green-50',
                purple: 'border-purple-200 hover:border-purple-400 text-purple-700 bg-purple-50',
                gray: 'border-gray-200 hover:border-gray-400 text-gray-700 bg-gray-50',
                yellow: 'border-yellow-200 hover:border-yellow-400 text-yellow-700 bg-yellow-50'
              }

              return (
                <button
                  key={operation.id}
                  onClick={() => initiateOperation(operation.id)}
                  disabled={processing}
                  className={`p-4 border rounded-lg text-left transition-colors ${colorClasses[operation.color]} ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{operation.name}</span>
                    {operation.destructive && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm opacity-75">{operation.description}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Windows List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Selected Access Windows</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              Clear Selection
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedWindowsData.map((window) => (
              <div key={window.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  checked={true}
                  onCheckedChange={() => {
                    const newSelection = selectedWindows.filter(id => id !== window.id)
                    onSelectionChange(newSelection)
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {window.startSession?.title} → {window.endSession?.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {window.enrollment?.student?.name} • {window.sessionCount} sessions • {window.calculatedPrice || 0} EGP
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(window.startSession?.date || Date.now()).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operation Configuration Dialog */}
      {currentOperation && !currentOperation.immediate && (
        <Dialog open={!!currentOperation} onOpenChange={() => setCurrentOperation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <currentOperation.icon className="h-5 w-5" />
                <span>{currentOperation.name}</span>
              </DialogTitle>
              <DialogDescription>
                Configure the operation for {selectedWindows.length} selected access windows
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Enrollment Selection for Duplication */}
              {currentOperation.requiresEnrollmentSelection && (
                <div>
                  <Label>Target Enrollments</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {enrollments.filter(enrollment =>
                      !selectedWindowsData.some(w => w.enrollmentId === enrollment.id)
                    ).map(enrollment => (
                      <div key={enrollment.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={(operationData.targetEnrollments || []).includes(enrollment.id)}
                          onCheckedChange={(checked) => {
                            const current = operationData.targetEnrollments || []
                            setOperationData({
                              ...operationData,
                              targetEnrollments: checked
                                ? [...current, enrollment.id]
                                : current.filter(id => id !== enrollment.id)
                            })
                          }}
                        />
                        <span className="text-sm">{enrollment.student?.name} - {enrollment.student?.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Selection for Extension */}
              {currentOperation.requiresSessionSelection && (
                <div>
                  <Label>New End Session</Label>
                  <Select
                    value={operationData.newEndSession}
                    onValueChange={(value) => setOperationData({ ...operationData, newEndSession: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new end session" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* This would be populated with course sessions */}
                      <SelectItem value="session-1">Session 1</SelectItem>
                      <SelectItem value="session-2">Session 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Pricing Input */}
              {currentOperation.requiresPricingInput && (
                <div>
                  <Label>Pricing Adjustment</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Select
                      value={operationData.pricingType}
                      onValueChange={(value) => setOperationData({ ...operationData, pricingType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adjustment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="number"
                      placeholder="Amount"
                      className="px-3 py-2 border rounded"
                      value={operationData.pricingAmount || ''}
                      onChange={(e) => setOperationData({ ...operationData, pricingAmount: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCurrentOperation(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => executeOperation(currentOperation)}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Execute ${currentOperation.name}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>{confirmDialog.title}</span>
              </DialogTitle>
              <DialogDescription>
                {confirmDialog.message}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action affects {selectedWindows.length} access windows and cannot be undone.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => executeOperation(confirmDialog.operation)}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Close Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close Bulk Operations
        </Button>
      </div>
    </div>
  )
}