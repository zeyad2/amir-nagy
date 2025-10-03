/**
 * Admin Upload Routes
 * Handles file upload endpoints for images and resources
 */
import { Router } from "express";
import { uploadPassageImage as uploadPassageImageController } from "../../controllers/admin/upload.controller.js";
import { uploadPassageImage, handleUploadError } from "../../middlewares/upload.middleware.js";

const uploadRouter = Router();

// POST /api/admin/upload/passage-image - Upload image for passage
uploadRouter.post('/passage-image',
  uploadPassageImage,
  handleUploadError,
  uploadPassageImageController
);

export default uploadRouter;
