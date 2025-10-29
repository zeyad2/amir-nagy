/**
 * File upload middleware using Multer
 */
import multer from "multer";
import path from "path";
import fs from "fs";
import { createErrorResponse } from '../utils/response.utils.js';

// Ensure uploads directories exist
const passagesDir = "./uploads/passages";
const thumbnailsDir = "./uploads/thumbnails";
const courseFilesDir = "./uploads/course-files";

if (!fs.existsSync(passagesDir)) {
  fs.mkdirSync(passagesDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

if (!fs.existsSync(courseFilesDir)) {
  fs.mkdirSync(courseFilesDir, { recursive: true });
}

// Configure storage for passages
const passageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, passagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'passage-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thumbnailsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'thumbnail-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for course files
const courseFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, courseFilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for passages'), false);
  }
};

// File filter for documents (PDF and Office files)
const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',                                                                      // PDF
    'application/msword',                                                                   // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',            // DOCX
    'application/vnd.ms-excel',                                                             // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',                  // XLSX
    'application/vnd.ms-powerpoint',                                                        // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'           // PPTX
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Office documents (Word, Excel, PowerPoint) are allowed'), false);
  }
};

// Configure multer for passages
const passageUpload = multer({
  storage: passageStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Configure multer for thumbnails
const thumbnailUpload = multer({
  storage: thumbnailStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Configure multer for course files
const courseFileUpload = multer({
  storage: courseFileStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
});

// Export configured middleware
export const uploadPassageImage = passageUpload.single('image');
export const uploadThumbnail = thumbnailUpload.single('thumbnail');
export const uploadCourseFile = courseFileUpload.single('file');

// Error handling middleware for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return createErrorResponse(res, 400, 'File size too large. Maximum size is 10MB for documents, 5MB for images.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return createErrorResponse(res, 400, 'Too many files. Only one file allowed.');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return createErrorResponse(res, 400, 'Unexpected field name. Use correct field for file upload.');
    }
  }

  if (err.message === 'Only image files are allowed for passages') {
    return createErrorResponse(res, 400, err.message);
  }

  if (err.message === 'Only PDF and Office documents (Word, Excel, PowerPoint) are allowed') {
    return createErrorResponse(res, 400, err.message);
  }

  next(err);
};