# SAT Platform Testing Guide

## 📋 **Overview**

This guide provides comprehensive testing instructions for all implemented SAT Platform endpoints (Phases 1-3) using Postman and validation checklists. Every feature MUST be tested with PlaywrightMCP before deployment.

## 🎯 **Implementation Status**
- ✅ **Phase 1**: Authentication & Authorization System (COMPLETE)
- ✅ **Phase 2**: Password Reset System (COMPLETE)
- ✅ **Phase 3**: Admin Resource Management APIs (COMPLETE)
  - Lessons Management (6 endpoints)
  - Homework System (5 endpoints)
  - Test Management (6 endpoints)
  - Admin Dashboard (1 endpoint)

---

## 🔧 **Environment Setup**

### Base URL
```
http://localhost:5000
```

### Postman Environment Variables
Create a Postman environment with these variables:
- `baseUrl`: `http://localhost:5000`
- `accessToken`: (set automatically after login)
- `refreshToken`: (set automatically after login)
- `studentId`: (set automatically after registration)
- `adminToken`: (set manually for admin testing - get from admin login)
- `lessonId`: (set automatically after lesson creation)
- `homeworkId`: (set automatically after homework creation)
- `testId`: (set automatically after test creation)

### Prerequisites
Before testing, ensure:
1. ✅ PostgreSQL database is running
2. ✅ `.env` file configured with actual values
3. ✅ Database migrated: `npm run db:migrate`
4. ✅ Server running: `npm run dev` (port 5000)

---

## 🔐 **PHASE 1-2: AUTHENTICATION TESTING**

### 1. Health Check
**GET** `{{baseUrl}}/api/health`

**Expected Response (200)**:
```json
{
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Tests**:
- Status code is 200
- Response has status field
- Response time < 1000ms



### 2. User Registration
**POST** `{{baseUrl}}/api/auth/signup`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "{{randomEmail}}",
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

**Pre-Request Script**:
```javascript
pm.environment.set('randomEmail', `test${Math.floor(Math.random() * 10000)}@example.com`);
```

**Post-Response Script**:
```javascript
if (pm.response.code === 201) {
    const responseJson = pm.response.json();
    pm.environment.set("accessToken", responseJson.token);
    pm.environment.set("refreshToken", responseJson.refreshToken);
    pm.environment.set("studentId", responseJson.user.uuid);
}
```

**Test Cases**:
1. ✅ Valid registration data
2. ❌ Duplicate email (should return 400)
3. ❌ Invalid email format (should return 400)
4. ❌ Weak password (should return 400)
5. ❌ Missing required fields (should return 400)

### 3. User Login
**POST** `{{baseUrl}}/api/auth/signin`

**Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "TestPass123"
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

### 4. Get User Profile
**GET** `{{baseUrl}}/api/auth/profile`

**Headers**:
```
Authorization: Bearer {{accessToken}}
```

**Test Cases**:
1. ✅ Valid token (should return 200)
2. ❌ No token (should return 401)
3. ❌ Invalid token (should return 403)
4. ❌ Expired token (should return 401)

### 5. Forgot Password
**POST** `{{baseUrl}}/api/auth/forgot-password`

**Body**:
```json
{
  "email": "john.doe@example.com"
}
```

### 6. Reset Password
**POST** `{{baseUrl}}/api/auth/reset-password`

**Body**:
```json
{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "newPassword": "NewPassword123"
}
```

### 7. Recent Tokens (Development)
**GET** `{{baseUrl}}/api/auth/dev/recent-tokens`

---

## 🔐 **PHASE 3: ADMIN RESOURCE MANAGEMENT**

### Admin Authentication Setup
For admin endpoints, you need an admin token. Use admin credentials and set `adminToken` environment variable.

**Headers for all admin endpoints**:
```
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

---

## 📊 **Admin Dashboard**

### 8. Get Admin Dashboard
**GET** `{{baseUrl}}/api/admin/dashboard`

