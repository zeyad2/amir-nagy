# SAT Platform API Testing Guide - Postman Collection

## Overview
This guide provides comprehensive instructions for testing all Phase 1 endpoints using Postman. Each endpoint includes example requests, expected responses, and test scenarios.

## Base URL
```
http://localhost:5000
```

## Environment Variables Setup
Create a Postman environment with the following variables:
- `baseUrl`: `http://localhost:5000`
- `accessToken`: (will be set automatically after login)
- `refreshToken`: (will be set automatically after login)
- `studentId`: (will be set automatically after registration)
- `adminToken`: (set manually for admin testing)

## Authentication Flow

### 1. Health Check
**GET** `{{baseUrl}}/api/health`

**Purpose**: Verify server is running
**Expected Response**:
```json
{
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. User Registration
**POST** `{{baseUrl}}/api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "email": "john.doe@example.com",
  "password": "TestPass123",
  "firstName": "John",
  "middleName": "William",
  "lastName": "Doe",
  "phone": "+1234567890",
  "parentFirstName": "Jane",
  "parentLastName": "Doe",
  "parentEmail": "jane.doe@example.com",
  "parentPhone": "+1234567891"
}
```

**Expected Response (201)**:
```json
{
  "message": "Registration successful",
  "user": {
    "uuid": "1",
    "email": "john.doe@example.com",
    "role": "student",
    "student": {
      "uuid": "1",
      "firstName": "John",
      "middleName": "William",
      "lastName": "Doe",
      "phone": "+1234567890",
      "parentFirstName": "Jane",
      "parentLastName": "Doe",
      "parentEmail": "jane.doe@example.com",
      "parentPhone": "+1234567891"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Post-Response Script** (to save tokens):
```javascript
if (pm.response.code === 201) {
    const responseJson = pm.response.json();
    pm.environment.set("accessToken", responseJson.token);
    pm.environment.set("refreshToken", responseJson.refreshToken);
    pm.environment.set("studentId", responseJson.user.uuid);
}
```

**Test Cases**:
1. Valid registration data
2. Duplicate email (should return 400)
3. Invalid email format (should return 400)
4. Weak password (should return 400)
5. Missing required fields (should return 400)
6. Invalid phone format (should return 400)

### 3. User Login
**POST** `{{baseUrl}}/api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "email": "john.doe@example.com",
  "password": "TestPass123"
}
```

**Expected Response (200)**:
```json
{
  "message": "Login successful",
  "user": {
    "uuid": "1",
    "email": "john.doe@example.com",
    "role": "student",
    "student": {
      "firstName": "John",
      "middleName": "William",
      "lastName": "Doe"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Post-Response Script**:
```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("accessToken", responseJson.token);
    pm.environment.set("refreshToken", responseJson.refreshToken);
}
```

**Test Cases**:
1. Valid credentials
2. Invalid email (should return 401)
3. Invalid password (should return 401)
4. Missing credentials (should return 400)
5. Malformed email (should return 400)

### 4. Get User Profile
**GET** `{{baseUrl}}/api/auth/profile`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Expected Response (200)**:
```json
{
  "user": {
    "uuid": "1",
    "email": "john.doe@example.com",
    "role": "student",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "student": {
      "uuid": "1",
      "firstName": "John",
      "middleName": "William",
      "lastName": "Doe",
      "phone": "+1234567890",
      "parentFirstName": "Jane",
      "parentLastName": "Doe",
      "parentEmail": "jane.doe@example.com",
      "parentPhone": "+1234567891"
    }
  }
}
```

**Test Cases**:
1. Valid token (should return 200)
2. No token (should return 401)
3. Invalid token (should return 403)
4. Expired token (should return 401)

### 5. Refresh Token
**POST** `{{baseUrl}}/api/auth/refresh`

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Post-Response Script**:
```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("accessToken", responseJson.token);
    pm.environment.set("refreshToken", responseJson.refreshToken);
}
```

**Test Cases**:
1. Valid refresh token
2. Invalid refresh token (should return 403)
3. Missing refresh token (should return 401)
4. Expired refresh token (should return 403)

### 6. Forgot Password
**POST** `{{baseUrl}}/api/auth/forgot-password`

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response (200)**:
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

**Test Cases**:
1. Existing email
2. Non-existing email (should return same message for security)

### 7. Reset Password
**POST** `{{baseUrl}}/api/auth/reset-password`

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "newPassword": "NewPassword123"
}
```

**Expected Response (200)**:
```json
{
  "message": "Password reset successful"
}
```

**Test Cases**:
1. Valid reset token
2. Invalid reset token (should return 400/500)
3. Expired reset token (should return 400)
4. Missing parameters (should return 400)

## Error Response Format
All errors follow this format:
```json
{
  "error": "Error message",
  "details": ["Additional error details (for validation errors)"]
}
```

## Common HTTP Status Codes
- **200**: Success
- **201**: Created (for registration)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## Testing Workflow

### 1. Sequential Testing
1. Health Check
2. Register new user
3. Login with registered user
4. Get profile
5. Test token refresh
6. Test forgot password (optional)

### 2. Validation Testing
For each endpoint, test:
1. Valid data (happy path)
2. Missing required fields
3. Invalid data formats
4. Boundary conditions
5. Authentication/authorization

### 3. Security Testing
1. Test without authentication tokens
2. Test with invalid/expired tokens
3. Test with malformed requests
4. Test rate limiting (if implemented)

## Sample Postman Pre-Request Scripts

### Auto-generate test data:
```javascript
// Generate random email for testing
pm.environment.set("randomEmail", `test${Math.floor(Math.random() * 10000)}@example.com`);

// Generate random phone
pm.environment.set("randomPhone", `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`);
```

## Sample Postman Test Scripts

### Basic response validation:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('message');
});

pm.test("Response time is less than 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

### Authentication test:
```javascript
pm.test("Token is present in response", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('token');
    pm.expect(responseJson.token).to.be.a('string');
    pm.expect(responseJson.token.length).to.be.above(0);
});
```

### Validation error test:
```javascript
pm.test("Validation error for invalid email", function () {
    pm.response.to.have.status(400);
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('error');
    pm.expect(responseJson.error).to.include('Validation failed');
});
```

## Database Setup for Testing

Before running tests, ensure:
1. PostgreSQL is running
2. Database exists and is migrated
3. Environment variables are set correctly
4. Server is running on port 5000

## Automated Testing with Newman

Run the collection via command line:
```bash
# Install Newman globally
npm install -g newman

# Run the collection
newman run SAT_Platform_API.postman_collection.json -e SAT_Platform.postman_environment.json
```

## Notes
- Always test authentication endpoints first
- Use environment variables for tokens and IDs
- Test both positive and negative scenarios
- Verify response structure and data types
- Check response times for performance
- Test with different user roles when implementing role-based features