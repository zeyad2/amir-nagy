# SAT & English Teaching Platform - Build Instructions

## Project Overview
Build a centralized online learning platform for Mr. Amir Nagy's SAT & English courses. This is a single-instructor platform (not a marketplace) with course delivery, automated grading, and student performance tracking.


## Subagents Available

This project uses specialized subagents located in the `.claude/agents/` folder:

- **Database Architect** (`database-architect.md`) - Prisma schema, migrations, query optimization
- **API Engineer** (`api-engineer.md`) - Express routes, authentication, payment integration  
- **Frontend Specialist** (`frontend-specialist.md`) - React components, UI/UX, student interfaces
- **Integration Orchestrator** (`integration-orchestrator.md`) - Testing, system integration, deployment

When working on domain-specific tasks, reference the appropriate subagent for specialized expertise.


## Technical Requirements

### Technology Stack
- **Frontend**: React 18.x (JavaScript, NOT TypeScript)
- **Backend**: Node.js 18.x LTS with Express.js 4.x (JavaScript, NOT TypeScript)
- **Database**: PostgreSQL 14.x with Prisma ORM
- **Authentication**: JWT with bcrypt for password hashing
- **Email**: Nodemailer (NOT SendGrid)
- **File Upload**: Multer (PDFs only, max 10MB)
- **Payment**: PayMob and Fawry APIs (Egyptian Pounds)
- **External APIs**: WhatsApp Business API, Google Drive API
- **Hosting**: Configured for Hostinger deployment
- **NO Redis, NO TypeScript**

