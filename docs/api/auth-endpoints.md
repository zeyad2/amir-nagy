# Authentication API Endpoints

**Base URL:** `/api/auth`
**Status:** ✅ Complete
**Last Updated:** October 8, 2025

---

## Overview

The authentication system provides user registration, login, password reset, and profile management. It uses JWT tokens for authentication with bcrypt for password hashing.

**Features:**
- Student registration with parent information
- Secure login with JWT tokens
- Password reset via email (requires email integration)
- Role-based access control (admin/student)
- Token refresh mechanism

---

## Endpoints

### 1. Register (Sign Up)

Creates a new student account with associated user credentials.

**Endpoint:** `POST /api/auth/signup`
**Authentication:** None required
**Role:** Public

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "phone": "+201234567890",
  "parentFirstName": "Jane",
  "parentLastName": "Doe",
  "parentEmail": "parent@example.com",
  "parentPhone": "+201234567891"
}
```

**Validation Rules:**
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `firstName`: Required, string
- `middleName`: Required, string
- `lastName`: Required, string
- `phone`: Required, string (max 30 characters)
- `parentFirstName`: Required, string
- `parentLastName`: Required, string
- `parentEmail`: Required, valid email format
- `parentPhone`: Required, string (max 30 characters)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "uuid": "12345",
      "email": "student@example.com",
      "role": "student",
      "student": {
        "firstName": "John",
        "middleName": "Michael",
        "lastName": "Doe",
        "phone": "+201234567890",
        "parentFirstName": "Jane",
        "parentLastName": "Doe",
        "parentEmail": "parent@example.com",
        "parentPhone": "+201234567891"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Error Responses:**

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email already registered"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Registration failed. Please try again."
}
```

---

### 2. Login (Sign In)

Authenticates user credentials and returns JWT token.

**Endpoint:** `POST /api/auth/signin`
**Authentication:** None required
**Role:** Public

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uuid": "12345",
      "email": "student@example.com",
      "role": "student",
      "student": {
        "firstName": "John",
        "middleName": "Michael",
        "lastName": "Doe",
        "phone": "+201234567890"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Error Responses:**

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**400 Bad Request** - Validation error:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

### 3. Get Profile

Retrieves authenticated user's profile information.

**Endpoint:** `GET /api/auth/profile`
**Authentication:** Required (Bearer token)
**Role:** Any authenticated user

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**

**For Student:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "uuid": "12345",
    "email": "student@example.com",
    "role": "student",
    "student": {
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Doe",
      "phone": "+201234567890",
      "parentFirstName": "Jane",
      "parentLastName": "Doe",
      "parentEmail": "parent@example.com",
      "parentPhone": "+201234567891"
    }
  }
}
```

**For Admin:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "uuid": "1",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token or invalid token:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 4. Forgot Password

Initiates password reset process by creating a reset token.

**Endpoint:** `POST /api/auth/forgot-password`
**Authentication:** None required
**Role:** Public

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent. Please check your inbox.",
  "data": {
    "resetToken": "a1b2c3d4e5f6..." // Only in development mode
  }
}
```

**Note:** In production, the reset token is only sent via email, not in the response.

**Error Responses:**

**404 Not Found** - Email not registered:
```json
{
  "success": false,
  "message": "No account found with this email address"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to process password reset request"
}
```

---

### 5. Reset Password

Resets user password using the reset token from email.

