/**
 * Admin Dashboard Routes
 * Handles dashboard statistics and admin overview data
 */
import { Router } from "express";
import {
  getDashboardStats,
  getDashboardDetails
} from "../../controllers/admin/dashboard.controller.js";

const dashboardRouter = Router();

/**
 * @route GET /api/admin/dashboard/stats
 * @desc Get basic dashboard statistics
 * @access Admin only (middleware applied in parent router)
 */
dashboardRouter.get('/stats', getDashboardStats);

/**
 * @route GET /api/admin/dashboard/details
 * @desc Get detailed dashboard data with recent activity
 * @access Admin only (middleware applied in parent router)
 */
dashboardRouter.get('/details', getDashboardDetails);

export default dashboardRouter;