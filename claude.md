# SAT & English Teaching Platform - Build Instructions

## Project Overview
Build a centralized online learning platform for Mr. Amir Nagy's SAT & English courses. This is a single-instructor platform (not a marketplace) with course delivery, automated grading, and student performance tracking.

## 🚨 CRITICAL IMPLEMENTATION REQUIREMENTS 🚨

### MUST USE ALL SUBAGENTS
**⚠️ IMPORTANT: You MUST actively use ALL subagents for their specialized domains found in :E:\projects\amir-nagy\.claude\agents**
- **Database Architect** (`database-architect.md`) - For ALL Prisma schema work, migrations, query optimization
- **API Engineer** (`api-engineer.md`) - For ALL Express routes, authentication, payment integration  
- **Frontend Specialist** (`frontend-specialist.md`) - For ALL React components, UI/UX, student interfaces
- **Integration Orchestrator** (`integration-orchestrator.md`) - For ALL testing coordination, system integration, deployment

**Before implementing any feature, ALWAYS:**
1. Identify which domain it belongs to
2. Consult the appropriate subagent
3. Follow the subagent's specialized guidance
4. Document which subagent was consulted

### MUST TEST EVERYTHING WITH PLAYWRIGHT
**⚠️ MANDATORY: Use PlaywrightMCP for testing ALL implementations:**
- Test EVERY API endpoint after creation
- Test EVERY UI component after implementation
- Create end-to-end tests for critical user flows
- Document test results and coverage
- No feature is complete without Playwright tests

### ACCESS WINDOWS - CRITICAL FEATURE
**MUST IMPLEMENT:**
Access windows are essential for managing partial course access in live courses:
- **Access windows are tied to enrollments** (via enrollmentId in AccessWindow table)
- Students can have **partial access** (specific session range) or **full access** (all sessions)
- For live courses, admin can grant:
  - Full course access (no access window needed)
  - Partial access (creates access window with start/end sessions)
- **Implementation requirements:**
  - When enrolling a student in a live course, admin chooses access type
  - If partial/late join, admin selects start and end sessions
  - Student portal only shows accessible sessions based on access windows

## Technical Requirements

### ⚠️ PACKAGE INSTALLATION WARNING ⚠️
**DO NOT install unnecessary packages!** Only install packages that are absolutely essential for the functionality. Before installing any package:
1. Check if the functionality can be achieved with existing packages
2. Check if native JavaScript/React can handle it
3. Only install if there's no other way
4. Document why the package is essential

### Technology Stack
- **Frontend**: 
  - React 18.x with **Vite** (JavaScript/JSX, NOT TypeScript)
  - **React Router v6** for routing
  - **TailwindCSS** for styling
  - **shadcn/ui** components (Button, Card, Form, Dialog, Table, etc.)
- **Backend**: Node.js 18.x LTS with Express.js 4.x (JavaScript, NOT TypeScript)
- **Database**: PostgreSQL 14.x with Prisma ORM
- **Authentication**: JWT with bcrypt for password hashing
- **Email**: Nodemailer 
- **File Upload**: Multer (PDFs only, max 50MB)
- **Payment**: PayMob and Fawry APIs (Egyptian Pounds)
- **External APIs**: WhatsApp Business API, Google Drive API
- **Testing**: **PlaywrightMCP** (MANDATORY for all features)
- **Hosting**: Configured for Hostinger deployment
- **NO Redis, NO TypeScript**

### Project Structure
```
sat-platform/
├── client/                 # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Reusable UI components using shadcn/ui
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── student/    # Student-specific components
│   │   │   └── public/     # Public landing page components
│   │   ├── pages/          # Page components with React Router
│   │   ├── services/       # API calls and external service integrations
│   │   ├── utils/          # Helper functions and utilities
│   │   ├── styles/         # TailwindCSS configuration and custom styles
│   │   ├── routes/         # React Router configuration
│   │   ├── App.jsx
│   │   └── main.jsx        # Vite entry point
│   ├── tailwind.config.js  # TailwindCSS configuration
│   ├── vite.config.js      # Vite configuration
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Business logic handlers
│   ├── middlewares/       # Auth, validation, error handling
│   ├── uploads/           # File storage for PDFs
│   ├── config/            # Database, email, payment configs
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema - COMPLETE SCHEMA IS HERE
│   │   └── migrations/
│   ├── app.js
│   └── package.json
├── tests/                 # Playwright tests
│   ├── e2e/              # End-to-end tests
│   ├── api/              # API tests
│   └── playwright.config.js
├── .env.example
├── .gitignore
└── README.md
```

