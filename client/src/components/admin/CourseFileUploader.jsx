/**
 * CourseFileUploader Component
 * Upload form for course files with validation
 */
import { useState } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateFile, formatFileSize, getFileExtension } from '@/utils/fileHelpers';
import FileIcon from '@/components/common/FileIcon';

export default function CourseFileUploader({ onUpload, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file) => {
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setFormData(prev => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, '') // Auto-fill title from filename
    }));
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('title', formData.title.trim());
      if (formData.description.trim()) {
        uploadFormData.append('description', formData.description.trim());
      }

      await onUpload(uploadFormData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        file: null
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    setError('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Course File</CardTitle>
        <CardDescription>
          Upload PDF or Office documents (Word, Excel, PowerPoint). Max size: 10MB
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          {!formData.file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Drag and drop your file here, or
                </p>
                <label htmlFor="file-upload">
                  <Button type="button" variant="outline" asChild>
                    <span className="cursor-pointer">
                      Browse Files
                    </span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                PDF, Word, Excel, PowerPoint (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <FileIcon mimeType={formData.file.type} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{formData.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(formData.file.size)} • {getFileExtension(formData.file.name)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter file title"
              disabled={loading}
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter file description"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !formData.file}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
