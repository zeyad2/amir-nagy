# SAT Platform Development Guide

## 🎯 **Project Context**

You are building a SAT & English teaching platform for Mr. Amir Nagy. This is a **single-instructor platform** (not a marketplace) focused on course delivery, automated grading, and student performance tracking.

**Current Status**: Phase 1 (database, authentication) and Phase 3 (admin resource management) are COMPLETE.

---

## ⚠️ **CRITICAL DEVELOPMENT RULES**

### 1. MANDATORY Subagent Usage
**🚨 BEFORE ANY IMPLEMENTATION:**
```
1. Ask yourself: "Which subagent handles this?"
2. Consult the appropriate subagent:
   - Database Architect: Prisma queries, migrations, optimizations
   - API Engineer: Express routes, authentication, payments
   - Frontend Specialist: React components, UI/UX
   - Integration Orchestrator: Testing, deployment, coordination
3. Add comment: // Subagent: [Name] consulted for [feature]
4. Document which subagent was consulted in your code
```

### 2. NO Unnecessary Packages
**Before ANY npm install:**
```
✓ Can native JavaScript do this? → Don't install
✓ Can existing packages do this? → Don't install
✓ Is this absolutely essential? → Document why before installing
✗ Never install "convenience" packages
```

### 3. MANDATORY PlaywrightMCP Testing
**Every feature MUST be tested:**
```
✓ Test EVERY endpoint after creation
✓ Test EVERY UI component after implementation
✓ Create end-to-end tests for user flows
✓ Document test results and coverage
✗ No feature is complete without Playwright tests
```

---

## 🏗️ **Technology Stack (STRICT REQUIREMENTS)**

### Frontend Requirements
- **React 18.x** with **Vite** (NOT Create React App)
- **JavaScript/JSX** (NO TypeScript)
- **React Router v6** for routing
- **TailwindCSS** for styling
- **shadcn/ui** components for UI elements
- **NO** additional UI libraries

### Backend Requirements
- **Node.js 18.x LTS** with **Express.js 4.x**
- **JavaScript** (NO TypeScript)
- **Prisma ORM** (NOT Sequelize)
- **PostgreSQL 14.x** (NO Redis)
- **JWT** with bcrypt for authentication
- **Nodemailer** for emails (NOT SendGrid)

### Development Tools
- **PlaywrightMCP** for testing (MANDATORY)
- **Multer** for file uploads (PDFs only, max 50MB)
- **PayMob/Fawry** for payments (Egyptian Pounds)

---

## 📁 **Project Structure Standards**

```
sat-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Reusable shadcn/ui components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── student/    # Student-specific components
│   │   │   └── public/     # Public landing components
│   │   ├── pages/          # React Router pages
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helper functions
│   │   ├── styles/         # TailwindCSS config
│   │   ├── routes/         # React Router config
│   │   ├── App.jsx
│   │   └── main.jsx        # Vite entry point
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # Express routes
│   ├── controllers/       # Business logic
│   ├── middlewares/       # Auth, validation, errors
│   ├── schemas/           # Joi validation schemas
│   ├── utils/             # Helper functions
│   ├── uploads/           # File storage
│   ├── config/            # DB, email, payment configs
│   ├── prisma/
│   │   ├── schema.prisma  # COMPLETE DATABASE SCHEMA
│   │   └── migrations/
│   ├── app.js
│   └── package.json
├── tests/                 # Playwright tests
│   ├── e2e/              # End-to-end tests
│   ├── api/              # API tests
│   └── playwright.config.js
└── README.md
```

---

## 🔧 **Environment Setup**

### Prerequisites
```bash
# Required software
- Node.js 18.x LTS
- PostgreSQL 14.x
- Git

# Verify versions
node --version    # Should be 18.x
npm --version     # Should be 9.x+
psql --version    # Should be 14.x
```

### Initial Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd sat-platform

# 2. Backend setup
cd server
npm install
cp .env.example .env
# Configure .env with your database and secrets
npm run db:generate
npm run db:migrate
npm run dev

# 3. Frontend setup (when implemented)
cd ../client
npm install
npm run dev

# 4. Testing setup
cd ../tests
npm install
npx playwright install
```

### Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sat_platform"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-different-from-above"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
EMAIL_FROM="noreply@satplatform.com"

# Server Configuration
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"

# Payment Configuration (for future phases)
PAYMOB_API_KEY="your-paymob-key"
FAWRY_MERCHANT_CODE="your-fawry-code"
```

