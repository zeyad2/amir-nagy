# Power Prompt for SAT & English Teaching Platform

## Initial Setup Prompt

```
I need you to build a comprehensive SAT & English teaching platform for a single instructor (Mr. Amir Nagy). This is NOT a marketplace - it's a dedicated platform for one teacher.

CRITICAL REQUIREMENTS:
1. Use JavaScript (NOT TypeScript) for both frontend and backend
2. PostgreSQL with Sequelize ORM (no Redis)
3. Nodemailer for emails (not SendGrid)
4. React frontend, Node.js/Express backend
5. JWT authentication with role-based access (admin/student only)

PROJECT STRUCTURE:
Create a monorepo with:
- /client (React app)
- /server (Node.js/Express API)
- Shared PostgreSQL database

Please reference the claude.md file for complete specifications. Start by:
1. Setting up the project structure
2. Creating the PostgreSQL database with ALL tables from the schema
3. Implementing prisma models with proper associations
4. Building the authentication system

Focus on getting the foundation right before moving to features.
```

## Phase 1: Foundation & Database

```
Set up the complete foundation for the SAT platform:

1. PROJECT INITIALIZATION:
   - Create the folder structure exactly as specified
   - Initialize package.json for both client and server
   - Set up .env.example with all required variables
   - Configure .gitignore for Node.js projects

2. DATABASE SETUP:
   Create ALL PostgreSQL tables with these EXACT specifications:
   - courses table: type ENUM must be ONLY ('live', 'recorded') - no 'self-study'
   - courses table: status ENUM must be ONLY ('active', 'archived') - no 'inactive'
   - Implement many-to-many relationships for lessons, materials, and assessments
   - Include junction tables: course_lessons, course_materials, course_assessments
   - Add student_answers table to store EVERY individual answer
   - Add enrollment_requests table (separate from enrollments)

3. prisma MODELS:
   - Create all models with proper data types
   - Define ALL associations (belongsToMany for resources)
   - Add model validations matching database constraints
   - Include timestamps on all models
   - Ensure we have on delete cascade for the needed parts
   - ensure proper indexing on relevant columns

4. AUTHENTICATION SYSTEM:
   - JWT authentication with 24-hour expiry
   - Refresh token mechanism
   - Bcrypt password hashing (min 8 chars)
   - Role-based middleware (admin, student)
   - Protected route handling

Start with this foundation. Make sure the database relationships are correct, especially the many-to-many relationships for reusable resources.
```

## Phase 2: Admin Resource Management

```
Build the admin resource management system where resources are STANDALONE and REUSABLE:

1. LESSONS MANAGEMENT:
   - CRUD API endpoints for lessons
   - Lessons are independent entities (not tied to courses)
   - Include: title, description, zoom_link, recording_url
   - Admin can create once, use in multiple courses
   - React UI with list view and create/edit forms

2. MATERIALS MANAGEMENT:
   - PDF upload system using Multer (max 10MB)
   - Store files locally in /server/uploads
   - Materials are standalone, reusable across courses
   - Include title, description, file_path
   - React UI with drag-and-drop upload

3. ASSESSMENT BUILDER:
   - Assessments are standalone entities
   - Two types: 'homework' (with retries) and 'test' (with timer)
   - Question builder with:
     * Passage text (rich text)
     * Passage image upload
     * Multiple choice questions (A, B, C, D)
     * Correct answer marking
     * Explanations for each option
   - Store questions and options in separate tables
   - React UI with SAT-style preview

4. RESOURCE LIBRARY UI:
   - Admin dashboard showing all resources
   - Search and filter capabilities
   - Usage indicators (which courses use each resource)
   - Bulk actions support

IMPORTANT: Resources must be created independently and then assigned to courses. This is NOT a one-to-many relationship.
```

## Phase 3: Course Management System

