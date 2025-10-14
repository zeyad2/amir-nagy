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
import assessmentsRouter from "./admin/assessments.routes.js";
import coursesRouter from "./admin/courses.routes.js";
import dashboardRouter from "./admin/dashboard.routes.js";
import studentsRouter from "./admin/students.routes.js";
import enrollmentRequestsRouter from "./admin/enrollment-requests.routes.js";
import enrollmentsRouter from "./admin/enrollments.routes.js";
import accessWindowsRouter from "./admin/accessWindows.routes.js";
import uploadRouter from "./admin/upload.routes.js";
import sessionsRouter from "./admin/sessions.routes.js";
import attendanceRouter from "./admin/attendance.routes.js";

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
adminRouter.use("/assessments", assessmentsRouter);
adminRouter.use("/courses", coursesRouter);
adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/students", studentsRouter);
adminRouter.use("/enrollment-requests", enrollmentRequestsRouter);
adminRouter.use("/enrollments", enrollmentsRouter);
adminRouter.use("/upload", uploadRouter);
adminRouter.use("/", sessionsRouter);
adminRouter.use("/", attendanceRouter);
adminRouter.use("/", accessWindowsRouter);

export default adminRouter;
