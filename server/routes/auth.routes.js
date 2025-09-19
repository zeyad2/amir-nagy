import { Router } from "express";
import { signin, signup, getProfile } from "../controllers/auth.controller.js";
import { requireUser } from "../middlewares/requireUser.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const authRouter = Router();


authRouter.post("/signin", signin);
authRouter.post("/signup", signup);
authRouter.get("/profile", requireUser, getProfile); 


export default authRouter;
