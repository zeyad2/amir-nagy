import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import Prisma from "../prisma/prisma.js";

export const requireAdmin = async (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "Unauthorized, lease sign in" });

  try {
    const user = await Prisma.user.findUnique({
      where: { uuid: req.user.uuid },
    });

    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden, admin access required" });
    }
    next();
  } catch (error) {
    console.error("Error in requireAdmin middleware:", error);
    return res.status(500).json({ message: error.message });
  }
};
