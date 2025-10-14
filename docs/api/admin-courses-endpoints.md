# Admin Courses API Endpoints

**Base URL:** `/api/admin/courses`
**Status:** ✅ Complete
**Last Updated:** October 8, 2025
**Authentication:** Required (Admin role only)

---

## Overview

The admin courses API provides complete CRUD operations for course management, including course creation, content assignment, status management, and session handling.

**Features:**
- Create, read, update, delete courses
- Course status management (draft, published, archived)
- Thumbnail image upload
- Content assignment (lessons, homework, tests)
- Many-to-many relationship management
- Session management for live courses
- Filtering and pagination

---

## Endpoints

### 1. Get All Courses

Retrieve all courses with filtering, pagination, and sorting.

**Endpoint:** `GET /api/admin/courses`
**Authentication:** Required (Admin)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search by title (case-insensitive) |
| `status` | string | - | Filter by status: `draft`, `published`, `archived` |
| `type` | string | - | Filter by type: `live`, `finished` |
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 20 | Items per page (min: 1, max: 100) |
| `sortBy` | string | `createdAt` | Sort field: `title`, `price`, `createdAt` |
| `sortOrder` | string | `desc` | Sort order: `asc`, `desc` |

**Example Request:**
```
GET /api/admin/courses?status=published&type=live&page=1&limit=10&sortBy=title&sortOrder=asc
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Courses fetched successfully",
  "data": {
    "courses": [
      {
        "id": "1",
        "title": "SAT Prep Course - Fall 2025",
        "description": "Comprehensive SAT preparation course",
        "thumbnail": "/uploads/thumbnails/course1.jpg",
        "type": "live",
        "status": "published",
        "price": 5000,
        "createdAt": "2025-09-01T10:00:00.000Z",
        "lessonsCount": 12,
        "homeworkCount": 8,
        "testsCount": 4,
        "enrollmentsCount": 25,
        "sessionsCount": 24
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

---

### 2. Get Course By ID

Retrieve detailed information about a specific course including all assigned content.

**Endpoint:** `GET /api/admin/courses/:id`
**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (required): Course ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course fetched successfully",
  "data": {
    "id": "1",
    "title": "SAT Prep Course - Fall 2025",
    "description": "Comprehensive SAT preparation course covering...",
    "thumbnail": "/uploads/thumbnails/course1.jpg",
    "type": "live",
    "status": "published",
    "price": 5000,
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-09-15T14:30:00.000Z",
    "lessons": [
      {
        "id": "1",
        "title": "Introduction to SAT Reading",
        "videoLink": "https://drive.google.com/...",
        "order": 0
      }
    ],
    "homework": [
      {
        "id": "1",
        "title": "Reading Comprehension Practice 1",
        "dueDate": "2025-09-10",
        "passageCount": 2,
        "questionCount": 10
      }
    ],
    "tests": [
      {
        "id": "1",
        "title": "Mid-Term SAT Practice Test",
        "duration": 65,
        "dueDate": "2025-10-15",
        "passageCount": 3,
        "questionCount": 20
      }
    ],
    "sessions": [
      {
        "id": "1",
        "title": "Session 1: Introduction",
        "date": "2025-09-05T16:00:00.000Z"
      }
    ],
    "enrollments": [
      {
        "id": "1",
        "studentName": "John Michael Doe",
        "status": "active",
        "enrolledAt": "2025-08-25T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

---

### 3. Create Course

Create a new course with optional thumbnail upload.

**Endpoint:** `POST /api/admin/courses`
**Authentication:** Required (Admin)
**Content-Type:** `multipart/form-data` (for thumbnail upload)

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Course title (3-255 chars) |
| `description` | string | No | Course description (max 5000 chars) |
| `type` | string | Yes | Course type: `live` or `finished` |
| `price` | number | No | Price in EGP (min: 0) |
| `status` | string | No | Status: `draft`, `published`, `archived` (default: `draft`) |
| `thumbnail` | file | No | Image file (jpg, png, max 5MB) |

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/admin/courses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=SAT Prep Course" \
  -F "description=Comprehensive SAT preparation" \
  -F "type=live" \
  -F "price=5000" \
  -F "status=draft" \
  -F "thumbnail=@/path/to/image.jpg"
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": "1",
    "title": "SAT Prep Course",
    "description": "Comprehensive SAT preparation",
    "thumbnail": "/uploads/thumbnails/1728401234567-course.jpg",
    "type": "live",
    "status": "draft",
    "price": 5000,
    "createdAt": "2025-10-08T12:00:00.000Z"
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
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

**413 Payload Too Large** - File too large:
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB"
}
```

