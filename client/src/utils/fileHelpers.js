/**
 * File Helper Utilities
 * Functions for handling file metadata, icons, and formatting
 */

/**
 * Format file size from bytes to human-readable format
 * @param {number|string} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Get file icon name based on MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Lucide icon name
 */
export const getFileIconName = (mimeType) => {
  if (!mimeType) return 'File';

  if (mimeType.includes('pdf')) return 'FileText';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'FileType';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Sheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Presentation';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('video')) return 'Video';
  if (mimeType.includes('audio')) return 'Music';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'Archive';

  return 'File';
};

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension in uppercase (e.g., "PDF")
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  if (parts.length === 1) return '';
  return parts[parts.length - 1].toUpperCase();
};

/**
 * Get file type display name from MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Human-readable file type
 */
export const getFileTypeDisplay = (mimeType) => {
  if (!mimeType) return 'Unknown';

  if (mimeType.includes('pdf')) return 'PDF Document';
  if (mimeType.includes('msword')) return 'Word Document';
  if (mimeType.includes('wordprocessingml')) return 'Word Document';
  if (mimeType.includes('ms-excel')) return 'Excel Spreadsheet';
  if (mimeType.includes('spreadsheetml')) return 'Excel Spreadsheet';
  if (mimeType.includes('ms-powerpoint')) return 'PowerPoint Presentation';
  if (mimeType.includes('presentationml')) return 'PowerPoint Presentation';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('video')) return 'Video';
  if (mimeType.includes('audio')) return 'Audio';

  return 'Document';
};

/**
 * Validate file type for upload
 * @param {File} file - File object to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateFileType = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF and Office documents (Word, Excel, PowerPoint) are allowed'
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate file size
 * @param {File} file - File object to validate
 * @param {number} maxSizeMB - Maximum file size in megabytes (default: 10)
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB} MB`
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate file for upload (combines type and size validation)
 * @param {File} file - File object to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateFile = (file) => {
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) return typeValidation;

  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) return sizeValidation;

  return { valid: true, error: null };
};

/**
 * Get file color based on type (for UI theming)
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Tailwind color class
 */
export const getFileColor = (mimeType) => {
  if (!mimeType) return 'text-gray-500';

  if (mimeType.includes('pdf')) return 'text-red-500';
  if (mimeType.includes('word')) return 'text-blue-500';
  if (mimeType.includes('excel')) return 'text-green-500';
  if (mimeType.includes('powerpoint')) return 'text-orange-500';

  return 'text-gray-500';
};