### Project Structure
```
sat-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Reusable UI components (buttons, modals, etc.)
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── student/    # Student-specific components
│   │   │   └── public/     # Public landing page components
│   │   ├── pages/          # Page components (Dashboard, CourseView, etc.)
│   │   ├── services/       # API calls and external service integrations
│   │   ├── utils/          # Helper functions and utilities
│   │   ├── styles/         # SAT-specific styling and CSS
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # Express route definitions (auth, courses, etc.)
│   ├── controllers/       # Business logic handlers for routes
│   ├── middlewares/       # Custom middleware (auth, validation, error handling)
│   ├── uploads/           # File storage directory for PDFs
│   ├── config/            # Configuration files (database, email, payment gateways)
│   ├── prisma/            # Prisma schema and migrations
│   │   ├── schema.prisma  # Database schema definition
│   │   └── migrations/    # Database migration files
│   ├── app.js            # Express app setup and server entry point
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

#### Folder Responsibilities

**Server Folder Structure:**
- `routes/` - Define all API endpoints and HTTP request routing
- `controllers/` - Contain business logic that handles requests from routes
- `middlewares/` - House authentication, validation, error handling, and other middleware functions
- `uploads/` - Store uploaded PDF files and other media
- `config/` - Configuration files for database connections, email setup, payment gateway credentials
- `prisma/` - Database schema, migrations, and Prisma client configuration

## Complete Database Schema

This is the EXACT schema to implement. Use this schema as-is with Prisma:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===========================
// USERS & ROLES
// ===========================
model User {
  uuid           BigInt    @id @default(autoincrement())
  email          String    @unique
  hashedPassword String
  role           Role
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?

  // Relations
  student           Student?
  paymentsApproved  Payment[] @relation("ApprovedBy")

  @@map("user")
}

enum Role {
  admin
  student
  parent
  teacher
}

model Student {
  uuid            BigInt @id
  firstName       String
  middleName      String
  lastName        String
  phone           String @db.VarChar(30)
  parentFirstName String
  parentLastName  String
  parentEmail     String
  parentPhone     String @db.VarChar(30)

  // Relations
  user                User                   @relation(fields: [uuid], references: [uuid], onDelete: Cascade)
  enrollments         Enrollment[]
  attendances         Attendance[]
  homeworkSubmissions HomeworkSubmission[]
  testSubmissions     TestSubmission[]
  enrollmentRequests  EnrollmentRequest[]

  @@map("student")
}

// ===========================
// COURSES
// ===========================
model Course {
  id          BigInt      @id @default(autoincrement())
  title       String
  thumbnail   String?
  description String?
  createdAt   DateTime    @default(now())
  status      CourseStatus @default(draft)
  type        CourseType
  price       Int?
  deletedAt   DateTime?

  // Relations
  enrollments     Enrollment[]
  sessions        Session[]
  courseLessons   CourseLesson[]
  courseHomeworks CourseHomework[]
  courseTests     CourseTest[]
  enrollmentRequests EnrollmentRequest[]

  @@map("course")
}

enum CourseStatus {
  draft
  published
  archived
}

enum CourseType {
  finished
  live
}

// ===========================
// ENROLLMENTS
// ===========================
model Enrollment {
  id        BigInt           @id @default(autoincrement())
  studentId BigInt
  courseId  BigInt
  status    EnrollmentStatus @default(active)
  createdAt DateTime         @default(now())
  deletedAt DateTime?

  // Relations
  student       Student        @relation(fields: [studentId], references: [uuid], onDelete: Cascade)
  course        Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  payments      Payment[]
  accessWindows AccessWindow[]

  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
  @@map("enrollment")
}

enum EnrollmentStatus {
  active
  suspended
  completed
}

// ===========================
// SESSIONS (for live courses)
// ===========================
model Session {
  id       BigInt   @id @default(autoincrement())
  courseId BigInt
  title    String?
  date     DateTime

  // Relations
  course               Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  attendances          Attendance[]
  accessWindowsStart   AccessWindow[] @relation("StartSession")
  accessWindowsEnd     AccessWindow[] @relation("EndSession")

  @@index([courseId])
  @@map("session")
}

// Access windows (for partial/late join in live courses)
model AccessWindow {
  id             BigInt   @id @default(autoincrement())
  enrollmentId   BigInt
  startSessionId BigInt
  endSessionId   BigInt
  createdAt      DateTime @default(now())

  // Relations
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  startSession Session    @relation("StartSession", fields: [startSessionId], references: [id], onDelete: Cascade)
  endSession   Session    @relation("EndSession", fields: [endSessionId], references: [id], onDelete: Cascade)

  @@index([enrollmentId])
  @@map("accessWindow")
}

// Payments
model Payment {
  id               BigInt      @id @default(autoincrement())
  enrollmentId     BigInt
  amount           Decimal     @db.Decimal(12, 2)
  currency         String      @default("EGP") @db.VarChar(10)
  paymentDate      DateTime    @default(now())
  paymentType      PaymentType
  status           PaymentStatus @default(pending)
  approvedBy       BigInt?
  sessionsPurchased Int?
  notes            String?
  deletedAt        DateTime?

  // Relations
  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  approver   User?      @relation("ApprovedBy", fields: [approvedBy], references: [uuid], onDelete: SetNull)

  @@index([enrollmentId])
  @@index([status])
  @@map("payment")
}

enum PaymentType {
  full
  installment
  per_session
}

enum PaymentStatus {
  pending
  confirmed
  rejected
}

// Attendance
model Attendance {
  id        BigInt           @id @default(autoincrement())
  sessionId BigInt
  studentId BigInt
  status    AttendanceStatus

  // Relations
  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [uuid], onDelete: Cascade)

  @@unique([sessionId, studentId])
  @@index([sessionId])
  @@index([studentId])
  @@map("attendance")
}

enum AttendanceStatus {
  present
  absent
}

// ===========================
// LESSONS
// ===========================
model Lesson {
  id        BigInt @id @default(autoincrement())
  title     String
  videoLink String

  // Relations
  courseLessons CourseLesson[]

  @@map("lesson")
}

model CourseLesson {
  id       BigInt @id @default(autoincrement())
  courseId BigInt
  lessonId BigInt
  order    Int?

  // Relations
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([courseId, lessonId])
  @@index([courseId])
  @@map("courseLesson")
}

// ===========================
// HOMEWORK 
// ===========================
model Homework {
  id           BigInt   @id @default(autoincrement())
  title        String
  instructions String?
  createdAt    DateTime @default(now())

  // Relations
  passages         HomeworkPassage[]
  courseHomeworks  CourseHomework[]
  submissions      HomeworkSubmission[]

  @@map("homework")
}

model HomeworkPassage {
  id         BigInt  @id @default(autoincrement())
  homeworkId BigInt
  title      String?
  content    String
  imageURL   String?
  order      Int?

  // Relations
  homework  Homework           @relation(fields: [homeworkId], references: [id], onDelete: Cascade)
  questions HomeworkQuestion[]

  @@map("homeworkPassage")
}

model HomeworkQuestion {
  id         BigInt @id @default(autoincrement())
  passageId  BigInt
  questionText String
  order      Int?

  // Relations
  passage HomeworkPassage @relation(fields: [passageId], references: [id], onDelete: Cascade)
  choices QuestionChoice[]
  answers HomeworkAnswer[]

  @@map("homeworkQuestion")
}

model QuestionChoice {
  id         BigInt  @id @default(autoincrement())
  questionId BigInt
  choiceText String
  isCorrect  Boolean
  order      Int?

  // Relations
  question         HomeworkQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  homeworkAnswers  HomeworkAnswer[]
  testAnswers      TestAnswer[]

  @@map("questionChoice")
}

model CourseHomework {
  id         BigInt   @id @default(autoincrement())
  courseId   BigInt
  homeworkId BigInt
  dueDate    DateTime @db.Date

  // Relations
  course   Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  homework Homework @relation(fields: [homeworkId], references: [id], onDelete: Cascade)

  @@unique([courseId, homeworkId])
  @@index([courseId])
  @@map("courseHomework")
}

model HomeworkSubmission {
  id          BigInt   @id @default(autoincrement())
  homeworkId  BigInt
  studentId   BigInt
  submittedAt DateTime @default(now())
  score       Int

  // Relations
  homework Homework         @relation(fields: [homeworkId], references: [id], onDelete: Cascade)
  student  Student          @relation(fields: [studentId], references: [uuid], onDelete: Cascade)
  answers  HomeworkAnswer[]

  @@unique([homeworkId, studentId])
  @@map("homeworkSubmission")
}

model HomeworkAnswer {
  id           BigInt   @id @default(autoincrement())
  submissionId BigInt
  questionId   BigInt
  choiceId     BigInt?
  isCorrect    Boolean?

  // Relations
  submission HomeworkSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  question   HomeworkQuestion   @relation(fields: [questionId], references: [id], onDelete: Cascade)
  choice     QuestionChoice?    @relation(fields: [choiceId], references: [id], onDelete: SetNull)

  @@map("homeworkAnswer")
}

// ===========================
// TESTS 
// ===========================
model Test {
  id           BigInt   @id @default(autoincrement())
  title        String
  instructions String?
  duration     Int?
  createdAt    DateTime @default(now())

  // Relations
  passages    TestPassage[]
  courseTests CourseTest[]
  submissions TestSubmission[]

  @@map("test")
}

model TestPassage {
  id       BigInt  @id @default(autoincrement())
  testId   BigInt
  title    String?
  content  String
  imageURL String?
  order    Int?

  // Relations
  test      Test           @relation(fields: [testId], references: [id], onDelete: Cascade)
  questions TestQuestion[]

  @@map("testPassage")
}

model TestQuestion {
  id           BigInt @id @default(autoincrement())
  passageId    BigInt
  questionText String
  order        Int?

  // Relations
  passage TestPassage         @relation(fields: [passageId], references: [id], onDelete: Cascade)
  choices TestQuestionChoice[]
  answers TestAnswer[]

  @@map("testQuestion")
}

model TestQuestionChoice {
  id         BigInt  @id @default(autoincrement())
  questionId BigInt
  choiceText String
  isCorrect  Boolean
  order      Int?

  // Relations
  question TestQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  answers  TestAnswer[]

  @@map("testQuestionChoice")
}

model CourseTest {
  id      BigInt   @id @default(autoincrement())
  courseId BigInt
  testId  BigInt
  dueDate DateTime @db.Date

  // Relations
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  test   Test   @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@unique([courseId, testId])
  @@index([courseId])
  @@map("courseTest")
}

model TestSubmission {
  id          BigInt   @id @default(autoincrement())
  testId      BigInt
  studentId   BigInt
  submittedAt DateTime @default(now())
  score       Int

  // Relations
  test    Test         @relation(fields: [testId], references: [id], onDelete: Cascade)
  student Student      @relation(fields: [studentId], references: [uuid], onDelete: Cascade)
  answers TestAnswer[]

  @@unique([testId, studentId])
  @@map("testSubmission")
}

model TestAnswer {
  id           BigInt   @id @default(autoincrement())
  submissionId BigInt
  questionId   BigInt
  choiceId     BigInt?
  isCorrect    Boolean?

  // Relations
  submission TestSubmission     @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  question   TestQuestion       @relation(fields: [questionId], references: [id], onDelete: Cascade)
  choice     TestQuestionChoice? @relation(fields: [choiceId], references: [id], onDelete: SetNull)

  @@index([submissionId])
  @@map("testAnswer")
}

// ===========================
// ENROLLMENT REQUESTS
// ===========================
model EnrollmentRequest {
  id          BigInt              @id @default(autoincrement())
  studentId   BigInt
  courseId    BigInt
  status      EnrollmentRequestStatus @default(pending)
  requestedAt DateTime            @default(now())

  // Relations
  student Student @relation(fields: [studentId], references: [uuid], onDelete: Cascade)
  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([studentId, courseId])
  @@map("enrollmentRequest")
}

enum EnrollmentRequestStatus {
  pending
  approved
  rejected
}
```

