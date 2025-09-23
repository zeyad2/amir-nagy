# Database and API Patterns

## Database Schema Overview
- **Location**: `server/prisma/schema.prisma`
- **Database**: PostgreSQL 14.x with Prisma ORM
- **Key Models**: User, Student, Course, Enrollment, Lesson, Homework, Test, Payment, AccessWindow

## Key Database Patterns

### Many-to-Many Relationships
Resources (lessons, homework, tests) can be assigned to multiple courses:
```javascript
// Junction tables
CourseLesson    // Links courses to lessons
CourseHomework  // Links courses to homework  
CourseTest      // Links courses to tests
```

### Complete Answer Storage
Every student response is stored for detailed analytics:
```javascript
// Homework answers
HomeworkAnswer {
  questionId, selectedChoice, isCorrect, submissionId
}

// Test answers  
TestAnswer {
  questionId, selectedChoice, isCorrect, submissionId
}
```

### Access Windows (Critical Feature)
Controls partial course access for live courses:
```javascript
AccessWindow {
  enrollmentId,     // Which enrollment
  startSessionId,   // First accessible session
  endSessionId      // Last accessible session
}
```

## API Response Patterns

### Success Response
```javascript
res.status(200).json({
  success: true,
  data: responseData,
  message: 'Optional success message'
})
```

### Error Response
```javascript
res.status(400).json({
  success: false,
  error: 'User-friendly error message',
  details: 'Technical details for debugging'
})
```

### Paginated Response
```javascript
res.status(200).json({
  success: true,
  data: items,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    pages: 10
  }
})
```

## Authentication Patterns

### JWT Implementation
```javascript
// Token generation
const token = jwt.sign(
  { userId: user.uuid, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)

// Middleware verification
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  // verification logic
}
```

### Role-based Access
```javascript
// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' })
  }
  next()
}
```

## Validation Patterns (Joi)

### Request Validation
```javascript
import Joi from 'joi'

const createCourseSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('live', 'finished').required(),
  price: Joi.number().positive().required()
})

// Usage in controller
const { error, value } = createCourseSchema.validate(req.body)
if (error) {
  return res.status(400).json({ 
    success: false, 
    error: error.details[0].message 
  })
}
```

## Prisma Query Patterns

### Basic CRUD
```javascript
// Create
const user = await prisma.user.create({
  data: { email, hashedPassword, role }
})

// Read with relations
const course = await prisma.course.findUnique({
  where: { uuid: courseId },
  include: {
    lessons: true,
    homework: true,
    tests: true
  }
})

// Update
const updated = await prisma.student.update({
  where: { uuid: studentId },
  data: { firstName, lastName }
})

// Delete (soft delete pattern)
const deleted = await prisma.course.update({
  where: { uuid: courseId },
  data: { deletedAt: new Date() }
})
```

### Complex Queries
```javascript
// Many-to-many through junction tables
const courseWithResources = await prisma.course.findUnique({
  where: { uuid: courseId },
  include: {
    courseLessons: {
      include: { lesson: true }
    },
    courseHomework: {
      include: { homework: true }
    },
    courseTests: {
      include: { test: true }
    }
  }
})

// Access window checking
const enrollment = await prisma.enrollment.findUnique({
  where: { uuid: enrollmentId },
  include: {
    accessWindow: true,
    course: {
      include: { sessions: true }
    }
  }
})
```

## File Upload Patterns (Multer)

### PDF Upload Configuration
```javascript
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'))
    }
  }
})
```

## Email Notification Patterns (Nodemailer)

### Email Configuration
```javascript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Send email
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: recipient,
  subject,
  html: emailTemplate
})
```