---

### 4. Update Course

Update an existing course, optionally replacing the thumbnail.

**Endpoint:** `PUT /api/admin/courses/:id`
**Authentication:** Required (Admin)
**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id` (required): Course ID

**Form Fields:**
Same as Create Course, but all fields are optional

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/admin/courses/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=SAT Prep Course - Updated" \
  -F "price=5500"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": "1",
    "title": "SAT Prep Course - Updated",
    "description": "Comprehensive SAT preparation",
    "thumbnail": "/uploads/thumbnails/course1.jpg",
    "type": "live",
    "status": "draft",
    "price": 5500,
    "updatedAt": "2025-10-08T13:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

---

### 5. Delete Course (Soft Delete)

Soft delete a course by setting deletedAt timestamp.

**Endpoint:** `DELETE /api/admin/courses/:id`
**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (required): Course ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": {
    "id": "1",
    "title": "SAT Prep Course",
    "deletedAt": "2025-10-08T14:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**400 Bad Request** - Course has active enrollments:
```json
{
  "success": false,
  "message": "Cannot delete course with active enrollments"
}
```

---

### 6. Update Course Status

Update only the course status (draft, published, archived).

**Endpoint:** `PATCH /api/admin/courses/:id/status`
**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (required): Course ID

**Request Body:**
```json
{
  "status": "published"
}
```

**Validation:**
- `status`: Required, must be one of: `draft`, `published`, `archived`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course status updated successfully",
  "data": {
    "id": "1",
    "title": "SAT Prep Course",
    "status": "published",
    "updatedAt": "2025-10-08T15:00:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**400 Bad Request** - Cannot publish incomplete course:
```json
{
  "success": false,
  "message": "Cannot publish course without content. Please add lessons, homework, or tests."
}
```

---

### 7. Get Course Sessions

Retrieve all sessions for a specific course (used for access window dropdowns).

**Endpoint:** `GET /api/admin/courses/:courseId/sessions`
**Authentication:** Required (Admin)

**URL Parameters:**
- `courseId` (required): Course ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course sessions fetched successfully",
  "data": {
    "courseId": "1",
    "courseTitle": "SAT Prep Course",
    "sessions": [
      {
        "id": "1",
        "title": "Session 1: Introduction",
        "date": "2025-09-05T16:00:00.000Z",
        "order": 1
      },
      {
        "id": "2",
        "title": "Session 2: Reading Strategies",
        "date": "2025-09-07T16:00:00.000Z",
        "order": 2
      }
    ],
    "totalSessions": 24
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**400 Bad Request** - Not a live course:
```json
{
  "success": false,
  "message": "Sessions are only available for live courses"
}
```

---

### 8. Assign Content to Course

Assign lessons, homework, or tests to a course.

**Endpoint:** `POST /api/admin/courses/:id/content`
**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (required): Course ID

**Request Body:**
```json
{
  "contentType": "lesson",
  "contentId": "5",
  "order": 3,
  "dueDate": "2025-09-15"
}
```

**Validation:**
- `contentType`: Required, must be: `lesson`, `homework`, or `test`
- `contentId`: Required, must be valid ID of existing resource
- `order`: Optional, number (for ordering in course)
- `dueDate`: Optional, ISO date string (required for homework and tests)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Lesson assigned to course successfully",
  "data": {
    "courseId": "1",
    "lessonId": "5",
    "order": 3
  }
}
```

