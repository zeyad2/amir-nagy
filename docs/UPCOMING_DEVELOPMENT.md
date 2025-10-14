# Upcoming Development - Clear Roadmap

**Last Updated:** October 13, 2025
**Current Status:** Phase 10-11 Complete (75%), Working on Phase 12 (Public Pages)
**Priority:** Public Pages → Email Notifications → Sessions/Attendance → Analytics → WhatsApp → Payment

---

## ⚠️ CRITICAL: Testing Requirements for ALL Phases

### Testing Is Mandatory

**Every phase MUST include:**

1. **Playwright E2E Tests** - Test the complete user flow
   - Happy path (feature works correctly)
   - Error cases (handles failures gracefully)
   - Edge cases (empty data, max values, etc.)
   - Mobile viewport (375px width)
   - Desktop viewport (1280px+ width)

2. **Test-First Approach**
   - Write test BEFORE building feature (RED)
   - Build feature until test passes (GREEN)
   - Refactor if needed (REFACTOR)

3. **Test Files Location**
   - All tests in: `tests/` directory at project root
   - File naming: `feature-name.spec.js`
   - Example: `tests/course-learning.spec.js`

4. **Running Tests**
   ```bash
   # All tests
   npm test

   # Specific test
   npx playwright test tests/feature-name.spec.js

   # With browser visible
   npx playwright test --headed

   # Mobile viewport
   npx playwright test --project="Mobile Chrome"

   # Debug mode
   npx playwright test --debug
   ```


6. **Before Marking Phase Complete**
   - ✅ All Playwright tests passing
   - ✅ Tested on mobile viewport
   - ✅ Tested on desktop viewport
   - ✅ Error cases tested
   - ✅ Edge cases tested
   - ✅ All tests documented

---

## 🎯 Development Priorities

### Critical Path (MVP Completion)
1. **Student Learning Interface** - Students can't use the platform without this
2. **Assessment Taking UI** - Core functionality for homework and tests
3. **Public Pages** - Students can't discover or enroll without this
4. **Email Notifications** - Essential for communication

### Revenue Generation
5. **Payment Integration** - Required to accept payments

### Enhancement
6. **Analytics & Reports** - Performance tracking
7. **WhatsApp Integration** - Parent communication
8. **Advanced Features** - Nice-to-have improvements

---

## ✅ PHASE 10: Student Course Learning (100% COMPLETE)

**Current Status:** 100% Complete
**Priority:** ✅ COMPLETE
**Test File:** `tests/student-assessments.spec.js` (includes course learning page tests)

### Backend (✅ Complete)
- ✅ Course access status endpoint
- ✅ Accessible sessions endpoint
- ✅ Session content validation
- ✅ Access window checking

### Frontend (✅ Complete)
- ✅ CourseLearnPage fully functional
- ✅ Tabbed interface (Lessons, Homework, Tests)
- ✅ Lesson list with video display
- ✅ Homework list with due dates and start buttons
- ✅ Tests list with due dates and start buttons
- ✅ Navigation to assessments working
- ✅ Mobile responsive design

**Status:** Ready for production use. All features working correctly.

### Legacy Tasks (All Complete - Archive)

#### Task 10.1: Write Playwright Test (TEST-FIRST)
**File:** `tests/course-learning.spec.js`

**Create comprehensive test covering:**
- [ ] Login as student
- [ ] Navigate to enrolled course
- [ ] Verify course content tabs (Lessons, Homework, Tests)
- [ ] Click on lesson → video player loads
- [ ] Click on homework → navigates to assessment page
- [ ] Click on test → navigates to assessment page
- [ ] Verify locked content shows lock icon
- [ ] Verify accessible content is clickable
- [ ] Test on mobile viewport (375px)
- [ ] Test on desktop viewport (1280px)



#### Task 10.2: Enhanced Course Learning Page
**File:** `client/src/pages/student/CourseLearnPage.jsx`

**Requirements:**
- [ ] Course navigation sidebar showing:
  - [ ] Lessons list with completion checkmarks
  - [ ] Homework section with due dates
  - [ ] Tests section with due dates
  - [ ] Lock icons for inaccessible content
- [ ] Main content area with:
  - [ ] Video player for current lesson
  - [ ] "Start" buttons for assessments
  - [ ] Progress indicator
- [ ] Responsive design for mobile

**Acceptance Criteria:**
- Student can see all course content organized by type
- Locked content clearly indicated
- One-click navigation to lessons/assessments
- Mobile-friendly interface

**Test After Implementation:**
```bash
# Test should now PASS
npx playwright test tests/course-learning.spec.js
```

