# SAT & English Teaching Platform

A comprehensive online learning platform for Mr. Amir Nagy's SAT & English courses. This platform supports course delivery, automated grading, student performance tracking, and administrative management.

## 📚 Documentation

- **[📋 PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Complete project overview, implementation status, and technical details
- **[🛠 DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development guidelines, setup instructions, and coding standards
- **[🧪 TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing procedures, API documentation, and validation checklists
- **[⚙️ CLAUDE.md](./claude.md)** - Complete build instructions and specifications (for development team)

## 🚀 Quick Start

1. **Setup Environment**: Follow instructions in [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
2. **Test Implementation**: Use procedures in [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. **View Project Status**: Check [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

## Features

### For Students
- Course browsing and enrollment requests
- Access to video lessons, homework, and tests
- SAT-style assessment interface with timer
- Performance analytics and progress tracking
- Email notifications for important updates

### For Admins
- Complete resource management (lessons, homework, tests)
- Course creation with many-to-many resource relationships
- Enrollment request approval/rejection system
- Student performance monitoring
- Manual WhatsApp reports to parents
- Comprehensive analytics dashboard

### Technical Highlights
- **Reusable Resources**: Lessons, homework, and tests can be assigned to multiple courses
- **Complete Answer Storage**: Every student answer is stored for detailed analysis
- **SAT-Formatted Assessments**: Authentic test-taking experience
- **Automated Email Notifications**: Welcome emails, enrollment updates, score notifications
- **Manual WhatsApp Integration**: Cost-effective parent communication
- **JWT Authentication**: Secure user sessions with refresh tokens

## Technology Stack

### Backend
- **Node.js 18.x** with Express.js 4.x
- **PostgreSQL 14.x** with Prisma ORM
- **JWT** authentication with bcrypt
- **Nodemailer** for email notifications
- **Multer** for file uploads (PDFs, max 10MB)
- **PayMob & Fawry** payment integration

### Frontend
- **React 18.x** (JavaScript, no TypeScript)
- **React Router** for navigation
- **React Query** for state management
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Tailwind-inspired** custom CSS

## Project Structure

```
sat-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Reusable UI components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── student/    # Student-specific components
│   │   │   └── public/     # Public landing page components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # CSS files
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Business logic handlers
│   ├── middlewares/       # Authentication, validation, etc.
│   ├── uploads/           # File storage directory
│   ├── config/            # Configuration files
│   ├── prisma/            # Database schema and migrations
│   │   └── schema.prisma  # Complete database schema
│   ├── app.js            # Express app entry point
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn package manager

### 1. Clone and Setup

```bash
git clone <repository-url>
cd sat-platform
```

### 2. Environment Configuration

Copy the environment example file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sat_platform?schema=public"

# JWT Secrets
JWT_SECRET=your_secure_jwt_secret_key
REFRESH_TOKEN_SECRET=your_secure_refresh_secret

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

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

# URLs
CLIENT_URL=http://localhost:3000
```

### 3. Database Setup

Install server dependencies:
```bash
cd server
npm install
```

Initialize database:
```bash
# Create database migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Backend Setup

Start the development server:
```bash
# From server directory
npm run dev
```

The API will be available at `http://localhost:5000`

### 5. Frontend Setup

Install client dependencies:
```bash
cd client
npm install
```

Start the React development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### 6. Create Admin User

Since the first user needs to be an admin, you can either:

**Option A: Manual Database Update**
1. Register a new user through the UI
2. Connect to your database
3. Update the user's role to 'admin':
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

**Option B: Prisma Studio**
1. Run `npx prisma studio` from the server directory
2. Register a user through the UI
3. Open Prisma Studio and change the user's role to 'admin'

## Database Schema

The platform uses a comprehensive PostgreSQL schema with the following key entities:

### Core Models
- **User**: Authentication and role management
- **Student**: Student profile information
- **Course**: Course definitions with type (live/recorded)
- **Enrollment**: Student-course relationships
- **EnrollmentRequest**: Approval workflow for enrollments

### Resource Models (Many-to-Many)
- **Lesson**: Standalone video lessons
- **Homework**: Assessment with passages and questions  
- **Test**: Timed assessments with passages and questions
- **CourseLesson/CourseHomework/CourseTest**: Junction tables for resource assignment

### Assessment Models
- **HomeworkSubmission/TestSubmission**: Student attempts
- **HomeworkAnswer/TestAnswer**: Individual question responses
- **QuestionChoice**: Multiple choice options with correct answers

### Live Course Models
- **Session**: Live course sessions with dates
- **Attendance**: Student attendance tracking
- **AccessWindow**: Partial course access for late enrollees

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Public Courses
- `GET /api/courses` - List published courses
- `GET /api/courses/:id` - Course details with enrollment status

### Student Features
- `POST /api/courses/enrollment-requests` - Submit enrollment request
- `GET /api/student/dashboard` - Student dashboard data
- `GET /api/student/courses` - Enrolled courses
- `POST /api/student/homework/:id/submit` - Submit homework
- `POST /api/student/tests/:id/submit` - Submit test

### Admin Features
- `GET /api/admin/dashboard` - Admin statistics
- `POST /api/admin/lessons` - Create lesson
- `POST /api/admin/homework` - Create homework
- `POST /api/admin/tests` - Create test
- `POST /api/admin/courses` - Create course
- `POST /api/courses/:id/lessons` - Assign lessons to course
- `GET /api/admin/enrollment-requests` - List pending requests
- `PUT /api/admin/enrollment-requests/:id/approve` - Approve request

## Key Implementation Features

### 1. Many-to-Many Resource Relationships
Resources (lessons, homework, tests) are created once and can be assigned to multiple courses through junction tables. This allows efficient content reuse across different course offerings.

### 2. Complete Answer Storage
Every student response is stored in the database, including:
- Which choice was selected for each question
- Whether the answer was correct
- Submission timestamps
- Score calculations

This enables detailed analytics and allows students to review their mistakes.

### 3. Enrollment Flow
- **Recorded courses with online payment**: Automatic enrollment after successful payment
- **All other cases**: Enrollment request requiring admin approval
- **Email notifications**: Automated for all enrollment status changes

### 4. Assessment System
- SAT-style formatting with passages and multiple choice questions
- Timer for tests with auto-submission
- Save/resume functionality for homework
- Immediate score display with detailed review

### 5. Communication System
- **Email**: Automated notifications via Nodemailer
- **WhatsApp**: Manual reports sent by admin to reduce costs

## Deployment

### Hostinger Deployment
1. Upload files to your hosting space
2. Configure environment variables in hosting panel
3. Set up PostgreSQL database
4. Install dependencies: `npm install --production`
5. Run database migrations: `npx prisma migrate deploy`
6. Build frontend: `npm run build`
7. Configure reverse proxy to serve React build files

### Production Considerations
- Use strong JWT secrets
- Configure CORS for production domain
- Set up SSL certificates
- Configure database backups
- Set up monitoring and logging
- Configure rate limiting for API endpoints

## Development Status

✅ **Completed:**
- Project structure and configuration
- Database schema with all relationships
- JWT authentication system
- Admin resource management (lessons, homework, tests)
- Course system with many-to-many relationships
- Public course pages and enrollment requests
- Basic React frontend with authentication

🚧 **In Progress:**
- Student portal and learning interface
- Assessment taking system with complete answer storage
- Payment integration (PayMob/Fawry)
- Email notification system
- WhatsApp integration for reports

📋 **Planned:**
- Performance analytics dashboard
- Mobile responsive optimizations
- Advanced admin reporting
- Automated testing suite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Mr. Amir Nagy's SAT teaching platform.

## Support

For technical support or questions about setup, please contact the development team.