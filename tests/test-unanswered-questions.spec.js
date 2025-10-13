/**
 * Test: Unanswered Questions Grading and UI Layout
 *
 * This test verifies:
 * 1. Unanswered questions are counted in total and marked as wrong
 * 2. Question navigation is horizontal (not in left sidebar)
 * 3. Passages take full width without sidebar interference
 */

import { test, expect } from '@playwright/test';

test.describe('Test Assessment - Unanswered Questions and Layout', () => {
  let baseURL;
  let authToken;
  let studentUuid;
  let testId;
  let courseId;

  test.beforeAll(async ({ request }) => {
    baseURL = process.env.VITE_API_URL || 'http://localhost:3000';

    // Login as student (assuming you have test credentials)
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: 'student@test.com',
        password: 'password123'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.data.token;
    studentUuid = loginData.data.user.uuid;

    // Create a test with multiple passages and questions
    // (Assuming admin token exists - you may need to create this)
    const adminLoginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: 'admin@test.com',
        password: 'admin123'
      }
    });

    const adminData = await adminLoginResponse.json();
    const adminToken = adminData.data.token;

    // Create a course
    const courseResponse = await request.post(`${baseURL}/api/admin/courses`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      data: {
        title: 'Test Course for Unanswered Questions',
        description: 'Testing unanswered question grading',
        type: 'finished',
        status: 'published'
      }
    });

    const courseData = await courseResponse.json();
    courseId = courseData.data.id;

    // Create a test with 2 passages, 5 questions total
    const testResponse = await request.post(`${baseURL}/api/admin/assessments/tests`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      data: {
        title: 'Timed Test - Unanswered Questions',
        instructions: 'Test with timer',
        duration: 1, // 1 minute for quick testing
        passages: [
          {
            title: 'Passage 1',
            content: 'This is the first passage content.',
            questions: [
              {
                questionText: 'Question 1?',
                choices: [
                  { choiceText: 'A', isCorrect: true },
                  { choiceText: 'B', isCorrect: false },
                  { choiceText: 'C', isCorrect: false },
                  { choiceText: 'D', isCorrect: false }
                ]
              },
              {
                questionText: 'Question 2?',
                choices: [
                  { choiceText: 'A', isCorrect: false },
                  { choiceText: 'B', isCorrect: true },
                  { choiceText: 'C', isCorrect: false },
                  { choiceText: 'D', isCorrect: false }
                ]
              },
              {
                questionText: 'Question 3?',
                choices: [
                  { choiceText: 'A', isCorrect: false },
                  { choiceText: 'B', isCorrect: false },
                  { choiceText: 'C', isCorrect: true },
                  { choiceText: 'D', isCorrect: false }
                ]
              }
            ]
          },
          {
            title: 'Passage 2',
            content: 'This is the second passage content.',
            questions: [
              {
                questionText: 'Question 4?',
                choices: [
                  { choiceText: 'A', isCorrect: false },
                  { choiceText: 'B', isCorrect: false },
                  { choiceText: 'C', isCorrect: false },
                  { choiceText: 'D', isCorrect: true }
                ]
              },
              {
                questionText: 'Question 5?',
                choices: [
                  { choiceText: 'A', isCorrect: true },
                  { choiceText: 'B', isCorrect: false },
                  { choiceText: 'C', isCorrect: false },
                  { choiceText: 'D', isCorrect: false }
                ]
              }
            ]
          }
        ]
      }
    });

    const testData = await testResponse.json();
    testId = testData.data.id;

    // Assign test to course
    await request.post(`${baseURL}/api/admin/courses/${courseId}/tests`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      data: {
        testId: testId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    });

    // Enroll student
    await request.post(`${baseURL}/api/admin/courses/${courseId}/enrollments`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      data: {
        studentId: studentUuid
      }
    });
  });

  test('should show horizontal question navigation (not sidebar)', async ({ page }) => {
    // Login and navigate to test
    await page.goto(`http://localhost:5173/login`);
    await page.fill('input[name="email"]', 'student@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('**/dashboard');

    // Navigate to test
    await page.goto(`http://localhost:5173/assessment/${testId}`);

    // Start the test
    await page.waitForSelector('text=Start Test');
    await page.click('text=Start Test');

    // Wait for test to load
    await page.waitForSelector('text=Question 1');

    // Verify question navigation exists and is NOT in a left sidebar
    const questionNav = page.locator('.question-navigation');
    await expect(questionNav).toBeVisible();

    // Check that it's using flex-wrap (horizontal layout)
    const navButtons = questionNav.locator('button');
    const firstButton = navButtons.first();
    const secondButton = navButtons.nth(1);

    // Get bounding boxes to verify horizontal layout
    const firstBox = await firstButton.boundingBox();
    const secondBox = await secondButton.boundingBox();

    // If buttons are horizontal, they should have similar Y coordinates
    // and different X coordinates
    expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(20); // Similar Y
    expect(Math.abs(firstBox.x - secondBox.x)).toBeGreaterThan(20); // Different X

    // Verify passage takes more width (not constrained by sidebar)
    const passage = page.locator('.lg\\:col-span-2').first();
    const passageBox = await passage.boundingBox();

    // Passage should be wider than if it was in a 9/12 grid with 3/12 sidebar
    // Now it should be in a 2/5 grid, which is 40% of full width
    expect(passageBox.width).toBeGreaterThan(300); // Reasonable width for passage
  });

  test('should count unanswered questions as wrong and include in total', async ({ page, request }) => {
    // Login
    await page.goto(`http://localhost:5173/login`);
    await page.fill('input[name="email"]', 'student@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Start test
    await page.goto(`http://localhost:5173/assessment/${testId}`);
    await page.waitForSelector('text=Start Test');
    await page.click('text=Start Test');
    await page.waitForSelector('text=Question 1');

    // Answer only 2 out of 5 questions (leave 3 unanswered)
    // Answer Q1 correctly
    const q1Choice = page.locator('label').filter({ hasText: 'A' }).first();
    await q1Choice.click();

    // Answer Q2 correctly
    const q2Choice = page.locator('label').filter({ hasText: 'B' }).first();
    await q2Choice.click();

    // Don't answer Q3, Q4, Q5

    // Wait for timer to expire (1 minute)
    // Or manually trigger submit
    await page.waitForTimeout(65000); // Wait for 65 seconds (timer is 1 minute)

    // Should auto-submit
    await page.waitForSelector('text=Assessment Results', { timeout: 10000 });

    // Verify score display
    const scoreText = await page.textContent('.score-display, [class*="score"]');

    // Should show 2/5 (2 correct out of 5 total)
    expect(scoreText).toContain('2');
    expect(scoreText).toContain('5');

    // Verify via API
    const submissionResponse = await request.get(`${baseURL}/api/student/assessments/${testId}/submission`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(submissionResponse.ok()).toBeTruthy();
    const submissionData = await submissionResponse.json();

    // Verify submission has correct data
    expect(submissionData.data.score).toBe(2);
    expect(submissionData.data.totalQuestions).toBe(5);

    // Verify all 5 answers are stored (including unanswered)
    expect(submissionData.data.answers.length).toBe(5);

    // Verify unanswered questions have null choiceId and isCorrect = false
    const unansweredAnswers = submissionData.data.answers.filter(a => a.selectedChoiceId === null);
    expect(unansweredAnswers.length).toBe(3);
    unansweredAnswers.forEach(answer => {
      expect(answer.isCorrect).toBe(false);
    });
  });

  test('should show passage navigation buttons with correct labels', async ({ page }) => {
    // Login
    await page.goto(`http://localhost:5173/login`);
    await page.fill('input[name="email"]', 'student@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navigate to test
    await page.goto(`http://localhost:5173/assessment/${testId}`);
    await page.click('text=Start Test');
    await page.waitForSelector('text=Question 1');

    // Verify passage navigation buttons
    await expect(page.locator('text=Previous Passage')).toBeVisible();
    await expect(page.locator('text=Next Passage')).toBeVisible();

    // Verify passage counter
    await expect(page.locator('text=Passage 1 of 2')).toBeVisible();

    // Click next passage
    await page.click('text=Next Passage');
    await expect(page.locator('text=Passage 2 of 2')).toBeVisible();
  });
});