## Database Schema Location
The complete Prisma database schema is located at: **`server/prisma/schema.prisma`**

This schema includes all models for users, students, courses, enrollments, sessions, access windows, payments, lessons, homework, tests, and enrollment requests. Use this exact schema without modifications.

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
**⚠️ ACCESS WINDOW IMPLEMENTATION:**
- Check student's access window for live courses
- Only display sessions within access window range 
- Show "Locked" indicator for inaccessible sessions
- If full access, show all sessions

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
- Detailed submission history table:
  - Assessment name, type, score, date, time taken
  - Click to view detailed attempt

### 4. Admin Portal

#### Admin Dashboard
**Frontend Specialist Tasks:**
- Build with shadcn/ui Dashboard components
- Use TailwindCSS for admin layout
- Implement React Router for admin navigation

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

##### Enrollment Management with Access Windows
**⚠️ NEW CRITICAL FEATURE:**
When approving enrollment for live courses:
1. Admin selects access type:
   - Full Access (all sessions)
   - Partial Access (custom range)
   - Late Join (from specific session)
2. For partial/late join:
   - Select start session from dropdown
   - Select end session from dropdown
   - Preview which sessions student will access
3. System creates AccessWindow record if partial
4. Payment amount adjusts based on sessions granted


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


#### Enrollment Request Flow 
1. Student clicks "Join Course" button for:
   - Live courses 
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
- Enrollment request approval/rejection notification
- Payment confirmation receipts
- Homework deadline reminders (1 day before)
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
- POST /api/auth/signup
- POST /api/auth/signin
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/logout --not implemented 

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

## Development Phases - Detailed Breakdown

### ✅ Phase 1: Setup & Foundation (COMPLETED)
- Project structure created
- PostgreSQL database configured
- Prisma schema implemented
- JWT authentication system built
- User registration and login working
- Role-based middleware implemented

### Phase 2: Frontend Foundation & Routing
**Lead: Frontend Specialist**

#### Step 2.1: Vite & React Router Setup
- [ ] Configure Vite for React development
- [ ] Set up React Router v6 with route structure
- [ ] Create route guards for protected routes
- [ ] Implement layout components (Header, Footer, Sidebar)
- [ ] **Test with PlaywrightMCP**: Navigation flows

#### Step 2.2: TailwindCSS & shadcn/ui Integration
- [ ] Configure TailwindCSS with custom theme
- [ ] Install and configure shadcn/ui
- [ ] Create component library with shadcn/ui components
- [ ] Build reusable form components
- [ ] **Test with PlaywrightMCP**: Component rendering

#### Step 2.3: Authentication UI
- [ ] Build login page with shadcn/ui Form
- [ ] Create registration form with validation
- [ ] Implement password reset flow
- [ ] Add JWT token management in frontend
- [ ] **Test with PlaywrightMCP**: Auth flows

### Phase 3: Admin Resource Management Backend
**Lead: API Engineer + Database Architect**

#### Step 3.1: Lessons Management API
- [ ] Create lessons CRUD endpoints
- [ ] Implement file upload for lesson materials
- [ ] Add Google Drive integration for videos
- [ ] Create lesson-course association endpoints
- [ ] **Test with PlaywrightMCP**: API endpoints

#### Step 3.2: Homework System API
- [ ] Build homework creation endpoint with passages
- [ ] Implement question and choices management
- [ ] Create homework-course assignment endpoints
- [ ] Add validation for homework structure
- [ ] **Test with PlaywrightMCP**: Homework CRUD

#### Step 3.3: Test System API
- [ ] Create test builder endpoints
- [ ] Implement timer and duration management
- [ ] Build test-course assignment endpoints
- [ ] Add test attempt locking mechanism
- [ ] **Test with PlaywrightMCP**: Test management

### Phase 4: Admin UI Implementation
**Lead: Frontend Specialist**

#### Step 4.1: Admin Dashboard & Navigation
- [ ] Build admin dashboard with shadcn/ui Cards
- [ ] Create admin sidebar navigation
- [ ] Implement breadcrumb navigation
- [ ] Add quick action buttons
- [ ] **Test with PlaywrightMCP**: Admin navigation

#### Step 4.2: Resource Management UI
- [ ] Create lesson management interface
- [ ] Build homework builder with drag-drop
- [ ] Implement test creation wizard
- [ ] Add resource preview functionality
- [ ] **Test with PlaywrightMCP**: Resource creation

#### Step 4.3: Student Management Interface
- [ ] Build student list with DataTable
- [ ] Create student detail view
- [ ] Implement enrollment management
- [ ] Add performance viewing interface
- [ ] **Test with PlaywrightMCP**: Student management

