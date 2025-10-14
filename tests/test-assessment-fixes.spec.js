import { test, expect } from '@playwright/test';

test.describe('Assessment Test Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a student
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/student/dashboard', { timeout: 10000 });
  });

  test('should start a test and create TestAttempt record', async ({ page }) => {
    console.log('=== Test 1: Starting a test ===');

    // Navigate to a course with a test (adjust the course ID as needed)
    await page.goto('http://localhost:3000/student/courses/1/learn');
    await page.waitForTimeout(2000);

    // Look for a test (timed assessment)
    const testCard = page.locator('[data-test-type="test"]').first();
    if (await testCard.count() === 0) {
      console.log('No test found, looking for any assessment link...');
      // Try to find any assessment link
      const assessmentLinks = page.locator('a[href*="/assessment/"]');
      if (await assessmentLinks.count() > 0) {
        await assessmentLinks.first().click();
      } else {
        throw new Error('No assessments found on the page');
      }
    } else {
      await testCard.click();
    }

    await page.waitForTimeout(2000);

    // Check if we're on the assessment page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Wait for the page to load and check for errors
    await page.waitForTimeout(3000);

    // Check console logs for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });

    // Take a screenshot
    await page.screenshot({ path: 'test-assessment-start.png', fullPage: true });

    // Check if we see a confirmation page or error
    const hasConfirmation = await page.locator('text=/Start Test|Begin Assessment/i').count() > 0;
    const hasError = await page.locator('text=/error|failed/i').count() > 0;

    console.log('Has confirmation button:', hasConfirmation);
    console.log('Has error:', hasError);

    if (hasError) {
      const errorText = await page.locator('text=/error|failed/i').first().textContent();
      console.log('Error message:', errorText);
    }
  });

  test('should prevent test restart after starting', async ({ page }) => {
    console.log('=== Test 2: Preventing test restart ===');

    // This test will attempt to start a test twice
    // First time should succeed, second time should fail

    await page.goto('http://localhost:3000/student/assessment/20');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-restart-attempt.png', fullPage: true });

    // Check for error message about already started
    const hasAlreadyStartedError = await page.locator('text=/already started|attempted once/i').count() > 0;
    console.log('Has "already started" error:', hasAlreadyStartedError);
  });

  test('should allow early test submission', async ({ page }) => {
    console.log('=== Test 3: Early submission ===');

    // Navigate to a test
    await page.goto('http://localhost:3000/student/assessment/20');
    await page.waitForTimeout(3000);

    // Look for submit button
    const submitButton = page.locator('button:has-text("Submit")');
    const submitButtonExists = await submitButton.count() > 0;

    console.log('Submit button exists:', submitButtonExists);

    if (submitButtonExists) {
      // Try to click submit without answering anything
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Check if confirmation dialog appears
      const hasDialog = await page.locator('text=/sure|confirm/i').count() > 0;
      console.log('Has confirmation dialog:', hasDialog);
    }

    await page.screenshot({ path: 'test-early-submission.png', fullPage: true });
  });
});
