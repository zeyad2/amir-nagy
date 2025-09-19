// const prisma = new PrismaClient();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";

import Prisma from "../prisma/prisma.js";

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
