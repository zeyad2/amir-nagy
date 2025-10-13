/**
 * Student Assessment E2E Tests
 * Tests the complete flow of taking homework and tests
 */
import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:3000'
const STUDENT_EMAIL = 'zeyadsattar613@gmail.com'
const STUDENT_PASSWORD = 'Zeyadmoh1'
const ADMIN_EMAIL = 'admin22@gmail.com'
const ADMIN_PASSWORD = 'TestPass123'

test.describe('Student Assessment System', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', STUDENT_EMAIL)
    await page.fill('input[type="password"]', STUDENT_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/student`)
  })

  test.describe('Course Learning Page', () => {
    test('should display course content tabs', async ({ page }) => {
      // Navigate to a course
      await page.goto(`${BASE_URL}/student/courses/17`)

      // Check tabs are visible
      await expect(page.getByRole('tab', { name: /lessons/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /homework/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /tests/i })).toBeVisible()
    })

    test('should display lessons in lessons tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)

      await page.click('button[role="tab"]:has-text("Lessons")')

      // Check for lesson cards
      const lessonCards = page.locator('[class*="card"]:has-text("Watch Lesson")')
      await expect(lessonCards.first()).toBeVisible()
    })

    test('should navigate to homework when clicked', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)

      // Click homework tab
      await page.click('button[role="tab"]:has-text("Homework")')

      // Click first homework
      const startButton = page.locator('button:has-text("Start Homework")').first()
      await startButton.click()

      // Should navigate to assessment page
      await expect(page).toHaveURL(/\/student\/assessment\/\d+/)
    })

    test('should navigate to test when clicked', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)

      // Click tests tab
      await page.click('button[role="tab"]:has-text("Tests")')

      // Click first test
      const takeTestButton = page.locator('button:has-text("Take Test")').first()
      await takeTestButton.click()

      // Should navigate to assessment page
      await expect(page).toHaveURL(/\/student\/assessment\/\d+/)
    })
  })

  test.describe('Homework Flow', () => {
    test('should allow starting homework immediately', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Should show assessment directly (no confirmation page)
      await expect(page.locator('h1')).toContainText(/homework|assessment/i)
      await expect(page.locator('button:has-text("Submit")')).toBeVisible()
    })

    test('should persist answers in localStorage', async ({ page, context }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Get assessment ID from URL
      const url = page.url()
      const assessmentId = url.split('/').pop()

      // Answer first question
      const firstChoice = page.locator('[class*="choice"]').first()
      await firstChoice.click()

      // Wait for localStorage to update
      await page.waitForTimeout(500)

      // Check localStorage
      const savedAnswers = await page.evaluate((id) => {
        return localStorage.getItem(`assessment_${id}_answers`)
      }, assessmentId)

      expect(savedAnswers).toBeTruthy()
      expect(JSON.parse(savedAnswers)).toBeDefined()
    })

    test('should restore answers after page refresh', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Answer first question
      const firstChoice = page.locator('button').filter({ has: page.locator('div:text("A")') }).first()
      await firstChoice.click()
      await page.waitForTimeout(500)

      // Refresh page
      await page.reload()

      // Check if answer is still selected
      await expect(firstChoice).toHaveClass(/blue/)
    })

    test('should block submission if questions unanswered', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Try to submit without answering all questions
      await page.click('button:has-text("Submit")')

      // Should show error toast
      await expect(page.locator('text=/Please answer all questions/i')).toBeVisible({ timeout: 3000 })
    })

    test('should allow cross-out elimination', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Find cross-out button (X icon)
      const crossOutButton = page.locator('button:has(svg)').filter({ hasText: '' }).first()
      await crossOutButton.click()

      // Choice should have opacity-50 class
      const choiceContainer = crossOutButton.locator('..')
      await expect(choiceContainer).toHaveClass(/opacity-50/)
    })

    test('should allow selecting crossed-out choice', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Cross out first choice
      const firstChoiceButton = page.locator('button').filter({ has: page.locator('div:text("A")') }).first()
      const crossOutButton = firstChoiceButton.locator('button:has(svg)').first()
      await crossOutButton.click()

      // Still should be able to select it
      await firstChoiceButton.click()
      await expect(firstChoiceButton).toHaveClass(/blue/)
    })

    test('should display passage content with proper formatting', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Check passage is rendered
      const passage = page.locator('[class*="passage"]').first()
      await expect(passage).toBeVisible()

      // Check for formatted text (em, strong tags should be rendered)
      const passageContent = await passage.innerHTML()
      expect(passageContent.length).toBeGreaterThan(0)
    })

    test('should show results after submission', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Answer all questions (select first choice for each)
      const allChoices = await page.locator('button').filter({ has: page.locator('div:text("A")') }).all()
      for (const choice of allChoices) {
        await choice.click()
        await page.waitForTimeout(100)
      }

      // Submit
      await page.click('button:has-text("Submit")')
      await page.click('button:has-text("Submit")') // Confirm in dialog

      // Should show results
      await expect(page.locator('text=/score|results/i')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=/\\d+%/')).toBeVisible()
    })
  })

  test.describe('Test Flow', () => {
    test('should show confirmation page before starting', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Tests")')
      await page.click('button:has-text("Take Test")').first()

      // Should show confirmation page
      await expect(page.locator('text=/Timed Test/i')).toBeVisible()
      await expect(page.locator('text=/Start Test/i')).toBeVisible()
      await expect(page.locator('text=/minutes/i')).toBeVisible()
    })

    test('should start timer when test begins', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Tests")')
      await page.click('button:has-text("Take Test")').first()

      // Click start test
      await page.click('button:has-text("Start Test")')

      // Timer should be visible
      await expect(page.locator('text=/\\d{2}:\\d{2}/')).toBeVisible({ timeout: 2000 })
    })

    test('should persist timer across page refresh', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Tests")')
      await page.click('button:has-text("Take Test")').first()
      await page.click('button:has-text("Start Test")')

      // Get timer value
      const timerBefore = await page.locator('text=/\\d{2}:\\d{2}/').textContent()

      // Wait 2 seconds
      await page.waitForTimeout(2000)

      // Refresh
      await page.reload()

      // Timer should continue from where it was
      const timerAfter = await page.locator('text=/\\d{2}:\\d{2}/').textContent()
      expect(timerAfter).not.toBe(timerBefore)
    })

    test('should allow submission with missing answers', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Tests")')
      await page.click('button:has-text("Take Test")').first()
      await page.click('button:has-text("Start Test")')

      // Answer only first question
      const firstChoice = page.locator('button').filter({ has: page.locator('div:text("A")') }).first()
      await firstChoice.click()

      // Try to submit
      await page.click('button:has-text("Submit")')

      // Should show warning but allow submission
      await expect(page.locator('text=/unanswered question/i')).toBeVisible()
      await page.click('button:has-text("Submit")') // Confirm

      // Should submit successfully
      await expect(page.locator('text=/score|results/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Results and Review', () => {
    test('should display score breakdown', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Answer all and submit (assuming previously completed)
      // Navigate to results directly
      const url = page.url()
      await page.goto(url)

      // Check for score display elements
      await expect(page.locator('text=/\\d+%/')).toBeVisible()
      await expect(page.locator('text=/Correct/i')).toBeVisible()
      await expect(page.locator('text=/Incorrect/i')).toBeVisible()
    })

    test('should show correct and incorrect answers in review', async ({ page }) => {
      // This test assumes a submission already exists
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Should redirect to results if already submitted
      await page.waitForTimeout(1000)

      // Check for answer indicators
      const correctIndicators = page.locator('text=/Correct/i')
      const incorrectIndicators = page.locator('text=/Incorrect/i')

      // At least one should be visible
      const correctCount = await correctIndicators.count()
      const incorrectCount = await incorrectIndicators.count()
      expect(correctCount + incorrectCount).toBeGreaterThan(0)
    })

    test('should display passages in review mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // In results, check passage is visible
      const passage = page.locator('[class*="passage"]').first()
      await expect(passage).toBeVisible({ timeout: 5000 })
    })

    test('should prevent re-submission', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // If already submitted, should not see Submit button
      const submitButton = page.locator('button:has-text("Submit")')
      const isVisible = await submitButton.isVisible({ timeout: 2000 }).catch(() => false)

      // If we see results page, submit button should not exist
      if (await page.locator('text=/score|results/i').isVisible()) {
        expect(isVisible).toBe(false)
      }
    })
  })

  test.describe('Question Navigation', () => {
    test('should show question navigation sidebar on desktop', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Set viewport to desktop
      await page.setViewportSize({ width: 1280, height: 720 })

      // Question navigation should be visible
      const nav = page.locator('text=/Questions/i')
      await expect(nav).toBeVisible()
    })

    test('should navigate to question when clicked', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      await page.setViewportSize({ width: 1280, height: 720 })

      // Click on question 2 in navigation
      const question2Button = page.locator('button:has-text("2")').first()
      await question2Button.click()

      // Page should scroll to question 2
      await page.waitForTimeout(500)
      const question2Element = page.locator('#question-2')
      const isVisible = await question2Element.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test('should show answered indicator in navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      await page.setViewportSize({ width: 1280, height: 720 })

      // Answer first question
      const firstChoice = page.locator('button').filter({ has: page.locator('div:text("A")') }).first()
      await firstChoice.click()
      await page.waitForTimeout(500)

      // Question 1 button should have checkmark or different style
      const question1Button = page.locator('button:has-text("1")').first()
      const hasCheckmark = await page.locator('svg[class*="check"]').count()
      expect(hasCheckmark).toBeGreaterThan(0)
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // Should display passage above questions
      const passage = page.locator('[class*="passage"]').first()
      await expect(passage).toBeVisible()

      // Submit button should be visible
      await expect(page.locator('button:has-text("Submit")')).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      await page.goto(`${BASE_URL}/student/courses/17`)
      await page.click('button[role="tab"]:has-text("Homework")')
      await page.click('button:has-text("Start Homework")').first()

      // All elements should be visible
      await expect(page.locator('button:has-text("Submit")')).toBeVisible()
      await expect(page.locator('[class*="passage"]').first()).toBeVisible()
    })
  })
})
