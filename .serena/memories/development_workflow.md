# Development Workflow and Task Completion Guidelines

## CRITICAL Development Rules

### 1. MANDATORY Subagent Usage
**🚨 BEFORE ANY IMPLEMENTATION:**
- Ask: "Which subagent handles this?"
- Consult appropriate subagent:
  - **Database Architect**: Prisma queries, migrations, optimizations
  - **API Engineer**: Express routes, authentication, payments
  - **Frontend Specialist**: React components, UI/UX
  - **Integration Orchestrator**: Testing, deployment, coordination
- Add comment: `// Subagent: [Name] consulted for [feature]`
- Document which subagent was consulted

### 2. NO Unnecessary Packages
**Before ANY npm install:**
- Can native JavaScript do this? → Don't install
- Can existing packages do this? → Don't install  
- Is this absolutely essential? → Document why before installing
- Never install "convenience" packages

### 3. MANDATORY PlaywrightMCP Testing
**Every feature MUST be tested:**
- Test EVERY endpoint after creation
- Test EVERY UI component after implementation
- Create end-to-end tests for user flows
- Document test results and coverage
- No feature is complete without Playwright tests

## Task Completion Checklist

### When a Development Task is Complete:
1. **Code Quality**
   - [ ] Follow existing code style and conventions
   - [ ] No TypeScript used anywhere
   - [ ] No unnecessary comments added
   - [ ] Security best practices followed
   - [ ] Error handling implemented

2. **Testing Requirements**
   - [ ] PlaywrightMCP tests written and passing
   - [ ] API endpoints tested if applicable
   - [ ] UI components tested if applicable
   - [ ] E2E user flows tested
   - [ ] Test coverage documented

3. **Documentation**
   - [ ] Which subagent was consulted (in code comments)
   - [ ] Any new packages justified and documented
   - [ ] Breaking changes noted
   - [ ] API changes documented if applicable

4. **Code Integration**
   - [ ] Frontend linting passes: `npm run lint`
   - [ ] Backend tests pass: `npm test`
   - [ ] Database migrations applied if needed
   - [ ] No console errors in browser
   - [ ] Server starts without errors

5. **Feature Validation**
   - [ ] Feature works as specified
   - [ ] Edge cases handled
   - [ ] User experience tested
   - [ ] Performance acceptable
   - [ ] Mobile responsive (if UI feature)

## Development Environment Setup

### Prerequisites Check
- [ ] Node.js 18.x installed
- [ ] PostgreSQL 14.x running
- [ ] Environment variables configured (.env)
- [ ] Database migrated and seeded
- [ ] Both dev servers running (client:3000, server:5000)

### Daily Development Workflow
1. Pull latest changes from git
2. Check if database migrations needed
3. Install any new dependencies
4. Start both dev servers
5. Run existing tests to ensure nothing broken
6. Develop new feature following subagent guidance
7. Write PlaywrightMCP tests
8. Run full test suite
9. Commit changes with descriptive messages

## Commands to Run After Task Completion

### Frontend Tasks
```bash
cd client
npm run lint                # Must pass
npm run build              # Must build successfully
npm run dev                # Must start without errors
```

### Backend Tasks  
```bash
cd server
npm test                   # All tests must pass
npm run dev                # Must start without errors
npx prisma generate        # If schema changed
npx prisma migrate dev     # If schema changed
```

### Database Tasks
```bash
cd server
npx prisma studio          # Verify data integrity
npx prisma migrate dev     # Apply migrations
npx prisma generate        # Regenerate client
```

### Testing Tasks
```bash
npx playwright test        # All tests must pass
npx playwright show-report # Review test results
```

## Git Workflow
- Work on feature branches
- Commit frequently with descriptive messages
- Never commit secrets or .env files
- Test before committing
- Follow conventional commit messages

## When to Ask for Help
- If unsure which subagent to consult
- If existing patterns are unclear
- If tests are failing unexpectedly
- If performance issues arise
- If security concerns exist