```
Implement the course system with proper resource assignment:

1. COURSE CREATION:
   - Courses have basic info: title, description, type ('live' or 'recorded'), price
   - Status can only be 'active' or 'archived'
   - Courses do NOT contain resources directly

2. RESOURCE ASSIGNMENT:
   - Implement junction tables for many-to-many relationships
   - Admin assigns existing resources to courses
   - Same lesson/assessment/material can be in multiple courses
   - Order index for resource arrangement within course
   - React UI with checkbox selection from resource libraries

3. PUBLIC COURSE PAGES:
   - List all active courses without authentication
   - Course detail page shows curriculum (locked if not enrolled)
   - "Enroll" button creates enrollment request
   - Resources visible but not accessible without enrollment

4. ENROLLMENT REQUEST SYSTEM:
   - NOT automatic except for recorded courses with online payment
   - Creates enrollment_requests table entry
   - Admin approval interface
   - Email notifications on status change
   - Only approved requests become enrollments

The key here is that resources are REUSED across courses via junction tables.
```

## Phase 4: Student Learning System

```
Build the complete student learning experience:

1. STUDENT DASHBOARD:
   - Show enrolled courses only
   - Performance metrics
   - Upcoming deadlines
   - Recent scores

2. COURSE ACCESS CONTROL:
   Critical Logic:
   - Students can access a resource if enrolled in ANY course containing it
   - After enrollment expires, students keep access to resources added BEFORE expiry
   - New resources added after expiry are not accessible
   - Implement this check properly in the API

3. ASSESSMENT TAKING:
   HOMEWORK:
   - Allow saving progress (store in localStorage)
   - Multiple attempts if configured
   - Show immediate results with explanations
   
   TESTS:
   - Implement countdown timer (display as MM:SS)
   - Auto-submit when timer reaches zero
   - No save progress option
   - Single attempt only

4. SUBMISSION STORAGE:
   CRITICAL: Store EVERY answer in student_answers table:
   - attempt_id (links to assessment_attempts)
   - question_id
   - selected_option_id (which specific option they chose)
   - is_correct
   - marks_awarded
   - time_spent_seconds (if tracking)
   
   This enables detailed performance analysis later.

5. SAT FORMATTING:
   Apply these exact styles for assessments:
   - Font: Times New Roman, 11pt
   - Line height: 1.5
   - Passage padding: 0 40px
   - Question numbering: 1, 2, 3...
   - Option labels: A), B), C), D)
```

## Phase 5: Payment & Communication

```
Implement payment processing and communication systems:

1. PAYMENT INTEGRATION:
   - PayMob and Fawry for Egyptian market (EGP currency)
   - Different flows:
     * Recorded course + online payment = automatic enrollment
     * Live course = requires admin approval even after payment
     * Offline payment = always requires admin approval
   
2. EMAIL SYSTEM (Nodemailer):
   All these are AUTOMATED:
   - Registration welcome
   - Enrollment request confirmation
   - Enrollment approval/rejection
   - Payment receipts
   - Class reminders (24 hours before)
   - Homework deadline reminders
   - Test score notifications
   
3. WHATSAPP INTEGRATION:
   MANUAL ONLY - Never automatic:
   - Admin has "Send Report" button in dashboard
   - Select course → Generate plain text report → Send
   - Report format:
     * Student name and course
     * Attendance summary
     * Homework scores
     * Test scores
     * Overall performance
   - Log all sends in whatsapp_reports_log table
   
4. CRITICAL COST CONTROL:
   - WhatsApp is expensive - ONLY manual bulk sends
   - All routine notifications via email (free)
   - Parent phone for WhatsApp, parent email for emails
```

## Phase 6: Analytics & Reports

```
Build comprehensive analytics without PDF generation:

1. STUDENT PERFORMANCE DASHBOARD:
   - View own performance only
   - Score trends (line chart using Chart.js)
   - Assessment history with detailed view
   - Question-level performance (which questions they got wrong)
   - Time analysis

2. ADMIN ANALYTICS:
   - View all students' performance
   - Filter by course, date range, student
   - Question analysis (which questions are hardest)
   - Class averages and distributions
   - Individual student deep-dive:
     * Every submission
     * Every answer to every question
     * Time spent per assessment
     * Attendance records

3. PARENT ACCESS:
   - Parents use student credentials
   - See same dashboard as student
   - No separate parent accounts

4. NO PDF REPORTS:
   - Everything is dashboard-based
   - WhatsApp reports are plain text only
   - Focus on interactive web analytics
```

## Testing & Deployment Prompt