**Expected Response (200)**:
```json
{
  "message": "Admin dashboard data fetched successfully",
  "data": {
    "stats": {
      "lessons": 5,
      "homework": 3,
      "tests": 2,
      "totalResources": 10
    },
    "recentActivity": []
  }
}
```

---

## 📚 **LESSONS MANAGEMENT**

### 9. Get All Lessons
**GET** `{{baseUrl}}/api/admin/lessons`

**Query Parameters** (optional):
- `search`: Filter by title
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: 'title')
- `sortOrder`: 'asc' or 'desc' (default: 'asc')

**Example**: `{{baseUrl}}/api/admin/lessons?search=SAT&page=1&limit=10`

### 10. Create Lesson
**POST** `{{baseUrl}}/api/admin/lessons`

**Body**:
```json
{
  "title": "SAT Math Fundamentals",
  "videoLink": "https://drive.google.com/file/d/abcdef123456/view"
}
```

**Post-Response Script**:
```javascript
if (pm.response.code === 201) {
    const responseJson = pm.response.json();
    pm.environment.set("lessonId", responseJson.data.lesson.id);
}
```

**Test Cases**:
1. ✅ Valid lesson data
2. ❌ Invalid Google Drive URL (should return 400)
3. ❌ Missing title (should return 400)
4. ❌ Duplicate title (should return 400)

### 11. Get Single Lesson
**GET** `{{baseUrl}}/api/admin/lessons/{{lessonId}}`

### 12. Update Lesson
**PUT** `{{baseUrl}}/api/admin/lessons/{{lessonId}}`

**Body**:
```json
{
  "title": "SAT Math Fundamentals - Updated",
  "videoLink": "https://drive.google.com/file/d/updated123456/view"
}
```

### 13. Delete Lesson
**DELETE** `{{baseUrl}}/api/admin/lessons/{{lessonId}}`

**Error Response (400)** - If lesson is used in courses:
```json
{
  "error": "Cannot delete lesson. It is currently used in the following course(s): SAT Prep Course"
}
```

### 14. Get Lesson Usage
**GET** `{{baseUrl}}/api/admin/lessons/{{lessonId}}/courses`

---

## 📝 **HOMEWORK MANAGEMENT**

### 15. Get All Homework
**GET** `{{baseUrl}}/api/admin/homework`

### 16. Create Homework
**POST** `{{baseUrl}}/api/admin/homework`

**Body** (Complex nested structure):
```json
{
  "title": "SAT Reading Practice Set 1",
  "instructions": "Read each passage carefully and answer all questions.",
  "passages": [
    {
      "title": "Literary Analysis Passage",
      "content": "In the opening chapter of 'Pride and Prejudice'...",
      "imageURL": null,
      "order": 1,
      "questions": [
        {
          "questionText": "The author's tone in this passage can best be described as:",
          "order": 1,
          "choices": [
            {
              "choiceText": "Satirical and witty",
              "isCorrect": true,
              "order": 1
            },
            {
              "choiceText": "Somber and melancholic",
              "isCorrect": false,
              "order": 2
            },
            {
              "choiceText": "Angry and confrontational",
              "isCorrect": false,
              "order": 3
            },
            {
              "choiceText": "Neutral and objective",
              "isCorrect": false,
              "order": 4
            }
          ]
        }
      ]
    }
  ]
}
```

**Post-Response Script**:
```javascript
if (pm.response.code === 201) {
    const responseJson = pm.response.json();
    pm.environment.set("homeworkId", responseJson.data.homework.id);
}
```

**Test Cases**:
1. ✅ Valid homework with passages, questions, and choices
2. ❌ Missing passages (should return 400)
3. ❌ Questions without exactly 4 choices (should return 400)
4. ❌ No correct answer marked (should return 400)
5. ❌ Multiple correct answers (should return 400)

### 17. Get Single Homework
**GET** `{{baseUrl}}/api/admin/homework/{{homeworkId}}`

### 18. Update Homework
**PUT** `{{baseUrl}}/api/admin/homework/{{homeworkId}}`

### 19. Delete Homework
**DELETE** `{{baseUrl}}/api/admin/homework/{{homeworkId}}`

