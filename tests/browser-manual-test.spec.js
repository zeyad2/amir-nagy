/**
 * Manual Browser Test - Open Chrome and keep it open for manual testing
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const STUDENT_EMAIL = 'zeyadsattar613@gmail.com'
const STUDENT_PASSWORD = 'Zeyadmoh1'

test('manual browser test - keep open', async ({ page }) => {
  // Set a very long timeout
  test.setTimeout(600000) // 10 minutes

  // Login
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[type="email"]', STUDENT_EMAIL)
  await page.fill('input[type="password"]', STUDENT_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/student/, { timeout: 10000 })

  console.log('✓ Logged in as student')

  // Go to first course
  await page.goto(`${BASE_URL}/courses/17`)
  await page.waitForTimeout(2000)

  console.log('✓ On course page /courses/17')
  console.log('Now testing homework and test clicks...')

  // Take screenshot
  await page.screenshot({ path: 'test-screenshots/course-page.png', fullPage: true })

  // Wait a long time so you can manually interact
  console.log('Browser will stay open for 10 minutes. Manually test the homework and test buttons.')
  await page.waitForTimeout(600000)
})