### Phase 5: Course System Implementation
**Lead: All Subagents Collaborate**

#### Step 5.1: Course Management Backend
**API Engineer + Database Architect**
- [ ] Create course CRUD endpoints
- [ ] Implement resource assignment APIs
- [ ] Build course publishing workflow
- [ ] Add course archiving functionality
- [ ] **Test with PlaywrightMCP**: Course APIs

#### Step 5.2: Access Windows Implementation
**⚠️ CRITICAL - Database Architect + API Engineer**
- [ ] Create access window management endpoints
- [ ] Implement session range validation
- [ ] Build access checking middleware
- [ ] Add payment calculation for partial access
- [ ] **Test with PlaywrightMCP**: Access window logic

#### Step 5.3: Course UI Components
**Frontend Specialist**
- [ ] Build course creation wizard
- [ ] Create resource assignment interface
- [ ] Implement access window selector
- [ ] Add course preview functionality
- [ ] **Test with PlaywrightMCP**: Course management UI

### Phase 6: Enrollment System
**Lead: API Engineer + Frontend Specialist**

#### Step 6.1: Enrollment Request Flow
- [ ] Create enrollment request endpoints
- [ ] Build approval/rejection workflow
- [ ] Implement email notifications
- [ ] Add enrollment validation rules
- [ ] **Test with PlaywrightMCP**: Enrollment requests

#### Step 6.2: Access Window Assignment
**⚠️ CRITICAL FEATURE**
- [ ] Build UI for access type selection
- [ ] Create session range picker
- [ ] Implement preview of accessible content
- [ ] Add price calculation display
- [ ] **Test with PlaywrightMCP**: Access window assignment

#### Step 6.3: Enrollment Management UI
- [ ] Create pending requests dashboard
- [ ] Build bulk approval interface
- [ ] Implement enrollment history view
- [ ] Add enrollment modification capability
- [ ] **Test with PlaywrightMCP**: Enrollment management

### Phase 7: Student Learning Experience
**Lead: Frontend Specialist + API Engineer**

#### Step 7.1: Student Portal Foundation
- [ ] Build student dashboard with stats
- [ ] Create course navigation system
- [ ] Implement progress tracking
- [ ] Add activity feed
- [ ] **Test with PlaywrightMCP**: Student dashboard

#### Step 7.2: Course Access Implementation
**⚠️ WITH ACCESS WINDOWS**
- [ ] Create course content viewer
- [ ] Implement session access checking
- [ ] Build locked content indicators
- [ ] Add video player integration
- [ ] **Test with PlaywrightMCP**: Content access

#### Step 7.3: Learning Interface
- [ ] Build lesson viewing page
- [ ] Create Zoom link integration
- [ ] Implement resource download
- [ ] Add bookmark functionality
- [ ] **Test with PlaywrightMCP**: Learning features

### Phase 8: Assessment System
**Lead: All Subagents Collaborate**

#### Step 8.1: Assessment Taking Backend
**API Engineer**
- [ ] Create attempt initialization endpoints
- [ ] Build answer submission APIs
- [ ] Implement auto-grading logic
- [ ] Add attempt validation
- [ ] **Test with PlaywrightMCP**: Assessment APIs

#### Step 8.2: Assessment UI Components
**Frontend Specialist**
- [ ] Build homework interface with SAT styling
- [ ] Create test interface with timer
- [ ] Implement question navigation
- [ ] Add answer review interface
- [ ] **Test with PlaywrightMCP**: Assessment UI

#### Step 8.3: Submission Management
**Database Architect + API Engineer**
- [ ] Store detailed answer records
- [ ] Implement score calculation
- [ ] Build retry mechanism
- [ ] Create submission history
- [ ] **Test with PlaywrightMCP**: Submission flow

### Phase 9: Performance Analytics
**Lead: Database Architect + Frontend Specialist**

#### Step 9.1: Analytics Backend
- [ ] Create performance calculation queries
- [ ] Build trend analysis endpoints
- [ ] Implement weak area identification
- [ ] Add comparative analytics
- [ ] **Test with PlaywrightMCP**: Analytics APIs

#### Step 9.2: Performance Dashboards
- [ ] Build student performance dashboard
- [ ] Create class analytics for admin
- [ ] Implement chart visualizations
- [ ] Add export functionality
- [ ] **Test with PlaywrightMCP**: Analytics UI

### Phase 10: Payment Integration
**Lead: API Engineer + Integration Orchestrator**

