/**
 * Main Admin Router
 * Combines all admin routes with proper authentication
 */
import { Router } from "express";
import { requireUser } from "../middlewares/requireUser.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { handleUploadError } from "../middlewares/upload.middleware.js";
import lessonsRouter from "./admin/lessons.routes.js";
import homeworkRouter from "./admin/homework.routes.js";
import testsRouter from "./admin/tests.routes.js";
import Prisma from "../prisma/prisma.js";

const adminRouter = Router();

// Apply authentication middleware to all admin routes
adminRouter.use(requireUser);
adminRouter.use(requireAdmin);

// Apply upload error handling middleware
adminRouter.use(handleUploadError);

// Sub-routers for different resource types
adminRouter.use("/lessons", lessonsRouter);
adminRouter.use("/homework", homeworkRouter);
adminRouter.use("/tests", testsRouter);

// Admin dashboard endpoint
adminRouter.get('/dashboard', async (req, res) => {
  try {
    const [
      lessonsCount,
      homeworkCount,
      testsCount,
      recentActivity
    ] = await Promise.all([
      // Get lessons count
      Prisma.lesson.count(),

      // Get homework count
      Prisma.homework.count(),

      // Get tests count
      Prisma.test.count(),

      // Get recent activity (simplified for now)
      Promise.resolve([])
    ]);

    const dashboardData = {
      stats: {
        lessons: lessonsCount,
        homework: homeworkCount,
        tests: testsCount,
        totalResources: lessonsCount + homeworkCount + testsCount
      },
      recentActivity
    };

    res.status(200).json({
      message: 'Admin dashboard data fetched successfully',
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch admin dashboard data'
    });
  }
});

export default adminRouter;