## Features to Implement

### 1. Public Pages (No Authentication Required)

#### Landing Page
- Modern, stylish design with Mr. Amir's photo
- Hero section with call-to-action
- Course listings with cards showing:
  - Course title, description, type (live/finished), price
  - "View Details" button
- Score improvements showcase (before/after results)
- Testimonials section
- FAQ section
- Contact form

#### Course Detail Page
- Full course description
- Course curriculum (lessons, homework, tests) - visible but locked
- Instructor information
- Price and enrollment options:
  - For finished courses: "Pay Now" button (online payment) OR "Join Course" button (enrollment request)
  - For live courses: "Join Course" button only (enrollment request)
- If not authenticated: "Sign Up to Enroll" button
- If enrolled: Full access to all resources

### 2. Authentication System

#### Registration Flow
1. User clicks "Sign Up to Enroll" on course page
2. Registration form with fields:
   - First Name, Middle Name, Last Name (required)
   - Email (required, unique)
   - Password (min 8 chars, mixed case, numbers)
   - Phone Number (required)
   - Parent First Name, Parent Last Name (required)
   - Parent Phone (required for WhatsApp)
   - Parent Email (required for email notifications)
3. After registration, redirect to enrollment request

#### Login System
- JWT authentication with 24-hour token expiry
- Refresh token mechanism
- Password reset via email
- Remember me option

