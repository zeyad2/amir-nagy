// const prisma = new PrismaClient();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import envConfig from "../config/env.config.js";

import Prisma from "../prisma/prisma.js";
import { sendPasswordResetEmail, sendPasswordChangeConfirmation } from "../config/email.config.js";

import {
  validateSignupFields,
  createUser,
  createStudentProfile,
  generateToken,
  createSafeUserObject,
} from "./utils/auth.utils.js";
import e from "express";

export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    const missingFields = validateSignupFields(req.body);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    // Create user
    const newUser = await createUser(email, password);

    // Create student profile
    await createStudentProfile(newUser.uuid, req.body);

    // Generate JWT token
    const token = generateToken(newUser.uuid);

    // Create safe user object for response
    const safeUser = createSafeUserObject(newUser);

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Error during signup:", error);

    // Handle specific errors
    if (error.message === "User already exists") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await Prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user.uuid);

    // Create safe user object for response
    const safeUser = createSafeUserObject(user);

    return res.status(200).json({
      message: "Signin successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Error during signin:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  //check if this is needed, as middleware already checks this
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized, please sign in" });
  }

  if (req.user.role === "admin") {
    res.redirect("/admin/profile");
  }

  try {
    const user = await Prisma.Student.findUnique({
      where: { uuid: req.user.uuid },
      select: {
        firstName: true,
        lastName: true,
        parentFirstName: true,
        parentEmail: true,
        parentPhone: true,
        attendances: true,
        enrollments: true,
        homeworkSubmissions: true,
        testSubmissions: true,
        user: { select: { email: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: error.message });
  }
};



export const forgotPassword = async (req, res) => {
  
  const { email } = req.body;

  try {
    // Validate email input
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if user exists
      const normalizedEmail = String(email).trim().toLowerCase();

    const user = await Prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        student: {
          select: {
            firstName: true,
          },
        },
      },
    });

    // Always return the same message to prevent email enumeration
    const successMessage = "If an account with that email exists, we've sent password reset instructions.";

    if (!user) {
      // Return success message even if user doesn't exist for security
      return res.status(200).json({ message: successMessage });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Clean up any existing tokens for this user
    await Prisma.passwordResetToken.deleteMany({
      where: { userId: user.uuid },
    });

    // Create new reset token
    await Prisma.passwordResetToken.create({
      data: {
        userId: user.uuid,
        token: resetToken,
        expiresAt,
      },
    });

    // 🧪 DEVELOPMENT ONLY: Log token for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Password reset token for testing:', resetToken);
      console.log('📧 Reset URL:', `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    }

    // Send password reset email
    const firstName = user.student?.firstName || '';
    const emailResult = await sendPasswordResetEmail(email, resetToken, firstName);

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    return res.status(200).json({ message: successMessage });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Find the reset token
    const resetTokenRecord = await Prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            student: {
              select: {
                firstName: true,
              },
            },
          },
        },
      },
    });

    if (!resetTokenRecord) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Check if token has expired
    if (new Date() > resetTokenRecord.expiresAt) {
      // Clean up expired token
      await Prisma.passwordResetToken.delete({
        where: { id: resetTokenRecord.id },
      });

      return res.status(400).json({
        message: "Reset token has expired. Please request a new password reset.",
      });
    }

    // Check if token has already been used
    if (resetTokenRecord.usedAt) {
      return res.status(400).json({
        message: "Reset token has already been used. Please request a new password reset.",
      });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and mark token as used
    await Prisma.$transaction([
      Prisma.user.update({
        where: { uuid: resetTokenRecord.userId },
        data: { hashedPassword },
      }),
      Prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate any other outstanding reset tokens for this user
      Prisma.passwordResetToken.updateMany({
        where: {
          userId: resetTokenRecord.userId,
          id: { not: resetTokenRecord.id },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    // Send password change confirmation email
    const firstName = resetTokenRecord.user.student?.firstName || '';
    await sendPasswordChangeConfirmation(resetTokenRecord.user.email, firstName);

    return res.status(200).json({
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};

// 🧪 DEVELOPMENT ONLY: Get recent reset tokens for testing
export const getRecentTokens = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const tokens = await Prisma.passwordResetToken.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
      include: {
        user: {
          select: {
            email: true,
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const tokenInfo = tokens.map(t => ({
      token: t.token,
      email: t.user.email,
      studentName: t.user.student ? `${t.user.student.firstName} ${t.user.student.lastName}` : 'N/A',
      expiresAt: t.expiresAt,
      usedAt: t.usedAt,
      createdAt: t.createdAt,
      isExpired: new Date() > t.expiresAt,
      isUsed: !!t.usedAt,
    }));

    return res.json({
      message: 'Recent password reset tokens (DEVELOPMENT ONLY)',
      tokens: tokenInfo,
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