```
Complete testing and prepare for deployment:

1. CRITICAL TESTING PATHS:
   - Many-to-many resource assignment working correctly
   - Enrollment request → approval → access flow
   - Assessment submission stores every answer
   - Access control respects enrollment expiry rules
   - Timer auto-submits tests
   - Payment → automatic enrollment (recorded courses only)

2. PERFORMANCE OPTIMIZATION:
   - Add indexes on foreign keys
   - Implement pagination (10-20 items per page)
   - Lazy load course content
   - Optimize images

3. SECURITY:
   - SQL injection prevention (Sequelize parameterized queries)
   - XSS protection
   - File upload validation (PDF only, 10MB max)
   - Rate limiting on auth endpoints
   - CORS configuration

4. DEPLOYMENT PREP:
   - Environment variables for production
   - Build scripts for React
   - PM2 configuration for Node.js
   - Nginx configuration
   - Database migration scripts
   - Backup strategy

5. VERIFY BUSINESS RULES:
   - Resources are reusable across courses ✓
   - Students keep old materials after expiry ✓
   - WhatsApp is manual only ✓
   - Every answer is stored ✓
   - Auto-enrollment only for recorded+online payment ✓
```

## Common Pitfalls to Avoid

```
AVOID THESE MISTAKES:

1. DON'T create resources inside courses - they're standalone
2. DON'T use TypeScript - use JavaScript ES6+
3. DON'T add Redis - not needed
4. DON'T auto-send WhatsApp messages - manual only
5. DON'T create PDF reports - dashboard only
6. DON'T forget to store individual answer selections
7. DON'T make all enrollments automatic - most need approval
8. DON'T use 'self-study' or 'inactive' enums - they don't exist
9. DON'T tie resources to single courses - they're reusable
10. DON'T forget SAT formatting for assessments

REMEMBER:
- This is for ONE instructor only (Mr. Amir)
- Resources are created once, used many times
- Parents get WhatsApp reports manually
- Students see detailed performance analytics
- Every single answer must be stored for analysis
```

## Quick Debug Checklist

```
If something isn't working, check:

□ Are junction tables properly set up for many-to-many?
□ Is enrollment_requests separate from enrollments?
□ Are you storing selected_option_id, not just correct/incorrect?
□ Is the timer auto-submitting tests?
□ Are resources showing in multiple courses?
□ Is access control checking enrollment expiry correctly?
□ Are emails sending automatically but WhatsApp manual?
□ Is payment auto-enrolling ONLY for recorded courses?
□ Are enums exactly 'live'/'recorded' and 'active'/'archived'?
□ Is SAT formatting applied to assessment display?
```

## Final Build Command

```
After everything is complete:

1. Run database migrations
2. Seed with sample data:
   - Create admin user
   - Create 2-3 sample courses
   - Create 5-10 lessons
   - Create 3-5 assessments with questions
   - Create sample materials
   - Assign resources to multiple courses to test reusability

3. Test critical user flows:
   - Student browses → requests enrollment → admin approves → student learns
   - Admin creates resource → assigns to multiple courses → students access
   - Student takes test → timer expires → auto-submit → see results
   - Admin sends WhatsApp report → parents receive → check log

4. Verify all associations work:
   - Can a lesson appear in multiple courses? ✓
   - Can students see their individual answers? ✓
   - Do expired students keep old materials? ✓

This platform should be production-ready for 500-1000 students.
```

---

## THE MASTER PROMPT TO START EVERYTHING:

```
I need you to build a complete SAT & English teaching platform following the specifications in claude.md. This is a single-instructor platform for Mr. Amir Nagy with these critical requirements:

1. JavaScript only (no TypeScript)
2. Many-to-many relationships for resources (lessons, assessments, materials are reusable)
3. Complete answer storage for every question attempt
4. Manual WhatsApp, automated email
5. Enrollment requests require approval (except recorded courses with online payment)

Start by creating the project structure, then build the database with correct relationships, then authentication, then move through each feature systematically. 

Reference claude.md for complete details, but remember these key points:
- Resources are standalone and reusable
- Store every answer selection
- WhatsApp is manual only
- Course enums are only 'live'/'recorded' and 'active'/'archived'

Let's begin with the foundation. Create the project structure and database.
```