**Endpoint:** `POST /api/auth/reset-password`
**Authentication:** None required (uses reset token)
**Role:** Public

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewSecurePass123"
}
```

**Validation Rules:**
- `token`: Required, valid reset token
- `newPassword`: Required, minimum 8 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password.",
  "data": {
    "email": "student@example.com"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid or expired token:
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**400 Bad Request** - Token already used:
```json
{
  "success": false,
  "message": "This reset link has already been used"
}
```

---

### 6. Get Recent Tokens (Development Only)

**⚠️ DEVELOPMENT ONLY - Should be removed in production**

Retrieves recent password reset tokens for testing purposes.

**Endpoint:** `GET /api/auth/dev/recent-tokens`
**Authentication:** None
**Role:** Development only

**Success Response (200 OK):**
```json
{
  "success": true,
  "tokens": [
    {
      "id": "1",
      "userId": "12345",
      "userEmail": "student@example.com",
      "token": "a1b2c3d4...",
      "expiresAt": "2025-10-09T12:00:00.000Z",
      "used": false,
      "createdAt": "2025-10-08T12:00:00.000Z"
    }
  ]
}
```

**Note:** This endpoint MUST be removed before production deployment.

---

## Authentication Flow

### Registration Flow
1. User submits registration form with all required fields
2. Server validates input data
3. Server checks if email already exists
4. Server hashes password with bcrypt
5. Server creates User and Student records in transaction
6. Server generates JWT token
7. Server returns user data and token

### Login Flow
1. User submits email and password
2. Server finds user by email
3. Server compares password hash
4. Server generates JWT token with 24-hour expiration
5. Server returns user data and token

### Password Reset Flow
1. User submits email for password reset
2. Server creates reset token with 1-hour expiration
3. Server sends email with reset link (requires email integration)
4. User clicks link and submits new password
5. Server validates token (not expired, not used)
6. Server updates password hash
7. Server marks token as used
8. User can log in with new password

---

## Middleware

### requireUser

Applied to protected routes to ensure user is authenticated.

**Usage:**
```javascript
router.get('/protected', requireUser, controller);
```

**Behavior:**
- Extracts token from Authorization header
- Verifies JWT signature and expiration
- Attaches user object to `req.user`
- Returns 401 if token invalid or missing

### requireAdmin

Applied to admin-only routes.

**Usage:**
```javascript
router.post('/admin/resource', requireUser, requireAdmin, controller);
```

**Behavior:**
- Checks if `req.user.role === 'admin'`
- Returns 403 Forbidden if user is not admin

### requireStudent

Applied to student-only routes.

**Usage:**
```javascript
router.get('/student/dashboard', requireUser, requireStudent, controller);
```

**Behavior:**
- Checks if `req.user.role === 'student'`
- Returns 403 Forbidden if user is not student

### optionalAuth

Applied to routes where authentication is optional (e.g., public course pages that show different content for enrolled students).

**Usage:**
```javascript
router.get('/courses/:id', optionalAuth, controller);
```

**Behavior:**
- Attempts to extract and verify token
- If valid, attaches user to `req.user`
- If invalid or missing, continues without user
- Never returns 401

---

## Security Features

### Password Hashing
- Uses bcrypt with salt rounds
- Passwords never stored in plaintext
- One-way hashing (cannot be decrypted)

### JWT Tokens
- Signed with secret key
- 24-hour expiration
- Contains user UUID and role
- Verified on every protected request

### Password Reset Tokens
- Cryptographically random tokens
- 1-hour expiration
- One-time use only
- Stored in database with expiration

### Input Validation
- All inputs validated with Joi schemas
- SQL injection prevention via Prisma parameterized queries
- XSS prevention via input sanitization

---

## Testing

### Manual Testing

**Test Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "middleName": "User",
    "lastName": "Account",
    "phone": "+201234567890",
    "parentFirstName": "Parent",
    "parentLastName": "Test",
    "parentEmail": "parent@example.com",
    "parentPhone": "+201234567891"
  }'
```

**Test Login:**
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Test Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Related Files

**Backend:**
- Routes: `server/routes/auth.routes.js`
- Controller: `server/controllers/auth.controller.js`
- Middleware: `server/middlewares/requireUser.js`, `requireAdmin.js`, `requireStudent.js`, `optionalAuth.js`
- Schemas: `server/schemas/auth.schemas.js`

**Frontend:**
- Login Page: `client/src/pages/auth/LoginPage.jsx`
- Register Page: `client/src/pages/auth/RegisterPage.jsx`
- Forgot Password: `client/src/pages/auth/ForgotPasswordPage.jsx`
- Reset Password: `client/src/pages/auth/ResetPasswordPage.jsx`
- Auth Context: `client/src/utils/AuthContext.jsx`
- Auth Service: `client/src/services/auth.service.js`

---

## Next Steps

### Required for Production
- ✅ Authentication system complete
- 📋 Implement email service for password resets
- 📋 Remove `/dev/recent-tokens` endpoint
- 📋 Add rate limiting to prevent brute force attacks
- 📋 Add account lockout after failed login attempts
- 📋 Add email verification on registration

### Optional Enhancements
- 📋 Add refresh token mechanism
- 📋 Add "Remember Me" functionality
- 📋 Add OAuth providers (Google, Facebook)
- 📋 Add two-factor authentication
- 📋 Add session management (logout all devices)
