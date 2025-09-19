
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfig from "../../config/env.config.js";

import Prisma from "../../prisma/prisma.js";
// Helper function to validate required signup fields
export const validateSignupFields = (body) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    parentFirstName,
    parentLastName,
    parentEmail,
    parentPhone
  } = body;

  const missingFields = [];
  if (!email) missingFields.push('email');
  if (!password) missingFields.push('password');
  if (!firstName) missingFields.push('firstName');
  if (!lastName) missingFields.push('lastName');
  if (!phone) missingFields.push('phone');
  if (!parentFirstName) missingFields.push('parentFirstName');
  if (!parentLastName) missingFields.push('parentLastName');
  if (!parentEmail) missingFields.push('parentEmail');
  if (!parentPhone) missingFields.push('parentPhone');

  return missingFields;
};

// Helper function to create a new user with hashed password
export const createUser = async (email, password) => {
  // Check if user already exists
  const existingUser = await Prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with role STUDENT
  const newUser = await Prisma.user.create({
    data: {
      email,
      hashedPassword: hashedPassword,
      role: "student",
    },
  });

  return newUser;
};

// Helper function to create student profile
export const createStudentProfile = async (userUuid, studentData) => {
  const {
    firstName,
    middleName,
    lastName,
    phone,
    parentFirstName,
    parentLastName,
    parentEmail,
    parentPhone
  } = studentData;

  const newStudent = await Prisma.student.create({
    data: {
      uuid: userUuid,
      firstName,
      middleName,
      lastName,
      phone,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
    },
  });

  return newStudent;
};

// Helper function to generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    envConfig.JWT_SECRET,
    { expiresIn: envConfig.JWT_EXPIRE }
  );
};

// Helper function to create safe user object for response
export const createSafeUserObject = (user) => {
  return {
    uuid: user.uuid.toString(),
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
};
