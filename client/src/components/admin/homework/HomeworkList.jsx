import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus, Search, Edit, Trash2, FileText, Calendar } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function HomeworkList({ homework, loading, onCreateNew, onEdit, onDelete, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, homework: null })

  const filteredHomework = homework.filter(hw =>
    hw.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (hw) => {
    setDeleteDialog({ open: true, homework: hw })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.homework) {
      onDelete(deleteDialog.homework.id)
      setDeleteDialog({ open: false, homework: null })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Homework Management</CardTitle>
              <CardDescription>Create and manage SAT-style homework with passages and questions</CardDescription>
            </div>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Homework
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search homework by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Homework Table */}
          <div className="border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-6 w-6" />
                <span className="ml-2">Loading homework...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Passages</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHomework.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No homework found matching your search.' : 'No homework created yet. Click "Create New Homework" to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHomework.map((hw) => (
                      <TableRow key={hw.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{hw.title}</div>
                              {hw.instructions && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {hw.instructions.substring(0, 60)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{hw.passageCount || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hw.usageCount > 0 ? "default" : "outline"}>
                            {hw.usageCount || 0} courses
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hw.submissionCount > 0 ? "default" : "outline"}>
                            {hw.submissionCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(hw.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(hw)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(hw)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, homework: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Homework?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.homework?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