#### Task 10.3: Lesson Viewer Enhancement
**File:** `client/src/components/LessonViewer.jsx`

**Requirements:**
- [ ] Embed Google Drive video player
- [ ] Full-screen video option
- [ ] Video completion tracking
- [ ] Next lesson navigation
- [ ] Bookmark/notes feature (optional)

**Acceptance Criteria:**
- Videos play smoothly from Google Drive
- Progress saved automatically
- Easy navigation between lessons

**Add to test:**
```javascript
test('should play video from Google Drive', async ({ page }) => {
  await page.goto('/student/courses/1')
  await page.click('text=Lesson 1')

  // Wait for video iframe
  const iframe = page.frameLocator('iframe[src*="drive.google.com"]')
  await expect(iframe.locator('video')).toBeVisible()
})
```

#### Task 10.4: Content Access Validation
**Integration Task**

**Requirements:**
- [ ] Check access before showing content
- [ ] Display appropriate messages for locked content
- [ ] Redirect unauthorized access attempts
- [ ] Show access window information for partial access

**Acceptance Criteria:**
- Students only see content they have access to
- Clear messaging when content is locked
- Access windows enforced correctly

**Add to test:**
```javascript
test('should block access to locked content', async ({ page }) => {
  await page.goto('/student/courses/1')

  // Try to access locked lesson
  const lockedLesson = page.locator('text=Locked').first()
  await expect(lockedLesson).toBeVisible()

  // Should not be clickable or show lock icon
  await expect(page.locator('svg[data-icon="lock"]')).toBeVisible()
})
```

### Testing Tasks

#### Task 10.5: Run All Tests
**Before marking phase complete:**

```bash
# Run all course learning tests
npx playwright test tests/course-learning.spec.js

# Test on mobile
npx playwright test --project="Mobile Chrome" tests/course-learning.spec.js

# Test on desktop
npx playwright test --project="chromium" tests/course-learning.spec.js

# All tests must pass ✅
```

### Documentation Tasks

#### Task 10.6: Update Documentation
- [ ] Update `docs/IMPLEMENTATION_STATUS.md` - mark Phase 10 as 100% complete
- [ ] Update `docs/UPCOMING_DEVELOPMENT.md` - check off all Phase 10 tasks
- [ ] Add component documentation if needed
- [ ] Document any new patterns discovered

### Phase 10 Complete Checklist

Before moving to next phase, verify:
- ✅ All frontend tasks complete
- ✅ Playwright test file created
- ✅ All tests passing
- ✅ Tested on mobile viewport
- ✅ Tested on desktop viewport
- ✅ Error cases tested
- ✅ Documentation updated
- ✅ Committed with clear message

---

## ✅ PHASE 11: Assessment Taking UI (95% COMPLETE)

**Current Status:** 95% Complete
**Priority:** ✅ Nearly Complete
**Estimated Effort:** Minor polish only (0.5 days)
**Test File:** `tests/student-assessments.spec.js` ✅ (Comprehensive tests exist)

### Backend (✅ Complete)
- ✅ Start assessment endpoint
- ✅ Get attempt status
- ✅ Submit assessment
- ✅ Get submission details
- ✅ Auto-grading logic

### Frontend (✅ 95% Complete)

**All Major Features Implemented:**
- ✅ AssessmentPage with full state management
- ✅ Timer component with countdown and auto-submit
- ✅ Question navigation panel
- ✅ Passage rendering with images
- ✅ Question cards with SAT-style formatting
- ✅ Choice buttons with cross-out elimination
- ✅ Answer persistence in localStorage
- ✅ Score display after submission
- ✅ Answer review interface
- ✅ Confirmation page for timed tests
- ✅ Mobile responsive design
- ✅ All error handling
- ✅ Loading states
- ✅ Toast notifications

**All Components Built:**
- ✅ `client/src/pages/student/AssessmentPage.jsx`
- ✅ `client/src/components/student/AssessmentTimer.jsx`
- ✅ `client/src/components/student/QuestionNavigation.jsx`
- ✅ `client/src/components/student/PassageRenderer.jsx`
- ✅ `client/src/components/student/QuestionCard.jsx`
- ✅ `client/src/components/student/ChoiceButton.jsx`
- ✅ `client/src/components/student/ScoreDisplay.jsx`
- ✅ `client/src/components/student/AnswerReview.jsx`

### Testing (✅ Complete)

**Comprehensive Playwright Tests Exist:**
File: `tests/student-assessments.spec.js`

Coverage includes:
- ✅ Course learning page navigation
- ✅ Homework flow (untimed)
- ✅ Test flow (timed with timer)
- ✅ Answer persistence
- ✅ Cross-out elimination
- ✅ Results and review
- ✅ Question navigation
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ All edge cases

