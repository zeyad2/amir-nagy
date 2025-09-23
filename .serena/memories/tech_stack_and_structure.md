# Technology Stack & Project Structure

## Tech Stack Requirements (STRICT)

### Frontend
- **React 18.x** with **Vite** (NOT Create React App)
- **JavaScript/JSX** (NO TypeScript)
- **React Router v6** for routing
- **TailwindCSS** for styling
- **shadcn/ui** components for UI elements
- **@tanstack/react-query** for state management
- **react-hook-form** for form handling
- **react-hot-toast** for notifications

### Backend
- **Node.js 18.x LTS** with **Express.js 4.x**
- **JavaScript** (NO TypeScript)  
- **Prisma ORM** with **PostgreSQL 14.x**
- **JWT** with bcrypt/bcryptjs for authentication
- **Nodemailer** for emails
- **Multer** for file uploads (PDFs only, max 50MB)
- **Joi** for validation
- **Helmet, CORS, Morgan** for security and logging

### Development & Testing
- **PlaywrightMCP** for testing (MANDATORY)
- **ESLint** for linting
- **Jest** for unit testing (server)
- **Prisma Studio** for database management

## Project Structure
```
sat-platform/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Reusable shadcn/ui components
│   │   │   ├── admin/      # Admin-specific components  
│   │   │   ├── student/    # Student-specific components
│   │   │   └── ui/         # shadcn/ui component library
│   │   ├── pages/          # React Router pages
│   │   ├── services/       # API calls and integrations
│   │   ├── utils/          # Helper functions and AuthContext
│   │   ├── routes/         # React Router configuration
│   │   └── styles/         # TailwindCSS styles
├── server/                 # Node.js backend
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Business logic handlers
│   ├── middlewares/       # Auth, validation, error handling
│   ├── schemas/           # Joi validation schemas
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration files
│   ├── prisma/            # Database schema and migrations
│   └── uploads/           # File storage directory
├── tests/                 # Playwright tests
└── .env.example
```

## Database
- **PostgreSQL 14.x** with Prisma ORM
- Complete schema at `server/prisma/schema.prisma`
- Models: User, Student, Course, Enrollment, EnrollmentRequest, Lesson, Homework, Test, Session, AccessWindow, Payment, etc.
- Many-to-many relationships for resources (lessons/homework/tests can be assigned to multiple courses)