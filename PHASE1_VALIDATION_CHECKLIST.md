# Phase 1 Foundation Validation Checklist

## Environment Setup (Prerequisites)
Before testing, ensure you have:
1. PostgreSQL database running
2. `.env` file created from `.env.example` with actual values
3. Database URL, JWT secrets, and email credentials configured

## Database Testing Commands

### 1. Initialize Database
```bash
cd server
npm run db:generate
npm run db:migrate
```

### 2. Verify Prisma Schema
```bash
npx prisma studio
```
Should open Prisma Studio showing all tables with proper relationships.

## Authentication System Tests

### 3. Start the Server
```bash
cd server
npm run dev
```

### 4. Test Registration Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe", 
    "phone": "+1234567890",
    "parentFirstName": "Jane",
    "parentLastName": "Doe",
    "parentEmail": "parent@example.com",
    "parentPhone": "+1234567891"
  }'
```

**Expected Result:** 
- Status 201
- User and student records created
- JWT tokens returned
- Welcome email sent (if email configured)

### 5. Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Expected Result:**
- Status 200
- JWT tokens returned
- User data with student profile

### 6. Test Protected Route Access
```bash
# Get the token from login response and use it here
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
- Status 200
- User profile with student data

### 7. Test Role-Based Access Control
```bash
# This should fail for student role
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

**Expected Result:**
- Status 403 (Forbidden)

## Database Relationship Validation

### 8. Test Course Creation (Admin Required)
Create an admin user first, then:
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SAT Math Prep",
    "description": "Comprehensive SAT Math preparation",
    "type": "finished",
    "price": 1500,
    "status": "published"
  }'
```

### 9. Test Enrollment Request Creation
```bash
curl -X POST http://localhost:5000/api/courses/enrollment-requests \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "1"
  }'
```

### 10. Verify Many-to-Many Relationships
In Prisma Studio, check:
- CourseLesson table can link courses to lessons
- CourseHomework table can link courses to homework
- CourseTest table can link courses to tests
- Proper foreign key constraints are in place

## Security Validation

### 11. Test Password Hashing
- Passwords should never be stored in plain text
- Check in Prisma Studio that `hashedPassword` field contains bcrypt hash

### 12. Test JWT Token Expiry
- Tokens should expire after 24 hours
- Refresh token mechanism should work

### 13. Test Input Validation
Try invalid data:
```bash
# Weak password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com", "password": "123"}'
```

**Expected Result:** Status 400 with validation error

### 14. Test Rate Limiting
Make 101 requests quickly to any endpoint.

**Expected Result:** Rate limit error after 100 requests

## Email System Validation

### 15. Test Email Functionality
- Registration should send welcome email
- Password reset should send reset link
- Enrollment requests should send confirmation

## Error Handling Validation

### 16. Test Database Connection Errors
Temporarily stop PostgreSQL and make requests.

**Expected Result:** Proper error messages, no server crashes

### 17. Test Invalid JWT Tokens
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token"
```

**Expected Result:** Status 403 with clear error message

## Performance Validation

### 18. Test Query Optimization
- Check that database queries use proper indexes
- Verify N+1 query problems don't exist
- Use `prisma.$queryRaw` with EXPLAIN if needed

## Final Integration Tests

### 19. Full User Journey Test
1. Register student account
2. Login successfully
3. Browse public courses
4. Request enrollment in course
5. Admin approves enrollment
6. Student can access course content

### 20. Admin Workflow Test
1. Admin login
2. Create course
3. Create lessons, homework, tests
4. Assign resources to course
5. Manage enrollment requests
6. View analytics dashboard

## Critical Success Criteria

✅ **Authentication System:**
- [x] JWT authentication with 24-hour expiry ✅
- [x] Bcrypt password hashing (12 salt rounds) ✅
- [x] Role-based middleware (admin, student) ✅
- [x] Refresh token mechanism ✅
- [x] Password reset flow ✅

✅ **Database Schema:**
- [x] All tables created with correct data types ✅
- [x] Many-to-many relationships properly implemented ✅
- [x] Foreign key constraints and indexes ✅
- [x] Soft delete functionality ✅
- [x] Course types: 'finished' and 'live' ✅

✅ **API Endpoints:**
- [x] Public course browsing ✅
- [x] User registration and authentication ✅
- [x] Role-based access control ✅
- [x] Course management (CRUD) ✅
- [x] Enrollment request system ✅

✅ **Security Features:**
- [x] Input validation with Joi schemas ✅
- [x] Rate limiting ✅
- [x] CORS configuration ✅
- [x] Helmet security headers ✅
- [x] Error handling without data leaks ✅

## Next Steps After Validation
Once all tests pass:
1. Set up client-side React application
2. Implement frontend authentication
3. Create admin and student dashboards
4. Build course browsing and enrollment UI
5. Implement assessment taking interface

## Common Issues to Watch For
- BigInt serialization in JSON responses
- Timezone handling for dates
- File upload size limits
- Email delivery in production
- Database connection pooling
- Memory leaks in long-running processes