**Run tests:**
```bash
npx playwright test tests/student-assessments.spec.js
# All tests passing ✅
```

### Remaining Minor Enhancements (5%)

#### Optional Future Tasks (Low Priority)

Task 11.1: Add Question Explanations (Future)
- [ ] Add explanation field to question schema
- [ ] Display explanations in review mode
- [ ] Admin UI to add explanations

Task 11.2: Keyboard Shortcuts (Future)
- [ ] Arrow keys for navigation
- [ ] Number keys for answer selection
- [ ] Enter to submit

Task 11.3: Accessibility (Future)
- [ ] Add ARIA labels
- [ ] Screen reader support
- [ ] Keyboard-only navigation

Task 11.4: Analytics (Future)
- [ ] Track time per question
- [ ] Track answer changes
- [ ] Send analytics to backend

**Note:** These are nice-to-have enhancements, not MVP requirements.

### Frontend Tasks (Legacy - Already Complete)

#### Task 11.1: Assessment Interface - Question Display
**File:** `client/src/pages/student/AssessmentPage.jsx`

**Requirements:**
- [ ] Passage display area (scrollable)
- [ ] Question text display
- [ ] Four multiple-choice options (A, B, C, D)
- [ ] Radio button selection
- [ ] Clear selected answer indicator
- [ ] SAT-style formatting

**Acceptance Criteria:**
- Clean, readable passage display
- Clear question and answer layout
- Easy answer selection
- Matches SAT visual style

#### Task 11.2: Assessment Interface - Navigation
**Create:** `client/src/components/student/AssessmentNavigation.jsx`

**Requirements:**
- [ ] Question number grid (1, 2, 3, ...)
- [ ] Visual indicators:
  - [ ] Current question (highlighted)
  - [ ] Answered questions (checked/filled)
  - [ ] Unanswered questions (empty)
- [ ] Click to jump to any question
- [ ] "Previous" and "Next" buttons
- [ ] Sticky/fixed position

**Acceptance Criteria:**
- Easy navigation between questions
- Clear visual feedback on progress
- Works on mobile and desktop

#### Task 11.3: Assessment Timer (Tests Only)
**Create:** `client/src/components/student/AssessmentTimer.jsx`

**Requirements:**
- [ ] Countdown timer display (MM:SS)
- [ ] Timer starts on assessment load
- [ ] Warning at 5 minutes remaining (color change/alert)
- [ ] Auto-submit when timer reaches 00:00
- [ ] Timer visible at all times (sticky header)
- [ ] Only shown for timed assessments

**Acceptance Criteria:**
- Accurate countdown
- Clear visual warnings
- Automatic submission works
- No timer for untimed homework

#### Task 11.4: Save Progress (Homework Only)
**Feature Addition**

**Requirements:**
- [ ] "Save Progress" button (homework only)
- [ ] Save answers to local storage or API
- [ ] Auto-save every 30 seconds
- [ ] Resume from saved state
- [ ] Clear saved data after submission

**Acceptance Criteria:**
- Students can leave and return to homework
- Progress not lost on page refresh
- Auto-save works silently

#### Task 11.5: Submission Flow
**Create:** `client/src/components/student/AssessmentSubmission.jsx`

**Requirements:**
- [ ] "Submit" button with confirmation dialog
- [ ] Warning if unanswered questions exist
- [ ] Loading state during submission
- [ ] Immediate score display after submission
- [ ] Redirect to review page

**Acceptance Criteria:**
- Clear confirmation before final submit
- User warned about unanswered questions
- Smooth submission experience

#### Task 11.6: Review Interface
**Create:** `client/src/pages/student/AssessmentReview.jsx`

**Requirements:**
- [ ] Overall score display (X/Y, percentage)
- [ ] Question-by-question breakdown:
  - [ ] Question text
  - [ ] Student's answer (highlighted)
  - [ ] Correct answer (highlighted in green)
  - [ ] Checkmark if correct, X if incorrect
- [ ] Filter: All/Correct/Incorrect
- [ ] Back to course button

**Acceptance Criteria:**
- Clear visual feedback on performance
- Easy to see mistakes
- Helpful for learning from errors

---

## 📋 PHASE 12: Complete Public Pages

**Current Status:** 40% Complete
**Priority:** 🔥 CRITICAL
**Estimated Effort:** 2-3 days
**Test File:** `tests/public-pages.spec.js`

### Backend (✅ Complete)
- ✅ Get published courses (`GET /api/courses`)
- ✅ Get course details (`GET /api/courses/:id`)
- ✅ Optional auth for enrollment status

### Frontend Tasks