**Error Response (400)** - If has submissions:
```json
{
  "error": "Cannot delete homework. It has 5 student submission(s)"
}
```

---

## 🧪 **TEST MANAGEMENT**

### 20. Get All Tests
**GET** `{{baseUrl}}/api/admin/tests`

### 21. Create Test
**POST** `{{baseUrl}}/api/admin/tests`

**Body**:
```json
{
  "title": "SAT Practice Test 2",
  "instructions": "Complete all questions within the time limit",
  "duration": 45,
  "passages": [
    {
      "title": "Science Passage",
      "content": "Recent studies in marine biology...",
      "questions": [
        {
          "questionText": "According to the passage, what is the primary threat to coral reefs?",
          "choices": [
            {
              "choiceText": "Ocean acidification",
              "isCorrect": true
            },
            {
              "choiceText": "Overfishing",
              "isCorrect": false
            },
            {
              "choiceText": "Pollution",
              "isCorrect": false
            },
            {
              "choiceText": "Tourism",
              "isCorrect": false
            }
          ]
        }
      ]
    }
  ]
}
```

**Post-Response Script**:
```javascript
if (pm.response.code === 201) {
    const responseJson = pm.response.json();
    pm.environment.set("testId", responseJson.data.test.id);
}
```

### 22. Get Single Test
**GET** `{{baseUrl}}/api/admin/tests/{{testId}}`

### 23. Update Test
**PUT** `{{baseUrl}}/api/admin/tests/{{testId}}`

### 24. Delete Test
**DELETE** `{{baseUrl}}/api/admin/tests/{{testId}}`

### 25. Get Test Attempts
**GET** `{{baseUrl}}/api/admin/tests/{{testId}}/attempts`

---

## 🔒 **SECURITY TESTING**

### 26. Unauthorized Access Tests
**GET** `{{baseUrl}}/api/admin/dashboard`
- No Authorization header (should return 401)
- Invalid token (should return 403)
- Student token for admin route (should return 403)

### 27. Rate Limiting Test
Rapidly send 100+ requests to any endpoint to test rate limiting.

---

## 📋 **VALIDATION CHECKLIST**

### Phase 1 Foundation Validation ✅

#### Database Testing
- [ ] `npm run db:generate` completes successfully
- [ ] `npm run db:migrate` applies all migrations
- [ ] `npx prisma studio` shows all tables with relationships
- [ ] Can create, read, update, delete users
- [ ] BigInt IDs are properly serialized to strings

#### Authentication Testing
- [ ] User registration creates user and student profile
- [ ] Login returns valid JWT tokens
- [ ] Protected routes require valid tokens
- [ ] Admin routes blocked for non-admin users
- [ ] Password reset flow works end-to-end

### Phase 3 Admin Resource Testing ✅

#### Lessons Management
- [ ] Create lesson with valid Google Drive URL
- [ ] Reject invalid URL formats
- [ ] Update lesson preserves data integrity
- [ ] Delete prevention when lesson is in use
- [ ] Usage tracking shows correct course associations

#### Homework System
- [ ] Create complex nested structure (passages → questions → choices)
- [ ] Validate exactly 4 choices per question
- [ ] Validate exactly 1 correct answer per question
- [ ] Update replaces entire structure atomically
- [ ] Delete prevention when submissions exist

#### Test Management
- [ ] Create test with timer duration
- [ ] Validate duration constraints (1-300 minutes)
- [ ] Same nested validation as homework
- [ ] Attempt tracking functionality
- [ ] Delete prevention with active attempts

#### Security Validation
- [ ] All admin endpoints require admin token
- [ ] Student tokens rejected for admin routes
- [ ] Input validation prevents SQL injection
- [ ] Rate limiting prevents abuse
- [ ] Error messages don't leak sensitive data

---

## 🧪 **PLAYWRIGHT TESTING REQUIREMENTS**

### Mandatory Test Coverage
Every feature must have:

#### API Tests
```javascript
// Test every endpoint with:
test('Valid data scenarios', async () => {});
test('Invalid data rejection', async () => {});
test('Authentication requirements', async () => {});
test('Authorization restrictions', async () => {});
test('Error handling', async () => {});
```

