# Forgot Password Implementation - Test Guide

## Overview
This guide explains how to test the complete forgot password functionality that has been implemented.

## What Was Implemented

### 1. Database Schema
- Added `PasswordResetToken` model to Prisma schema
- Includes secure token generation, expiration, and usage tracking
- Database migration created (run `npx prisma migrate dev` if needed)

### 2. Email Configuration
- Created `email.config.js` with Nodemailer setup
- Professional HTML email templates for password reset
- Password change confirmation emails

### 3. API Endpoints
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### 4. Security Features
- 32-byte random tokens for security
- 1-hour token expiration
- One-time use tokens
- Email enumeration protection
- Strong password validation

## Testing Instructions

### Prerequisites
1. Start the server: `npm start` or `node app.js`
2. Ensure database is connected
3. Configure email settings in `.env` file:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

### Test 1: Forgot Password Request
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "message": "If an account with that email exists, we've sent password reset instructions."
}
```

### Test 2: Forgot Password - Invalid Email Format
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (400):**
```json
{
  "message": "Email is required"
}
```

### Test 3: Reset Password with Valid Token
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ACTUAL_TOKEN_FROM_EMAIL",
    "newPassword": "newSecurePassword123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

### Test 4: Reset Password - Invalid Token
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid-token-123",
    "newPassword": "newSecurePassword123"
  }'
```

**Expected Response (400):**
```json
{
  "message": "Invalid or expired reset token"
}
```

### Test 5: Reset Password - Weak Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ACTUAL_TOKEN_FROM_EMAIL",
    "newPassword": "123"
  }'
```

**Expected Response (400):**
```json
{
  "message": "Password must be at least 8 characters long"
}
```

## Complete Flow Test

### Step-by-Step Process:

1. **Create a test student account** (if not exists):
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teststudent@example.com",
       "password": "oldPassword123",
       "firstName": "Test",
       "middleName": "Middle",
       "lastName": "Student",
       "phone": "01234567890",
       "parentFirstName": "Parent",
       "parentLastName": "Test",
       "parentEmail": "parent@example.com",
       "parentPhone": "01234567891"
     }'
   ```

2. **Request password reset**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teststudent@example.com"
     }'
   ```

3. **Check email inbox** for reset link (or check server logs for token)

4. **Extract token** from email URL (format: `http://localhost:3000/reset-password?token=TOKEN_HERE`)

5. **Reset password**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{
       "token": "EXTRACTED_TOKEN_HERE",
       "newPassword": "newSecurePassword123"
     }'
   ```

6. **Test login with new password**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teststudent@example.com",
       "password": "newSecurePassword123"
     }'
   ```

## Expected Email Content

When you request a password reset, you should receive an email with:
- Professional SAT Platform branding
- Personalized greeting using student's first name
- Clear reset button and backup URL
- Security warnings about token expiration (1 hour)
- Instructions for contacting support

## Troubleshooting

### Common Issues:

1. **Email not sending**: Check `.env` email configuration
2. **Database connection errors**: Ensure PostgreSQL is running
3. **Token not working**: Check if token has expired (1 hour limit)
4. **Route not found**: Ensure server is running and routes are properly configured

### Debug Tips:

1. Check server console logs for detailed error messages
2. Verify database has `PasswordResetToken` table (run migration if needed)
3. Test email configuration by checking transporter verification in logs
4. Use actual email for testing to see the formatted email template

## Security Notes

- Tokens expire after 1 hour for security
- Each token can only be used once
- No user existence information is leaked (same response for valid/invalid emails)
- Password strength is enforced (minimum 8 characters)
- All password changes send confirmation emails
- Expired tokens are automatically cleaned up

## Next Steps

After successful testing:
1. Remove test files (`FORGOT_PASSWORD_TEST_GUIDE.md`)
2. Set up proper email templates for production
3. Configure production email service
4. Add rate limiting for password reset requests (optional)
5. Consider adding CAPTCHA for additional security (optional)