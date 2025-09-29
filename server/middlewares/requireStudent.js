import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import Prisma from "../prisma/prisma.js";

export const requireStudent = async (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "Unauthorized, please sign in" });

  try {
    const user = await Prisma.user.findUnique({
      where: { uuid: req.user.uuid },
    });

    if (!user || user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Forbidden, student access required" });
    }
    next();
  } catch (error) {
    console.error("Error in requireStudent middleware:", error);
    return res.status(500).json({ message: error.message });
  }
};