#### Integration Tests
```javascript
// Test complete workflows:
test('Admin creates lesson and assigns to course', async () => {});
test('Student registration and profile access', async () => {});
test('Complex homework creation with nested data', async () => {});
```

#### Security Tests
```javascript
// Test security scenarios:
test('Unauthorized access blocked', async () => {});
test('Invalid tokens rejected', async () => {});
test('Role-based access enforced', async () => {});
```

---

## 📊 **TESTING WORKFLOWS**

### 1. Sequential Testing - Authentication
1. Health Check
2. Register new user
3. Login with registered user
4. Get profile
5. Test token refresh
6. Test forgot password
7. Get recent tokens (development)

### 2. Sequential Testing - Admin Resources
**Prerequisites**: Admin user credentials and login

1. **Admin Dashboard**: Get statistics
2. **Lessons Management**: Create → Get → Update → Delete
3. **Homework Management**: Create complex structure → Get → Update → Delete
4. **Test Management**: Create with timer → Get → Update → Delete

### 3. Validation Testing
For each endpoint:
1. ✅ Valid data (happy path)
2. ❌ Missing required fields
3. ❌ Invalid data formats
4. ❌ Boundary conditions
5. 🔒 Authentication/authorization

### 4. Admin-Specific Validation
1. **Google Drive URL Validation**:
   - Valid Google Drive URLs
   - Invalid URL formats
   - Non-Google Drive URLs

2. **Complex Structure Validation**:
   - Missing passages
   - Wrong choice count
   - No correct answer
   - Multiple correct answers

3. **Usage Dependency Testing**:
   - Delete lesson used in courses
   - Delete homework with submissions
   - Delete test with submissions

### 5. End-to-End Admin Workflow
1. Login as admin
2. Create lesson
3. Create homework with multiple passages
4. Create test with timer
5. Verify dashboard stats updated
6. Update each resource
7. Try to delete (should work if no dependencies)

---

## 🚨 **ERROR RESPONSE FORMAT**

All errors follow this format:
```json
{
  "error": "Error message",
  "details": ["Additional error details (for validation errors)"]
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created (for registration/creation)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## 📈 **PERFORMANCE TESTING**

### Response Time Expectations
- Authentication endpoints: < 500ms
- Simple GET requests: < 200ms
- Complex POST operations: < 1000ms
- Database queries: < 100ms

### Load Testing
- Concurrent users: 100+
- Requests per second: 50+
- Memory usage: < 512MB
- CPU usage: < 80%

---

## 🎯 **POSTMAN COLLECTION STATUS**

### Current Collection: ✅ 95% Complete
- **Total Endpoints**: 25+ requests
- **Test Scripts**: Comprehensive coverage
- **Environment Variables**: Proper token management
- **Validation**: Business rule testing included

### Missing Endpoints (Minor)
- Reset Password endpoint
- Recent Tokens endpoint (development only)

### Collection Usage
1. Import `SAT_Platform_API.postman_collection.json`
2. Set up environment with `baseUrl: http://localhost:5000`
3. Run Authentication folder first to get tokens
4. Execute Admin folders with admin credentials
5. Use sequential testing for best results

---

## ✅ **TESTING COMPLETION CRITERIA**

### Phase 1-3 Complete When:
- [ ] All authentication flows tested and passing
- [ ] All admin endpoints tested with valid/invalid data
- [ ] Security tests confirm proper access control
- [ ] Complex nested data structures work correctly
- [ ] Error handling covers all edge cases
- [ ] Performance meets response time requirements
- [ ] PlaywrightMCP test suite has 100% pass rate

### Ready for Phase 4 When:
- [ ] All Phase 1-3 tests are green
- [ ] Postman collection covers all endpoints
- [ ] Documentation is up to date
- [ ] Database schema is stable and migrated
- [ ] Environment setup is documented and working

---

This testing guide ensures comprehensive validation of all implemented features. Always run the complete test suite before deploying to production or moving to the next development phase.