### 3. Student Portal

#### Student Dashboard
- Welcome message with student name
- Quick stats cards:
  - Enrolled courses count
  - Average performance
  - Upcoming deadlines
  - Recent scores
- Course cards with progress indicators
- Recent activity feed

#### My Courses Page
- List of enrolled courses
- Each course card shows:
  - Course title and type
  - Progress bar
  - Last accessed date
  - "Continue Learning" button
- Filter by: Active, Completed, All

#### Course Learning Page (for enrolled students)
- Course navigation sidebar:
  - Lessons list with checkmarks
  - Homework section
  - Tests section
- Main content area:
  - Video player for lessons (embedded from Google Drive)
  - Zoom link button for live sessions
  - Start button for assessments

#### Assessment Taking Interface

##### Homework Interface
- Passage display (text and/or image)
- Question navigation panel
- Multiple choice questions with radio buttons
- "Save Progress" button (allows resuming later)
- "Submit" button with confirmation dialog
- After submission:
  - Immediate score display
  - Question-by-question review with explanations
  - "Retry" button if attempts remaining

##### Test Interface
- Timer display (countdown in MM:SS format)
- Auto-submit when timer reaches zero
- No save progress option
- Passage and questions in SAT format
- Question navigation with answered/unanswered indicators
- Warning at 5 minutes remaining
- After submission: Same as homework but no retry

#### Performance Dashboard
- Overall statistics:
  - Average score across all assessments
  - Total assessments completed
  - Time spent studying
- Performance graphs:
  - Score trend over time (line chart)
  - Performance by assessment type (bar chart)
  - Weak areas identification (radar chart)
- Detailed submission history table:
  - Assessment name, type, score, date, time taken
  - Click to view detailed attempt

### 4. Admin Portal

#### Admin Dashboard
- Statistics cards:
  - Total students
  - Active courses
  - Pending enrollment requests
  - Recent submissions
- Quick actions:
  - Create course
  - Add assessment
  - View requests
  - Send reports

#### Resource Management

##### Lessons Management
- List view with search and filters
- Create lesson form:
  - Title
  - Google Drive video URL
- Edit/Delete actions
- Usage indicator (shows which courses use this lesson)

