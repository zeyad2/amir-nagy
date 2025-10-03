/**
 * Optional Authentication Middleware
 * Attempts to authenticate user from JWT token but doesn't fail if token is missing
 * Sets req.user if authentication succeeds, otherwise continues without user
 */
import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

const { JWT_SECRET } = env;

export const optionalAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without authentication
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Set user information in request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    // Token verification failed - continue without authentication
    // This is optional auth, so we don't send error response
    next();
  }
};
