/**
 * Admin Upload Controller
 * Handles file upload operations for passages and other resources
 */
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Upload passage image
 * POST /api/admin/upload/passage-image
 */
export const uploadPassageImage = async (req, res) => {
  try {
    if (!req.file) {
      return createErrorResponse(res, 400, 'No image file provided');
    }

    // Construct the public URL for the uploaded image
    const imageURL = `${req.protocol}://${req.get('host')}/uploads/passages/${req.file.filename}`;

    return createResponse(res, 200, 'Image uploaded successfully', {
      imageURL,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading passage image:', error);
    return createErrorResponse(res, 500, 'Failed to upload image');
  }
};
