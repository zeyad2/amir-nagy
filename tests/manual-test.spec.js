/**
 * Manual Testing Script - Simple test to verify basic flow
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const STUDENT_EMAIL = 'zeyadsattar613@gmail.com'
const STUDENT_PASSWORD = 'Zeyadmoh1'

test.describe('Basic Flow Test', () => {
  test('should login as student and navigate to courses', async ({ page }) => {
    // Go to login page
    await page.goto(`${BASE_URL}/login`)

    // Fill in credentials
    await page.fill('input[type="email"]', STUDENT_EMAIL)
    await page.fill('input[type="password"]', STUDENT_PASSWORD)

    // Click sign in
    await page.click('button[type="submit"]')

    // Wait for navigation to student dashboard
    await page.waitForURL(/\/student/, { timeout: 10000 })

    console.log('✓ Student login successful')
    console.log('Current URL:', page.url())

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/01-student-dashboard.png', fullPage: true })

    // Look for enrolled courses or courses link
    const coursesLink = page.locator('text=/courses/i').first()
    if (await coursesLink.isVisible({ timeout: 2000 })) {
      await coursesLink.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-screenshots/02-courses-page.png', fullPage: true })
      console.log('✓ Navigated to courses page')
    }

    // Check for any course cards
    const courseCards = await page.locator('[class*="card"]').count()
    console.log(`Found ${courseCards} course cards`)

    // Take final screenshot
    await page.screenshot({ path: 'test-screenshots/03-final-state.png', fullPage: true })
  })
})