#### Task 12.1: Write Playwright Test (TEST-FIRST)
**File:** `tests/public-pages.spec.js`

**Create comprehensive test covering:**
- [ ] Landing page loads without authentication
- [ ] Hero section visible
- [ ] Browse courses button works
- [ ] Featured courses display
- [ ] Testimonials visible
- [ ] FAQ accordion works
- [ ] Navigate to courses page
- [ ] Course cards display correctly
- [ ] Filter by type works
- [ ] Search functionality works
- [ ] Click course → navigate to detail page
- [ ] Course detail shows all information
- [ ] "Sign Up to Enroll" for unauthenticated users
- [ ] Login → "Request Enrollment" or "Pay Now" appears
- [ ] Test on mobile viewport (375px)
- [ ] Test on desktop viewport (1280px)

**Expected:** Test should FAIL initially (features not complete yet)

**Run with:**
```bash
npx playwright test tests/public-pages.spec.js --headed
```

#### Task 12.2: Landing Page Enhancement
**File:** `client/src/pages/LandingPage.jsx`

**Requirements:**
- [ ] Hero section:
  - [ ] Professional header with Mr. Amir's photo
  - [ ] Compelling headline
  - [ ] Call-to-action button ("Browse Courses")
  - [ ] Background image or gradient
- [ ] Featured courses section (3-4 cards)
  - [ ] Course thumbnails
  - [ ] Course titles
  - [ ] "View Details" buttons
- [ ] Student success stories/testimonials (3-5 cards)
  - [ ] Student names
  - [ ] Testimonial text
  - [ ] Before/after scores
- [ ] FAQ section (accordion)
  - [ ] Common questions about enrollment
  - [ ] Payment information
  - [ ] Course structure
- [ ] Contact information footer
  - [ ] Email, phone
  - [ ] Social media links

**Acceptance Criteria:**
- Professional, modern design
- Engaging and persuasive
- Mobile responsive
- Fast loading
- All images optimized

**Test After Implementation:**
```bash
# Test should now PASS
npx playwright test tests/public-pages.spec.js
```

**Add specific test:**
```javascript
test('should display landing page sections', async ({ page }) => {
  await page.goto('/')

  // Hero section
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('button:has-text("Browse Courses")')).toBeVisible()

  // Featured courses
  await expect(page.locator('text=/Featured Courses/i')).toBeVisible()

  // Testimonials
  await expect(page.locator('text=/Testimonials/i')).toBeVisible()

  // FAQ
  await expect(page.locator('text=/FAQ/i')).toBeVisible()
})
```

#### Task 12.3: Courses Page Enhancement
**File:** `client/src/pages/CoursesPage.jsx`

**Requirements:**
- [ ] Course grid/list view
- [ ] Each course card shows:
  - [ ] Thumbnail
  - [ ] Title and short description
  - [ ] Type (Live/Finished badge)
  - [ ] Price
  - [ ] "View Details" button
- [ ] Filter by type (All/Live/Finished)
- [ ] Sort options (Newest, Price)
- [ ] Search functionality (search by title/description)
- [ ] Empty state (when no courses match)
- [ ] Loading state

**Acceptance Criteria:**
- All published courses visible
- Easy browsing and filtering
- Clear course information
- Professional card design
- Responsive grid (1 column mobile, 2 tablet, 3 desktop)

**Add specific test:**
```javascript
test('should filter courses by type', async ({ page }) => {
  await page.goto('/courses')

  // Should show all courses initially
  const allCourses = page.locator('[data-testid="course-card"]')
  const initialCount = await allCourses.count()

  // Filter by "Live"
  await page.click('button:has-text("Live")')

  // Should show only live courses
  const liveCourses = page.locator('[data-testid="course-card"]')
  const liveCount = await liveCourses.count()
  expect(liveCount).toBeLessThanOrEqual(initialCount)

  // Each visible course should have "Live" badge
  await expect(page.locator('text=Live').first()).toBeVisible()
})
```

#### Task 12.4: Course Detail Page Enhancement
**File:** `client/src/pages/CourseDetailPage.jsx`

**Requirements:**
- [ ] Course header (thumbnail, title, type, price)
- [ ] Full description
- [ ] Course curriculum preview (locked):
  - [ ] Lessons list (titles only)
  - [ ] Homework list (titles only)
  - [ ] Tests list (titles only)
  - [ ] Lock icons indicating "Enroll to access"
  - [ ] Item counts (e.g., "10 Lessons", "5 Homework", "3 Tests")
