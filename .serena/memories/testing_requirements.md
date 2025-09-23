# Testing Requirements and Patterns

## MANDATORY Testing with PlaywrightMCP

Every feature implementation MUST include Playwright tests. No feature is considered complete without comprehensive test coverage.

## Test Structure

### Test Directory Layout
```
tests/
├── api/              # API endpoint tests
├── e2e/              # End-to-end user journey tests  
├── components/       # Individual component tests
└── fixtures/         # Test data and utilities
```

### Configuration Files
- **Root**: `playwright.config.js` - Main Playwright configuration
- **Client**: `client/playwright.config.js` - Frontend-specific tests
- **Server**: `server/playwright.config.js` - Backend API tests

## Testing Requirements by Feature Type

### API Endpoint Testing
For every new API endpoint, test:
- **Success cases** with valid data
- **Error cases** with invalid data
- **Authentication** (if protected)
- **Authorization** (role-based access)
- **Input validation** (all edge cases)
- **Database changes** (verify data persisted correctly)

```javascript
// Example API test pattern
test('POST /api/courses should create course', async ({ request }) => {
  const response = await request.post('/api/courses', {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      title: 'Test Course',
      description: 'Test Description',
      type: 'finished',
      price: 100
    }
  })
  
  expect(response.status()).toBe(201)
  const body = await response.json()
  expect(body.success).toBe(true)
  expect(body.data.title).toBe('Test Course')
})
```

### UI Component Testing
For every React component, test:
- **Rendering** with different props
- **User interactions** (clicks, form submissions)
- **State changes** (loading, errors, success)
- **Navigation** (routing changes)
- **Form validation** (client-side validation)

```javascript
// Example component test
test('Login form should validate and submit', async ({ page }) => {
  await page.goto('/login')
  
  // Test validation
  await page.click('button[type="submit"]')
  await expect(page.locator('.error-message')).toBeVisible()
  
  // Test successful submission
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

### End-to-End Testing
Test complete user journeys:
- **Student enrollment flow** (signup → course selection → enrollment request)
- **Admin approval flow** (login → review requests → approve/reject)
- **Assessment taking** (start homework → answer questions → submit)
- **Payment flow** (course selection → payment → enrollment)

## Critical Features That Must Be Tested

### Access Windows Testing
**🚨 CRITICAL FEATURE - Must test thoroughly:**
```javascript
test('Access windows should restrict student course access', async ({ page }) => {
  // Login as admin, create enrollment with partial access
  // Login as student, verify only accessible sessions visible
  // Test edge cases (session boundaries, expired access)
})
```

### Assessment System Testing
```javascript
test('Homework submission should store all answers', async ({ page }) => {
  // Start homework attempt
  // Answer all questions
  // Submit and verify database storage
  // Check score calculation
})

test('Test timer should auto-submit when expired', async ({ page }) => {
  // Start test with short timer
  // Wait for auto-submission
  // Verify submission recorded
})
```

### Payment Integration Testing
```javascript
test('Payment flow should create enrollment on success', async ({ page }) => {
  // Test PayMob integration
  // Test Fawry integration  
  // Test callback handling
  // Verify enrollment creation
})
```

## Test Data Management

### Test Database
- Use separate test database
- Reset between test runs
- Seed with consistent test data
- Clean up after tests

### Test Users
```javascript
// Standard test users
const testUsers = {
  admin: { email: 'admin@test.com', password: 'admin123' },
  student: { email: 'student@test.com', password: 'student123' },
  parent: { email: 'parent@test.com' }
}
```

## Test Commands

### Running Tests
```bash
# All tests
npx playwright test

# Specific test suites
npx playwright test tests/api/
npx playwright test tests/e2e/
npx playwright test tests/components/

# Debug mode
npx playwright test --debug
npx playwright test --ui

# Headed browser
npx playwright test --headed
```

### Test Reporting
```bash
# Generate and show report
npx playwright show-report

# CI-friendly output
npx playwright test --reporter=dot
```

## Mock and Stub Patterns

### External Service Mocking
```javascript
// Mock WhatsApp API
test.beforeEach(async ({ page }) => {
  await page.route('**/whatsapp-api/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    })
  })
})
```

### Database Mocking for Unit Tests
```javascript
// Mock Prisma client
const prismaMock = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  }
}
```

## Performance Testing
- Load testing for high-traffic endpoints
- Database query performance validation  
- Frontend bundle size monitoring
- API response time verification

## Security Testing
- Authentication bypass attempts
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting effectiveness

## Test Coverage Requirements
- **API endpoints**: 100% coverage
- **Critical user flows**: 100% coverage
- **UI components**: Core functionality covered
- **Error scenarios**: All error paths tested
- **Edge cases**: Boundary conditions tested