#### Step 10.1: Payment Gateway Setup
- [ ] Integrate PayMob API
- [ ] Configure Fawry integration
- [ ] Implement callback handlers
- [ ] Add payment verification
- [ ] **Test with PlaywrightMCP**: Payment flow

#### Step 10.2: Payment UI & Access Windows
**⚠️ WITH SESSION-BASED PRICING**
- [ ] Build payment selection interface
- [ ] Create payment confirmation page
- [ ] Implement receipt generation
- [ ] Add payment history view
- [ ] **Test with PlaywrightMCP**: Payment UI

### Phase 11: Communication System
**Lead: API Engineer + Integration Orchestrator**

#### Step 11.1: Email Notifications
- [ ] Configure Nodemailer templates
- [ ] Implement notification triggers
- [ ] Create email queue system
- [ ] Add email preference management
- [ ] **Test with PlaywrightMCP**: Email delivery

#### Step 11.2: WhatsApp Integration
- [ ] Configure WhatsApp Business API
- [ ] Build report generation system
- [ ] Create bulk send interface
- [ ] Implement delivery tracking
- [ ] **Test with PlaywrightMCP**: WhatsApp sending

### Phase 12: Testing & Optimization
**Lead: Integration Orchestrator**

#### Step 12.1: Comprehensive Testing
- [ ] Write Playwright E2E test suite
- [ ] Create API integration tests
- [ ] Implement load testing
- [ ] Add security testing
- [ ] Document test coverage

#### Step 12.2: Performance Optimization
- [ ] Optimize database queries
- [ ] Implement caching strategy
- [ ] Add lazy loading
- [ ] Optimize bundle size
- [ ] **Test with PlaywrightMCP**: Performance metrics

### Phase 13: Deployment & Launch
**Lead: Integration Orchestrator**

#### Step 13.1: Production Preparation
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline
- [ ] Implement monitoring
- [ ] Create backup strategy
- [ ] Prepare deployment documentation

#### Step 13.2: Hostinger Deployment
- [ ] Deploy backend to Hostinger
- [ ] Deploy frontend with Vite build
- [ ] Configure domain and SSL
- [ ] Set up database backups
- [ ] **Test with PlaywrightMCP**: Production testing

## Testing Requirements with PlaywrightMCP

### Mandatory Test Coverage
Every phase MUST include Playwright tests for:
1. **API Tests**: Test all endpoints with various scenarios
2. **UI Tests**: Test all user interactions and flows
3. **E2E Tests**: Test complete user journeys
4. **Access Window Tests**: Specifically test access restrictions
5. **Payment Tests**: Test payment flows and calculations

### Test Documentation
For each feature, document:
- Test scenarios covered
- Test results
- Any issues found and resolved
- Performance metrics

## Critical Implementation Notes

### Access Windows - Implementation Details
**⚠️ MUST IMPLEMENT - Previously Missed:**
1. **Full Access**: No AccessWindow record needed, student sees all sessions
2. **Partial Access**: AccessWindow record with startSessionId and endSessionId
3. **Late Join**: AccessWindow with startSessionId = join session, endSessionId = last session
4. **UI Requirements**:
   - Admin sees radio buttons: "Full Access", "Partial Access", "Late Join"
   - If Partial/Late selected, show session dropdowns
   - Display calculated price based on sessions
   - Show preview of what student will access

### Subagent Usage Protocol
**⚠️ MANDATORY - Use ALL Subagents:**
1. Before ANY implementation, ask: "Which subagent handles this?"
2. Consult the appropriate subagent's documentation
3. Follow their specialized patterns and best practices
4. Document in code comments which subagent's guidance was followed
5. If multiple subagents needed, coordinate between them

### Frontend Implementation with Vite + React Router + TailwindCSS
1. **Vite Configuration**: Use fast refresh and optimize build
2. **React Router**: Implement nested routes and route guards
3. **TailwindCSS**: Use utility-first approach with custom theme
4. **shadcn/ui**: Use for all form inputs, buttons, cards, dialogs, tables
5. **No TypeScript**: Use .jsx files only

## Success Criteria
- [ ] All subagents actively used and documented
- [ ] Access windows fully implemented and tested
- [ ] All features tested with PlaywrightMCP
- [ ] Frontend uses Vite + React Router + TailwindCSS + shadcn/ui
- [ ] No TypeScript used anywhere
- [ ] All phases completed with detailed testing
- the project is running on localhost:3000 everything is installed
- the server is running on port 5000 and the frontend is running on port 3000, cors is setup and working. no need to run anything just use the existing processes.
- serena onboarding has been performed