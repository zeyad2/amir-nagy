import { Router } from "express";
import { signin, signup, getProfile, forgotPassword, resetPassword, getRecentTokens } from "../controllers/auth.controller.js";
import { requireUser } from "../middlewares/requireUser.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const authRouter = Router();


authRouter.post("/signin", signin);
authRouter.post("/signup", signup);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/profile", requireUser, getProfile);

// 🧪 DEVELOPMENT ONLY: Get recent tokens for testing
authRouter.get("/dev/recent-tokens", getRecentTokens); 


export default authRouter;
