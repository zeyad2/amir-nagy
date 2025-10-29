/**
 * CourseFileManager Component
 * Manages all course files with search, edit, delete functionality
 */
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminService } from '@/services/admin.service';
import { formatFileSize, getFileTypeDisplay } from '@/utils/fileHelpers';
import FileIcon from '@/components/common/FileIcon';
import CourseFileUploader from './CourseFileUploader';

export default function CourseFileManager({ onSelectFile }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllCourseFiles();
      setFiles(response.data.data.files || []);
      setError('');
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData) => {
    const response = await adminService.createCourseFile(formData);
    await fetchFiles();
    setShowUploader(false);
    return response;
  };

  const handleDelete = async (fileId, usageCount) => {
    const message = usageCount > 0
      ? `This file is used in ${usageCount} course(s). Deleting it will remove it from all courses. Are you sure?`
      : 'Are you sure you want to delete this file?';

    if (!confirm(message)) return;

    try {
      await adminService.deleteCourseFile(fileId);
      await fetchFiles();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete file');
    }
  };

  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Files</h2>
          <p className="text-sm text-muted-foreground">
            Manage files for your courses
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search files by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Files List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchQuery ? 'No files found matching your search' : 'No files uploaded yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowUploader(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First File
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <FileIcon mimeType={file.mimeType} size={32} />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.fileUrl, '_blank')}
                      title="View file"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id, file.usageCount)}
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base mt-2">{file.title}</CardTitle>
                <CardDescription className="text-xs">
                  {getFileTypeDisplay(file.mimeType)} • {formatFileSize(file.fileSize)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {file.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {file.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Used in {file.usageCount} course{file.usageCount !== 1 ? 's' : ''}</span>
                  {onSelectFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectFile(file)}
                    >
                      Select
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Course File</DialogTitle>
          </DialogHeader>
          <CourseFileUploader
            onUpload={handleUpload}
            onCancel={() => setShowUploader(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
