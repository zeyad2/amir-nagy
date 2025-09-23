# Essential Commands for SAT Platform Development

## Project Startup Commands
```bash
# Frontend (from client directory)
cd client
npm run dev                 # Start Vite dev server on http://localhost:3000

# Backend (from server directory) 
cd server
npm run dev                 # Start nodemon server on http://localhost:5000

# Both are currently running according to CLAUDE.md
```

## Development Commands

### Frontend (client/)
```bash
npm run build              # Build production bundle with Vite
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

### Backend (server/)
```bash
npm start                  # Production server start
npm run dev                # Development with nodemon
npm test                   # Run Jest tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate test coverage report
```

### Database Commands (server/)
```bash
npx prisma migrate dev     # Create and apply migration
npx prisma generate        # Generate Prisma client
npx prisma studio          # Open Prisma Studio GUI
npx prisma migrate reset   # Reset database (WARNING: destroys data)
npx prisma db push         # Push schema changes without migration
```

### Testing Commands
```bash
# Root directory
npx playwright test        # Run Playwright tests
npx playwright test --ui   # Run with UI mode
npx playwright show-report # Show test report

# Individual test runs
npx playwright test tests/api/     # Run API tests only
npx playwright test tests/e2e/     # Run E2E tests only
```

## Windows System Commands
```bash
# File operations
dir                        # List directory contents (equivalent to ls)
type filename.txt          # Display file contents (equivalent to cat)
copy file.txt dest.txt     # Copy file
move file.txt newdir/      # Move file
del filename.txt           # Delete file
mkdir dirname              # Create directory
rmdir dirname              # Remove directory

# Process management
tasklist                   # List running processes
taskkill /F /PID <pid>     # Kill process by PID
netstat -ano               # Show network connections

# Git commands (same as Unix)
git status
git add .
git commit -m "message"
git push origin branch-name
```

## Package Management
```bash
npm install                # Install dependencies
npm install package-name   # Install new package
npm uninstall package-name # Remove package
npm audit                  # Check for security vulnerabilities
npm audit fix              # Fix security issues
```

## Environment Setup
```bash
# Copy environment template
copy .env.example .env     # Windows
cp .env.example .env       # Git Bash

# Edit environment file with appropriate values
# DATABASE_URL, JWT_SECRET, EMAIL configs, etc.
```

## Useful Development Workflows
```bash
# After making database schema changes:
cd server
npx prisma migrate dev --name descriptive-name
npx prisma generate

# After pulling changes:
cd client && npm install
cd ../server && npm install

# Full restart after major changes:
# Stop both dev servers (Ctrl+C)
cd client && npm run dev    # In one terminal
cd server && npm run dev    # In another terminal
```