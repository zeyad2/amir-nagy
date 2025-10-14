/**
 * Full Flow Test - Test complete assessment system
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const STUDENT_EMAIL = 'zeyadsattar613@gmail.com'
const STUDENT_PASSWORD = 'Zeyadmoh1'
const ADMIN_EMAIL = 'admin22@gmail.com'
const ADMIN_PASSWORD = 'TestPass123'

test.describe('Full Assessment Flow', () => {

  test('explore student courses and find assessments', async ({ page }) => {
    // Login as student
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', STUDENT_EMAIL)
    await page.fill('input[type="password"]', STUDENT_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/student/, { timeout: 10000 })

    console.log('✓ Logged in as student')

    // Click on first course
    const continueButton = page.locator('button:has-text("Continue Learning")').first()
    await continueButton.click()
    await page.waitForTimeout(2000)

    console.log('✓ Navigated to course learning page')
    console.log('Current URL:', page.url())

    // Take screenshot of course page
    await page.screenshot({ path: 'test-screenshots/10-course-learning-page.png', fullPage: true })

    // Check for tabs
    const lessonsTab = page.locator('button[role="tab"]', { hasText: 'Lessons' })
    const homeworkTab = page.locator('button[role="tab"]', { hasText: 'Homework' })
    const testsTab = page.locator('button[role="tab"]', { hasText: 'Tests' })

    if (await lessonsTab.isVisible({ timeout: 2000 })) {
      console.log('✓ Lessons tab found')
    }
    if (await homeworkTab.isVisible({ timeout: 2000 })) {
      console.log('✓ Homework tab found')
    }
    if (await testsTab.isVisible({ timeout: 2000 })) {
      console.log('✓ Tests tab found')
    }

    // Try to click homework tab
    if (await homeworkTab.isVisible()) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-screenshots/11-homework-tab.png', fullPage: true })

      // Count homework items
      const homeworkCards = await page.locator('button:has-text("Start Homework")').count()
      console.log(`Found ${homeworkCards} homework assignments`)

      // If there's homework, try to start it
      if (homeworkCards > 0) {
        const startHomeworkBtn = page.locator('button:has-text("Start Homework")').first()
        await startHomeworkBtn.click()
        await page.waitForTimeout(2000)

        console.log('✓ Started homework')
        console.log('Assessment URL:', page.url())
        await page.screenshot({ path: 'test-screenshots/12-homework-assessment.png', fullPage: true })

        // Check if we're on assessment page
        const submitButton = page.locator('button:has-text("Submit")')
        if (await submitButton.isVisible({ timeout: 5000 })) {
          console.log('✓ Assessment page loaded successfully')

          // Check for passages
          const passages = await page.locator('[class*="passage"]').count()
          console.log(`Found ${passages} passage(s)`)

          // Check for questions
          const questions = await page.locator('[class*="question"]').count()
          console.log(`Found ${questions} question(s)`)

          // Try to answer first question
          const firstChoice = page.locator('button').filter({ hasText: /^A$/ }).first()
          if (await firstChoice.isVisible({ timeout: 2000 })) {
            await firstChoice.click()
            await page.waitForTimeout(500)
            console.log('✓ Selected first answer')
            await page.screenshot({ path: 'test-screenshots/13-answer-selected.png', fullPage: true })
          }
        }
      }
    }

    // Go back and check tests
    await page.goto(page.url().replace(/\/assessment\/.*/, ''))
    await page.waitForTimeout(1000)

    if (await testsTab.isVisible()) {
      await testsTab.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-screenshots/14-tests-tab.png', fullPage: true })

      const testCards = await page.locator('button:has-text("Take Test")').count()
      console.log(`Found ${testCards} test(s)`)

      // If there's a test, check confirmation page
      if (testCards > 0) {
        const takeTestBtn = page.locator('button:has-text("Take Test")').first()
        await takeTestBtn.click()
        await page.waitForTimeout(2000)

        console.log('✓ Clicked Take Test')
        console.log('Test URL:', page.url())
        await page.screenshot({ path: 'test-screenshots/15-test-confirmation.png', fullPage: true })

        // Check for confirmation page
        const startTestBtn = page.locator('button:has-text("Start Test")')
        if (await startTestBtn.isVisible({ timeout: 3000 })) {
          console.log('✓ Test confirmation page loaded')
        }
      }
    }

    await page.screenshot({ path: 'test-screenshots/16-final.png', fullPage: true })
  })

  test('admin login and check for creating assessments', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })

    console.log('✓ Logged in as admin')
    await page.screenshot({ path: 'test-screenshots/20-admin-dashboard.png', fullPage: true })

    // Look for resources or assessments section
    const resourcesLink = page.locator('text=/resources/i').first()
    if (await resourcesLink.isVisible({ timeout: 2000 })) {
      await resourcesLink.click()
      await page.waitForTimeout(1000)
      console.log('✓ Navigated to resources page')
      await page.screenshot({ path: 'test-screenshots/21-admin-resources.png', fullPage: true })
    }
  })
})
