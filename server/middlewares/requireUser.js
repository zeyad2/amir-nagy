import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import Prisma from "../prisma/prisma.js";

export const requireUser = async (req, res, next) => {
  try {
    // Check if authorization header exists
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return res.status(401).json({ message: "Unauthorized, please sign in" });
    }

    // Extract token
    const token = req.headers.authorization.split(" ")[1];

    // Verify token
    const decodedToken = jwt.verify(token, envConfig.JWT_SECRET);

    // Find user in database
    const user = await Prisma.User.findUnique({
      where: { uuid: decodedToken.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized, user not found" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireUser middleware:", error);
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }
};