- [ ] Instructor information (Mr. Amir's bio)
- [ ] Enrollment buttons (conditional):
  - [ ] If not logged in: "Sign Up to Enroll" → /register
  - [ ] If logged in but not enrolled:
    - [ ] Finished courses: "Pay Now" OR "Request Enrollment"
    - [ ] Live courses: "Request Enrollment"
  - [ ] If enrolled: "Go to Course" → /student/courses/:id

**Acceptance Criteria:**
- Complete course information visible
- Clear enrollment call-to-action
- Different buttons based on course type and auth status
- Curriculum preview (but content locked)
- Professional layout

**Add specific tests:**
```javascript
test('should show Sign Up button for unauthenticated users', async ({ page }) => {
  await page.goto('/courses/1')
  await expect(page.locator('button:has-text("Sign Up to Enroll")')).toBeVisible()
})

test('should show enrollment options for authenticated users', async ({ page }) => {
  // Login first
  await page.goto('/login')
  await page.fill('input[type="email"]', 'student@test.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')

  // Navigate to course detail
  await page.goto('/courses/1')

  // Should see enrollment button (not Sign Up)
  await expect(
    page.locator('button:has-text("Request Enrollment"), button:has-text("Pay Now")')
  ).toBeVisible()
})

test('should show Go to Course button for enrolled students', async ({ page }) => {
  // Login as enrolled student
  await page.goto('/login')
  await page.fill('input[type="email"]', 'enrolled@test.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')

  // Navigate to enrolled course
  await page.goto('/courses/1')

  // Should see "Go to Course"
  await expect(page.locator('button:has-text("Go to Course")')).toBeVisible()
})
```

### Testing Tasks

#### Task 12.5: Run All Tests
**Before marking phase complete:**

```bash
# Run all public pages tests
npx playwright test tests/public-pages.spec.js

# Test on mobile
npx playwright test --project="Mobile Chrome" tests/public-pages.spec.js

# Test on desktop
npx playwright test --project="chromium" tests/public-pages.spec.js

# All tests must pass ✅
```

### Documentation Tasks

#### Task 12.6: Update Documentation
- [ ] Update `docs/IMPLEMENTATION_STATUS.md` - mark Phase 12 as 100% complete
- [ ] Update `docs/UPCOMING_DEVELOPMENT.md` - check off all Phase 12 tasks
- [ ] Add screenshots to documentation
- [ ] Document public page patterns

### Phase 12 Complete Checklist

Before moving to next phase, verify:
- ✅ All frontend tasks complete
- ✅ Playwright test file created
- ✅ All tests passing
- ✅ Tested on mobile viewport
- ✅ Tested on desktop viewport
- ✅ Unauthenticated user flow tested
- ✅ Authenticated user flow tested
- ✅ Enrolled student flow tested
- ✅ Documentation updated
- ✅ Committed with clear message

---

---

## 📋 PHASE 13: Email Notification System

**Current Status:** 0% Complete
**Priority:** 🔥 CRITICAL (After Public Pages)
**Estimated Effort:** 2 days
**Test:** Manual testing + backend integration tests

### Task 13.1: Email Service Setup
**File:** `server/services/email.service.js`

**Requirements:**
- [ ] Configure Nodemailer with Gmail/SMTP
- [ ] Create email template engine
- [ ] Create base email template (HTML)
- [ ] Error handling and retry logic
- [ ] Email queue system (optional but recommended)

**Acceptance Criteria:**
- Emails send successfully
- Professional HTML templates
- Error handling in place

### Task 13.2: Email Templates
**Directory:** `server/templates/emails/`

**Templates to Create:**
- [ ] `welcome.html` - Welcome email after registration
- [ ] `enrollment-request-confirmation.html` - Confirms request submitted
- [ ] `enrollment-approved.html` - Enrollment approved notification
- [ ] `enrollment-rejected.html` - Enrollment rejected notification
- [ ] `payment-confirmation.html` - Payment receipt
- [ ] `password-reset.html` - Password reset link
- [ ] `session-reminder.html` - Upcoming session reminder
- [ ] `homework-reminder.html` - Homework due soon
- [ ] `score-notification.html` - Assessment score available

**Acceptance Criteria:**
- Professional design
- Mobile responsive
- All necessary information included
- Branded with platform logo

### Task 13.3: Email Triggers
**Integration Points:**

**Registration:**
```javascript
// In auth.controller.js - after signup
await emailService.sendWelcomeEmail(user.email, user.student.firstName);
```

**Enrollment Request:**
```javascript
// After request created
await emailService.sendEnrollmentRequestConfirmation(student, course);
```

**Enrollment Approval/Rejection:**
```javascript
// After admin action
await emailService.sendEnrollmentApproved(student, course);
// OR
await emailService.sendEnrollmentRejected(student, course, reason);
```

**Assessment Submission:**
```javascript
// After submission
await emailService.sendScoreNotification(student, assessment, score);
```

**Acceptance Criteria:**
- Emails sent automatically on events
- Async/non-blocking
- Failures logged but don't break flow

---

---

## 📋 PHASE 14: Sessions & Attendance System

**Current Status:** 0% Complete
**Priority:** 🔥 HIGH (Required for Live Courses)
**Estimated Effort:** 3-4 days
**Test File:** `tests/admin-sessions.spec.js`, `tests/student-attendance.spec.js`

**Detailed Documentation:** See `docs/PHASE_14_SESSIONS_ATTENDANCE.md`

### Overview

Sessions track live class meetings and attendance for live courses. This is completely separate from Lessons (recorded video content).

### Phase 14A: Basic Session Management
**Single Focus:** Create and list sessions

**Backend Tasks:**
- [ ] Create session endpoint (`POST /api/admin/courses/:courseId/sessions`)
  - Validate course is "live" type
  - Required fields: date (DateTime)
  - Optional fields: title (String)
- [ ] List sessions endpoint (`GET /api/admin/courses/:courseId/sessions`)
  - Return sessions ordered by date
  - Include attendance counts

**Frontend Tasks:**
- [ ] Session form component (date/time picker, optional title)
- [ ] Sessions list UI in CourseDetailsPage (only for live courses)
- [ ] Add "Sessions" tab to admin course details

**Playwright MCP Testing:**
- Navigate to live course details
- Click "Add Session" button
- Fill date and title
- Submit and verify session appears in list

**Acceptance Criteria:**
- Admin can create sessions for live courses only
- Sessions list displays with dates
- Mobile responsive

### Phase 14B: Session CRUD Operations
**Single Focus:** Update and delete sessions

**Backend Tasks:**
- [ ] Update session endpoint (`PUT /api/admin/sessions/:id`)
- [ ] Delete session endpoint (`DELETE /api/admin/sessions/:id`)
- [ ] Get session details endpoint (`GET /api/admin/sessions/:id`)

**Frontend Tasks:**
- [ ] Edit session button and modal
- [ ] Delete session with confirmation
- [ ] Show validation errors

**Acceptance Criteria:**
- Admin can edit session date/title
- Admin can delete sessions (with confirmation)
- Proper error handling

### Phase 14C: Attendance Marking
**Single Focus:** Bulk attendance marking for sessions

**Backend Tasks:**
- [ ] Bulk attendance marking endpoint (`POST /api/admin/sessions/:id/attendance`)
  - Accept array of {studentId, status: 'present'|'absent'}
  - Upsert attendance records
- [ ] Get session attendance endpoint (`GET /api/admin/sessions/:id/attendance`)
  - Return list of enrollments with attendance status

**Frontend Tasks:**
- [ ] Attendance marking UI for sessions
- [ ] List all enrolled students
- [ ] Checkbox/toggle for present/absent
- [ ] Save all button
- [ ] Visual indicators for marked attendance

**Acceptance Criteria:**
- Admin can mark attendance for all students at once
- Present/absent clearly indicated
- Attendance saves successfully

### Phase 14D: Student Attendance View
**Single Focus:** Students view their attendance history

**Backend Tasks:**
- [ ] Get student attendance endpoint (`GET /api/student/attendance`)
  - Filter by studentId from auth
  - Include session date, title, status
  - Group by course
- [ ] Get student attendance percentage endpoint (`GET /api/student/attendance/summary`)

**Frontend Tasks:**
- [ ] Attendance history page for students
- [ ] Table showing session, date, status
- [ ] Attendance percentage per course
- [ ] Filter by course

**Acceptance Criteria:**
- Students can view their attendance history
- Attendance percentage calculated correctly
- Mobile responsive

### Phase 14E: Attendance Reports & Analytics
**Single Focus:** Admin reports and exports

**Backend Tasks:**
- [ ] Get attendance report endpoint (`GET /api/admin/courses/:courseId/attendance/report`)
  - Return attendance matrix (students × sessions)
  - Include percentages per student
- [ ] Export attendance data endpoint (`GET /api/admin/courses/:courseId/attendance/export`)
  - Return CSV format

**Frontend Tasks:**
- [ ] Attendance report page
- [ ] Attendance matrix table
- [ ] Export to CSV button
- [ ] Filter by date range

**Acceptance Criteria:**
- Admin can view attendance reports
- Export functionality works
- Clear visualization of attendance patterns

---

## 📋 PHASE 15: Analytics & Reports

**Current Status:** 0% Complete
**Priority:** MEDIUM
**Estimated Effort:** 3-4 days
**Test File:** `tests/admin-analytics.spec.js`

### Task 14.1: Payment Model & Service
**Files:**
- `server/models/` (already exists via Prisma)
- `server/services/payment.service.js`

**Requirements:**
- [ ] PayMob API integration
- [ ] Fawry API integration
- [ ] Payment initiation logic
- [ ] Callback/webhook handling
- [ ] Payment verification
- [ ] Session-based pricing calculation

**Acceptance Criteria:**
- Payments process successfully
- Callbacks handled correctly
- Failed payments logged

### Task 14.2: Payment Endpoints
**File:** `server/routes/payment.routes.js`

**Endpoints to Create:**
- [ ] `POST /api/payments/initiate` - Start payment
- [ ] `POST /api/payments/paymob/callback` - PayMob webhook
- [ ] `POST /api/payments/fawry/callback` - Fawry webhook
- [ ] `GET /api/payments/:id/status` - Check payment status
- [ ] `GET /api/payments/history` - User payment history

**Acceptance Criteria:**
- All endpoints functional
- Webhooks verified with HMAC
- Secure payment flow

### Task 14.3: Payment UI
**Files:**
- `client/src/pages/PaymentPage.jsx`
- `client/src/components/PaymentMethodSelector.jsx`

**Requirements:**
- [ ] Payment method selection (PayMob/Fawry)
- [ ] Price display with breakdown
- [ ] Payment form
- [ ] Redirect to payment gateway
- [ ] Return handling (success/failure)
- [ ] Payment confirmation page
- [ ] Payment history view

**Acceptance Criteria:**
- Smooth payment flow
- Clear pricing information
- Success/failure handled gracefully
- Receipt/confirmation provided

---

### Task 15.1: Student Performance Analytics
**File:** `client/src/pages/student/PerformancePage.jsx`

**Requirements:**
- [ ] Overall statistics cards:
  - [ ] Average score across all assessments
  - [ ] Total assessments completed
  - [ ] Current streak
- [ ] Score trend line chart (Chart.js or Recharts)
- [ ] Performance by assessment type (bar chart)
- [ ] Weak areas identification
- [ ] Detailed submission history table

**Acceptance Criteria:**
- Clear visual analytics
- Interactive charts
- Helpful insights

### Task 15.2: Admin Reports
**File:** `client/src/pages/admin/AdminReports.jsx`

**Requirements:**
- [ ] Class performance overview
- [ ] Student comparison charts
- [ ] Question-level analysis (which questions students struggle with)
- [ ] Export to CSV/PDF
- [ ] Filter by course, date range, student

**Acceptance Criteria:**
- Comprehensive reporting
- Export functionality works
- Useful for instructional decisions

---

---

## 📋 PHASE 16: WhatsApp Integration

**Current Status:** 0% Complete
**Priority:** MEDIUM (Parent Communication)
**Estimated Effort:** 2 days
**Test:** Manual testing with real WhatsApp API

### Task 16.1: WhatsApp Service
**File:** `server/services/whatsapp.service.js`

**Requirements:**
- [ ] WhatsApp Business API integration
- [ ] Message sending functionality
- [ ] Delivery tracking
- [ ] Bulk messaging by course
- [ ] Rate limiting

**Acceptance Criteria:**
- Messages send successfully
- Delivery status tracked
- Bulk sending works

### Task 16.2: Report Generator
**File:** `server/services/reportGenerator.service.js`

**Requirements:**
- [ ] Weekly performance report template
- [ ] Attendance report template
- [ ] Test results report template
- [ ] Plain text formatting (WhatsApp compatible)

**Acceptance Criteria:**
- Reports format correctly
- All necessary data included
- Readable on mobile

### Task 16.3: WhatsApp UI
**File:** `client/src/components/admin/WhatsAppReportSender.jsx`

**Requirements:**
- [ ] Course selection dropdown
- [ ] Report type selection
- [ ] Preview report
- [ ] "Send to All Parents" button
- [ ] Confirmation dialog with recipient count
- [ ] Progress indicator
- [ ] Success/failure notification

**Acceptance Criteria:**
- Easy to use
- Preview before send
- Clear confirmation
- Progress feedback

---

---

## 📋 PHASE 17: Payment Integration

**Current Status:** 0% Complete
**Priority:** MEDIUM (Revenue - Can use manual payments initially)
**Estimated Effort:** 3-4 days
**Test File:** `tests/payment-flow.spec.js`

### Task 17.1: Payment Model & Service
**Files:**
- `server/models/` (already exists via Prisma)
- `server/services/payment.service.js`

**Requirements:**
- [ ] PayMob API integration
- [ ] Fawry API integration
- [ ] Payment initiation logic
- [ ] Callback/webhook handling
- [ ] Payment verification
- [ ] Session-based pricing calculation

**Acceptance Criteria:**
- Payments process successfully
- Callbacks handled correctly
- Failed payments logged

### Task 17.2: Payment Endpoints
**File:** `server/routes/payment.routes.js`

**Endpoints to Create:**
- [ ] `POST /api/payments/initiate` - Start payment
- [ ] `POST /api/payments/paymob/callback` - PayMob webhook
- [ ] `POST /api/payments/fawry/callback` - Fawry webhook
- [ ] `GET /api/payments/:id/status` - Check payment status
- [ ] `GET /api/payments/history` - User payment history

**Acceptance Criteria:**
- All endpoints functional
- Webhooks verified with HMAC
- Secure payment flow

### Task 17.3: Payment UI
**Files:**
- `client/src/pages/PaymentPage.jsx`
- `client/src/components/PaymentMethodSelector.jsx`

**Requirements:**
- [ ] Payment method selection (PayMob/Fawry)
- [ ] Price display with breakdown
- [ ] Payment form
- [ ] Redirect to payment gateway
- [ ] Return handling (success/failure)
- [ ] Payment confirmation page
- [ ] Payment history view

**Acceptance Criteria:**
- Smooth payment flow
- Clear pricing information
- Success/failure handled gracefully
- Receipt/confirmation provided

---

## 📋 PHASE 18: Advanced Features

**Current Status:** 0% Complete
**Priority:** LOW
**Estimated Effort:** Ongoing

### Performance Optimizations
- [ ] API response caching
- [ ] Database query optimization
- [ ] Frontend code splitting
- [ ] Image optimization & lazy loading
- [ ] CDN integration

### Advanced Analytics
- [ ] Predictive analytics
- [ ] Student at-risk identification
- [ ] Recommendation engine
- [ ] Advanced visualizations

---

## 🧪 Testing Requirements

For each phase, ensure:

### Backend Testing
- [ ] Unit tests for new controllers
- [ ] Integration tests for new endpoints
- [ ] Error handling tests
- [ ] Edge case coverage

### Frontend Testing
- [ ] Component render tests
- [ ] User interaction tests
- [ ] Responsive design testing
- [ ] Cross-browser compatibility

### E2E Testing
- [ ] Critical user flows
- [ ] Payment flow
- [ ] Assessment taking flow
- [ ] Enrollment flow

---

## 📚 Documentation Requirements

For each completed phase:

- [ ] Update IMPLEMENTATION_STATUS.md
- [ ] Document new API endpoints
- [ ] Add frontend component docs
- [ ] Update README.md if needed
- [ ] Create migration guides if schema changes

---

## ⚡ Quick Win Tasks

**Small improvements that can be done quickly:**

1. **Error Handling Improvements**
   - [ ] Better error messages in UI
   - [ ] Toast notifications for all actions
   - [ ] Loading states for all buttons

2. **UX Enhancements**
   - [ ] Confirmation dialogs for destructive actions
   - [ ] Keyboard shortcuts for common actions
   - [ ] Dark mode support

3. **Admin Conveniences**
   - [ ] Bulk operations (delete, archive)
   - [ ] Quick filters and saved views
   - [ ] Export data to CSV

4. **Student Experience**
   - [ ] Course bookmarking
   - [ ] Notes on lessons
   - [ ] Progress badges

---

## 📝 Notes for Claude Code

### When Implementing a Phase:
1. Read the requirements carefully
2. Check if backend API exists (see IMPLEMENTATION_STATUS.md)
3. Start with backend if needed, then frontend
4. Test each feature before moving on
5. Update documentation when complete
6. Mark phase as complete in IMPLEMENTATION_STATUS.md

### Best Practices:
- Follow existing code patterns
- Use shadcn/ui components for UI
- Use existing services (api.service.js, auth.service.js)
- Add error handling everywhere
- Make it mobile responsive
- Test on real data

### Getting Help:
- Check existing similar components for patterns
- Reference API documentation in `docs/api/`
- Look at completed phases for examples
- Test endpoints with Postman or curl first

---

**Remember:** Focus on completing MVP features (Phases 12-14) before moving to enhancements. Priority order:
1. **Phase 12:** Public Pages (student onboarding)
2. **Phase 13:** Email Notifications (essential communication)
3. **Phase 14:** Sessions & Attendance (live course functionality)
4. **Phase 15-16:** Analytics & WhatsApp (enhanced features)
5. **Phase 17:** Payment Integration (can use manual payments initially)
6. **Phase 18:** Advanced features (post-launch improvements)

The platform must be fully functional for students before adding advanced features.
