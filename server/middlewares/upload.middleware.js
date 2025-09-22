/**
 * File upload middleware using Multer
 */
import multer from "multer";
import path from "path";
import fs from "fs";
import { createErrorResponse } from '../utils/response.utils.js';

// Ensure uploads directory exists
const uploadsDir = "./uploads/passages";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'passage-' + uniqueSuffix + path.extname(file.originalname));
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

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Export configured middleware
export const uploadPassageImage = upload.single('image');

// Error handling middleware for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return createErrorResponse(res, 400, 'File size too large. Maximum size is 5MB.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return createErrorResponse(res, 400, 'Too many files. Only one file allowed.');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return createErrorResponse(res, 400, 'Unexpected field name. Use "image" field for file upload.');
    }
  }

  if (err.message === 'Only image files are allowed for passages') {
    return createErrorResponse(res, 400, err.message);
  }

  next(err);
};