**For Homework/Test:**
```json
{
  "success": true,
  "message": "Homework assigned to course successfully",
  "data": {
    "courseId": "1",
    "homeworkId": "3",
    "dueDate": "2025-09-15",
    "order": 2
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**400 Bad Request** - Content already assigned:
```json
{
  "success": false,
  "message": "This lesson is already assigned to this course"
}
```

**400 Bad Request** - Missing due date:
```json
{
  "success": false,
  "message": "Due date is required for homework and tests"
}
```

---

### 9. Remove Content from Course

Remove a lesson, homework, or test from a course.

**Endpoint:** `DELETE /api/admin/courses/:id/content/:contentId`
**Authentication:** Required (Admin)

**URL Parameters:**
- `id` (required): Course ID
- `contentId` (required): Content ID to remove

**Query Parameters:**
- `contentType` (required): Type of content - `lesson`, `homework`, or `test`

**Example Request:**
```
DELETE /api/admin/courses/1/content/5?contentType=lesson
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Lesson removed from course successfully",
  "data": {
    "courseId": "1",
    "lessonId": "5"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**404 Not Found** - Content not assigned:
```json
{
  "success": false,
  "message": "This lesson is not assigned to this course"
}
```

**400 Bad Request** - Content has submissions:
```json
{
  "success": false,
  "message": "Cannot remove homework that has student submissions"
}
```

---

## Course Types

### Live Course
- Has scheduled sessions with dates
- Supports access windows for partial access
- Can track attendance
- Typically requires enrollment request approval

**Example:**
```json
{
  "type": "live",
  "sessions": [
    { "title": "Session 1", "date": "2025-09-05T16:00:00.000Z" }
  ]
}
```

### Finished Course
- Pre-recorded content
- All content available immediately upon enrollment
- Can support online payment for immediate enrollment
- No sessions or attendance tracking

**Example:**
```json
{
  "type": "finished",
  "sessions": []
}
```

---

## Course Status Flow

### Draft
- Default status for new courses
- Not visible to students
- Can be edited freely
- Used for course preparation

### Published
- Visible to students
- Available for enrollment
- Can still be edited but with cautions
- Content can be added/removed

### Archived
- Not visible to students
- No new enrollments allowed
- Existing enrollments remain active
- Historical data preserved

---

## Many-to-Many Relationships

### How Content Assignment Works

Courses and resources (lessons, homework, tests) have a many-to-many relationship:

**Junction Tables:**
- `CourseLesson` - Links courses to lessons
- `CourseHomework` - Links courses to homework (with due date)
- `CourseTest` - Links courses to tests (with due date)

**Benefits:**
1. Reusable content across multiple courses
2. Update resource once, reflects in all courses
3. Efficient content management
4. Track which courses use which resources

**Example:**
```
Lesson "SAT Reading Strategies" (ID: 5)
├── Used in "Fall 2025 SAT Course" (order: 3)
├── Used in "Spring 2026 SAT Course" (order: 2)
└── Used in "Summer Intensive SAT" (order: 1)
```

---

## File Upload

### Thumbnail Images

**Accepted Formats:** JPG, PNG
**Maximum Size:** 5MB
**Storage:** `server/uploads/thumbnails/`
**Naming:** `{timestamp}-{originalname}`

**Upload Process:**
1. Client sends multipart/form-data with thumbnail file
2. Multer middleware validates file type and size
3. File saved to uploads directory
4. Relative path stored in database
5. Old thumbnail deleted if updating

**Example Path:** `/uploads/thumbnails/1728401234567-course-image.jpg`

---

## Related Files

**Backend:**
- Routes: `server/routes/admin/courses.routes.js`
- Controller: `server/controllers/admin/courses.controller.js`
- Schemas: `server/schemas/course.schemas.js`
- Middleware: `server/middlewares/upload.middleware.js`

**Frontend:**
- Admin Courses Page: `client/src/pages/admin/AdminCourses.jsx`
- Course Details Page: `client/src/pages/admin/CourseDetailsPage.jsx`
- Create Course Page: `client/src/pages/admin/CreateCourse.jsx`
- Course Form: `client/src/components/admin/CourseForm.jsx`

---

## Testing Examples

**Create Course:**
```bash
curl -X POST http://localhost:5000/api/admin/courses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Test Course" \
  -F "description=Test Description" \
  -F "type=live" \
  -F "price=1000" \
  -F "status=draft"
```

**Get All Courses:**
```bash
curl -X GET "http://localhost:5000/api/admin/courses?status=published&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Assign Lesson to Course:**
```bash
curl -X POST http://localhost:5000/api/admin/courses/1/content \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "lesson",
    "contentId": "5",
    "order": 3
  }'
```

---

## Next Steps

### Completed Features
- ✅ Full CRUD operations
- ✅ Content assignment system
- ✅ Thumbnail upload
- ✅ Status management
- ✅ Filtering and pagination

### Upcoming Enhancements
- 📋 Bulk operations (assign multiple resources at once)
- 📋 Course duplication
- 📋 Course templates
- 📋 Analytics integration (student performance by course)
- 📋 Automated session creation for live courses