---

## 📋 **Database Schema Location**

**🎯 IMPORTANT**: The complete database schema is at:
```
server/prisma/schema.prisma
```

This schema includes ALL models for users, students, courses, enrollments, sessions, access windows, payments, lessons, homework, tests, and enrollment requests. **Use this exact schema without modifications.**

---

## 🚀 **Development Workflow**

### Phase Implementation Process
1. **Plan with Subagents**: Consult appropriate subagent for guidance
2. **Implement Backend**: API endpoints with validation
3. **Test with PlaywrightMCP**: Comprehensive testing
4. **Implement Frontend**: React components with shadcn/ui
5. **End-to-End Testing**: Complete user flows
6. **Documentation Update**: Update relevant documentation

### Code Standards
```javascript
// ✅ Good: Clear function with subagent consultation
// Subagent: API Engineer consulted for authentication endpoint
export const authenticateUser = async (req, res) => {
  try {
    // Clear, documented logic
  } catch (error) {
    // Proper error handling
  }
};

// ❌ Bad: No documentation, unclear purpose
export const auth = (req, res) => {
  // Unclear implementation
};
```

### Git Commit Standards
```bash
# ✅ Good commits
git commit -m "feat: implement lesson CRUD endpoints

- Add lesson creation with Google Drive validation
- Implement usage tracking for course dependencies
- Add comprehensive Joi validation schemas
- Test coverage: 100% with PlaywrightMCP

Subagent: API Engineer + Database Architect"

# ❌ Bad commits
git commit -m "stuff"
git commit -m "fix"
```

---

## 🎯 **Feature Implementation Guidelines**

### Access Windows (CRITICAL FEATURE)
**🚨 MUST IMPLEMENT for live courses:**
```javascript
// Access windows control partial course access
// Student can have:
// 1. Full access (no AccessWindow record)
// 2. Partial access (AccessWindow with start/end sessions)
// 3. Late join (AccessWindow from specific session)

// Implementation requirements:
- Admin chooses access type during enrollment
- UI shows session range selector for partial access
- Price calculated based on accessible sessions
- Student portal only shows accessible content
```

### Many-to-Many Relationships
```javascript
// Lessons, homework, tests can be reused across courses
// Admin creates resources once, assigns to multiple courses
// Use junction tables: CourseLesson, CourseHomework, CourseTest
```

### BigInt Handling
```javascript
// ✅ Always convert BigInt to string in responses
const response = {
  id: record.id.toString(),
  // ... other fields
};

// ❌ Never return raw BigInt
const response = {
  id: record.id, // Will cause JSON serialization error
};
```

---

## 🧪 **Testing Requirements**

### Mandatory Testing with PlaywrightMCP
```javascript
// Every endpoint must have:
1. Happy path testing
2. Validation error testing
3. Authentication/authorization testing
4. Edge case testing
5. Performance testing

// Example test structure:
describe('Lesson Management', () => {
  test('Create lesson with valid data', async () => {
    // Test implementation
  });

  test('Reject invalid Google Drive URL', async () => {
    // Validation testing
  });

  test('Block non-admin access', async () => {
    // Security testing
  });
});
```

### Test Coverage Requirements
- ✅ **API Endpoints**: 100% coverage
- ✅ **UI Components**: All user interactions
- ✅ **End-to-End**: Complete user journeys
- ✅ **Security**: Authentication and authorization
- ✅ **Performance**: Response times and load handling

---

## 🔒 **Security Implementation**

### Authentication Standards
```javascript
// JWT Configuration
- Access token: 24 hours
- Refresh token: 7 days
- Bcrypt rounds: 12
- Password requirements: 8+ chars, mixed case, numbers

// Middleware Usage
app.use('/api/admin', requireUser, requireAdmin);
app.use('/api/student', requireUser);
```

### Input Validation
```javascript
// Use Joi schemas for all endpoints
const createLessonSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  videoLink: Joi.string().uri().required().custom(isValidGoogleDriveUrl)
});
```

### Error Handling
```javascript
// Standardized error responses
return res.status(400).json({
  error: "Validation failed",
  details: validationErrors
});
```

---

## 📞 **Communication Features**

