/**
 * Admin Enrollment Requests Routes
 * Handles routing for enrollment request management endpoints
 */
import { Router } from "express";
import {
  getEnrollmentRequests,
  approveEnrollmentRequest,
  rejectEnrollmentRequest,
  bulkApproveEnrollmentRequests,
  bulkRejectEnrollmentRequests
} from "../../controllers/admin/students.controller.js";
import { validateSchema, validateParams } from "../../middlewares/validation.middleware.js";
import {
  enrollmentRequestIdSchema,
  approveEnrollmentSchema,
  bulkEnrollmentSchema
} from "../../schemas/student.schemas.js";

const enrollmentRequestsRouter = Router();

// GET /api/admin/enrollment-requests - Get enrollment requests
enrollmentRequestsRouter.get('/',
  getEnrollmentRequests
);

// PUT /api/admin/enrollment-requests/:id/approve - Approve enrollment request
enrollmentRequestsRouter.put('/:id/approve',
  validateParams(enrollmentRequestIdSchema),
  validateSchema(approveEnrollmentSchema),
  approveEnrollmentRequest
);

// PUT /api/admin/enrollment-requests/:id/reject - Reject enrollment request
enrollmentRequestsRouter.put('/:id/reject',
  validateParams(enrollmentRequestIdSchema),
  rejectEnrollmentRequest
);

// POST /api/admin/enrollment-requests/bulk-approve - Bulk approve requests
enrollmentRequestsRouter.post('/bulk-approve',
  validateSchema(bulkEnrollmentSchema),
  bulkApproveEnrollmentRequests
);

// POST /api/admin/enrollment-requests/bulk-reject - Bulk reject requests
enrollmentRequestsRouter.post('/bulk-reject',
  validateSchema(bulkEnrollmentSchema),
  bulkRejectEnrollmentRequests
);

export default enrollmentRequestsRouter;