##### Homework Builder
- Homework details form:
  - Title, instructions
- Passage builder:
  - Rich text editor for content
  - Image upload for passage
  - Title (optional)
- Question builder:
  - Question text input
  - Four choice inputs (A, B, C, D)
  - Mark correct answer
  - Add/Remove/Reorder questions
- Preview in SAT format before saving

##### Test Builder
- Test details form:
  - Title, instructions
  - Duration in minutes
- Same passage and question builder as homework
- Preview in SAT format before saving

#### Course Management

##### Create/Edit Course
- Course details:
  - Title, description
  - Type: Live or Finished
  - Price in EGP
  - Status: Draft, Published, or Archived
  - Thumbnail image upload
- Resource assignment:
  - Three tabs: Lessons, Homework, Tests
  - Each tab shows available resources with checkboxes
  - Selected resources appear in course curriculum
  - Drag-and-drop to reorder
  - Set due dates for homework and tests

##### Enrollment Request Management
- Table with columns:
  - Student name, email, phone
  - Course requested
  - Request date
  - Status (Pending/Approved/Rejected)
  - Actions
- Action buttons:
  - View Details (shows full student and parent info)
  - Approve (creates enrollment with "active" status)
  - Reject (updates request status to "rejected")
- Bulk actions for multiple selections
- Email notifications sent automatically on approval/rejection

#### Student Management

##### All Students View
- Searchable table with filters
- Student details modal:
  - Personal information
  - Parent information
  - Enrolled courses
  - Performance summary
  - Payment history
- Actions:
  - View detailed profile
  - Manual enrollment
  - Reset password
  - Send email

##### Individual Student Profile
- Student information section
- Enrolled courses with access dates
- Assessment attempts table:
  - Shows ALL attempts with scores
  - Click to view question-by-question answers
- Attendance records (for live courses)
- Performance analytics:
  - Score trends
  - Strengths and weaknesses
  - Time analysis

#### Reports & Analytics

##### Performance Reports
- Filter by:
  - Course
  - Date range
  - Assessment type
  - Student
- Visualizations:
  - Class average trends
  - Score distribution
  - Completion rates
  - Question-level analysis (which questions students struggle with)

##### WhatsApp Report Sender
- Select course from dropdown
- Preview report format (plain text):
  ```
  Weekly Report - [Student Name]
  Course: [Course Name]
  
  Attendance: X/Y sessions
  
  Homework Performance:
  - HW1: 18/20
  - HW2: 17/20
  Average: 87.5%
  
  Test Results:
  - Test 1: 45/50
  Average: 90%
  
  Overall: Excellent
  ```
- "Send to All Parents" button
- Confirmation dialog with recipient count
- Success/failure notification

### 5. Payment Integration

#### Payment Flow for Finished Courses with Online Payment
1. Student clicks "Pay Now" button for finished course
2. Student selects payment method (PayMob/Fawry)
3. Redirected to payment gateway
4. On successful payment:
   - Automatic enrollment creation with "active" status
   - Email confirmation sent
   - Immediate course access granted
5. On failed payment:
   - Student redirected back with error message
   - No enrollment created

#### Enrollment Request Flow (All Other Cases)
1. Student clicks "Join Course" button for:
   - Live courses (regardless of payment method)
   - Finished courses with offline payment preference
2. Enrollment request created in enrollmentRequest table with "pending" status
3. Admin views pending requests in admin panel
4. Admin can:
   - Approve request: Creates enrollment with "active" status
   - Reject request: Updates request status to "rejected"
5. Student receives email notification of approval/rejection
6. If approved, student gains immediate access to course resources

### 6. Communication System

#### Email Notifications (Automated via Nodemailer)
Configure templates for:
- Welcome email on registration
- Enrollment request confirmation
- Enrollment request approval/rejection notification
- Payment confirmation receipts
- Session reminders (24 hours before for live courses)
- Homework deadline reminders (2 days before)
- Assessment score notifications
- Password reset

#### WhatsApp Integration (Manual Only)
- Admin-triggered only (no automatic sending)
- Bulk send by course
- Plain text format only
- Types of reports:
  - Weekly performance summary
  - Attendance report
  - Test results summary

### 7. Access Control Rules

#### Course Resource Access Logic
A student can access a course's resources if they have an active enrollment in that course.

### 8. SAT-Style Formatting Requirements