### Email Integration (Automated)
```javascript
// Use Nodemailer for:
- Welcome emails on registration
- Enrollment notifications
- Password reset emails
- Homework deadline reminders
- Payment confirmations
```

### WhatsApp Integration (Manual Only)
```javascript
// Admin-triggered only, never automatic
// Types of reports:
- Weekly performance summary
- Attendance reports
- Test results
// Plain text format only
```

---

## 💳 **Payment Integration**

### Payment Flow
```javascript
// Finished courses with online payment:
Student clicks "Pay Now" → Payment gateway → Automatic enrollment

// Live courses OR offline payment:
Student clicks "Join Course" → Enrollment request → Admin approval
```

### Access Window Pricing
```javascript
// Price calculation based on accessible sessions
const calculatePrice = (totalPrice, accessibleSessions, totalSessions) => {
  return (totalPrice * accessibleSessions) / totalSessions;
};
```

---

## 📚 **Phase Implementation Guides**

### Current Status
- ✅ **Phase 1**: Authentication & Database Foundation
- ✅ **Phase 3**: Admin Resource Management
- 🔄 **Phase 4**: Course Management (Next)

### Phase 4: Course Management
```javascript
// Key features to implement:
1. Course CRUD with resource assignment
2. Access windows for live courses
3. Publishing and archiving workflow
4. Student enrollment with access control

// Subagents to consult:
- Database Architect: Course-resource relationships
- API Engineer: Enrollment and access APIs
- Frontend Specialist: Course management UI
```

### Phase 5: Student Portal
```javascript
// Key features:
1. Student dashboard with progress
2. Course navigation with access restrictions
3. Video player integration
4. Assessment interfaces

// Critical: Implement access window checking
const canAccessSession = (student, session, course) => {
  // Check AccessWindow table for restrictions
};
```

---

## 🎓 **Educational Content Standards**

### SAT-Style Formatting
```javascript
// All assessments must follow SAT standards:
- Proper typography and spacing
- Multiple choice with exactly 4 options
- Clear passage presentation
- Timer for tests (no timer for homework)
```

### Content Structure
```javascript
// Hierarchy: Course → Lessons/Homework/Tests
// Assessments: Homework/Test → Passages → Questions → Choices
// Storage: Store EVERY student answer for analysis
```

---

## 📖 **Documentation Standards**

### Code Documentation
```javascript
/**
 * Creates a new homework with nested structure
 * Subagent: Database Architect consulted for transaction handling
 * @param {Object} homeworkData - Complete homework structure
 * @returns {Object} Created homework with ID
 */
export const createHomework = async (homeworkData) => {
  // Implementation with clear comments
};
```

### API Documentation
```javascript
// Include in comments:
- Purpose and functionality
- Request/response examples
- Validation requirements
- Error scenarios
- Security considerations
```

---

## 🚨 **Common Pitfalls to Avoid**

### ❌ Don't Do These
```javascript
// Installing unnecessary packages
npm install lodash axios moment

// Using TypeScript
// Using Create React App instead of Vite
// Using Sequelize instead of Prisma
// Ignoring subagent consultation
// Skipping PlaywrightMCP testing
// Not handling BigInt serialization
// Hardcoding configuration values
// Missing input validation
// Poor error handling
```

### ✅ Do These Instead
```javascript
// Use native JavaScript methods
// Follow Vite + React setup
// Consult appropriate subagents
// Test everything with PlaywrightMCP
// Convert BigInt to strings
// Use environment variables
// Implement Joi validation
// Comprehensive error handling
```

---

## 🎯 **Quick Reference Commands**

### Development Commands
```bash
# Start development servers
cd server && npm run dev          # Backend on :5000
cd client && npm run dev          # Frontend on :3000

# Database operations
npm run db:generate               # Generate Prisma client
npm run db:migrate               # Run migrations
npm run db:studio                # Open Prisma Studio
npm run db:reset                 # Reset database

# Testing
npx playwright test              # Run all tests
npx playwright test --ui         # Interactive test runner
npx playwright codegen           # Generate test code
```

### Debugging Commands
```bash
# Check server logs
npm run dev                      # Shows console.log output

# Check database
npx prisma studio               # Visual database browser

# Test API endpoints
curl -X GET http://localhost:5000/api/health
```

---

This guide should be your primary reference for development standards and practices. Always consult the appropriate subagents before implementing new features, and ensure comprehensive PlaywrightMCP testing for all functionality.