All assessments must follow SAT formatting standards with proper typography and spacing.

### 9. Critical Implementation Notes

#### Many-to-Many Relationships
- Lessons can be assigned to multiple courses via CourseLesson junction table
- Homework can be assigned to multiple courses via CourseHomework junction table
- Tests can be assigned to multiple courses via CourseTest junction table
- Admin creates these resources once, reuses across courses

#### Submission Storage
- Store EVERY student answer in HomeworkAnswer/TestAnswer tables
- Track which choice was selected, not just if correct
- This enables detailed analysis of student performance

#### Email vs WhatsApp
- Email: All automated notifications (free via Nodemailer)
- WhatsApp: Only manual reports by admin (costs money per message)
- Never send automatic WhatsApp messages

#### Enrollment Logic
- Finished course + online payment = automatic enrollment with active status
- All other cases (live courses, offline payment) require admin approval via enrollment request
- Payment is only processed for finished courses with online payment option

## API Endpoints Structure

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Public Endpoints (no auth required)
- GET /api/courses (list all published courses)
- GET /api/courses/:id (course details with locked resources)

### Student Endpoints (require student auth)
- GET /api/student/dashboard
- GET /api/student/courses (enrolled courses)
- GET /api/student/courses/:id/resources (if enrolled)
- POST /api/enrollment-requests (create enrollment request)
- GET /api/student/homework/:id/attempt (start homework attempt)
- POST /api/student/homework/:id/submit
- GET /api/student/tests/:id/attempt (start test attempt)
- POST /api/student/tests/:id/submit
- GET /api/student/performance
- GET /api/student/submissions

### Admin Endpoints (require admin auth)
- Full CRUD for: courses, lessons, homework, tests
- GET /api/admin/enrollment-requests
- PUT /api/admin/enrollment-requests/:id/approve
- PUT /api/admin/enrollment-requests/:id/reject
- GET /api/admin/students
- GET /api/admin/students/:id/details
- POST /api/admin/reports/whatsapp/send
- GET /api/admin/analytics

### Payment Endpoints
- POST /api/payments/initiate
- POST /api/payments/callback/paymob
- POST /api/payments/callback/fawry
- GET /api/payments/verify/:reference

## Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sat_platform?schema=public"

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Payment Gateways
PAYMOB_API_KEY=your_paymob_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_HMAC_SECRET=your_hmac_secret

FAWRY_MERCHANT_CODE=your_merchant_code
FAWRY_SECURITY_KEY=your_security_key

# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Google Drive
GOOGLE_DRIVE_API_KEY=your_api_key

# Frontend URL
CLIENT_URL=http://localhost:3000
```

## Development Steps

### Phase 1: Setup & Foundation
1. Initialize project structure with client and server folders
2. Set up PostgreSQL database and configure Prisma
3. Run `npx prisma migrate dev` to create database schema
4. Generate Prisma client with `npx prisma generate`
5. Implement JWT authentication system in controllers and middlewares
6. Create user registration and login in routes and controllers
7. Set up role-based middleware

### Phase 2: Admin Resource Management
1. Build lessons CRUD in controllers with routes
2. Create homework builder with passages and questions in controllers
3. Implement test builder in controllers
4. Create admin UI in React client
5. Test resource creation and editing

### Phase 3: Course System
1. Implement course CRUD in controllers
2. Build resource assignment interface (many-to-many relationships)
3. Create public course pages in React client
4. Implement enrollment system in controllers

### Phase 4: Student Learning Flow
1. Build student dashboard in React client
2. Create course learning interface in client
3. Implement assessment taking system in client and controllers
4. Add submission storage with detailed answers in controllers
5. Create performance analytics in controllers and client

### Phase 5: Payment & Communication
1. Integrate PayMob and Fawry in controllers and config
2. Set up Nodemailer configuration
3. Configure WhatsApp API for manual reports
4. Test payment flows

### Phase 6: Testing & Deployment
1. Write tests for critical paths
2. Optimize Prisma queries and performance
3. Set up production environment
4. Deploy to Hostinger

## Testing Checklist

### Authentication & Authorization
- [ ] Student registration with all required fields creates user and student records
- [ ] Login with JWT token generation
- [ ] Role-based access control working via middleware
- [ ] Password reset flow

### Resource Management
- [ ] Admin can create standalone lessons
- [ ] Admin can create homework with passages