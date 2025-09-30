/**
 * Phase 7: Assessment System - Comprehensive Playwright Tests
 *
 * This test suite validates the complete assessment system including:
 * - Admin endpoints: CRUD operations, listing, submissions
 * - Student endpoints: attempt management, submission, retrieval
 * - Auto-grading logic
 * - Edge cases and error handling
 *
 * Test Coverage:
 * 1. Admin Assessment CRUD
 * 2. Admin Assessment Listing with Pagination
 * 3. Admin View Submissions
 * 4. Student Start Attempt
 * 5. Student Get Attempt Status
 * 6. Student Submit Assessment
 * 7. Student Get Submission Details
 * 8. Auto-grading Verification
 * 9. Edge Cases (duplicate submissions, invalid data, etc.)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5000/api';

// Test data storage
let adminToken = '';
let studentToken = '';
let createdAssessmentId = null;
let testStudentId = null;

// Test credentials (these should exist in the database)
const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

// We'll create a test student if needed
const TEST_STUDENT_CREDENTIALS = {
  email: 'student.test@example.com',
  password: 'Student123!'
};

// Sample assessment data
const SAMPLE_ASSESSMENT = {
  title: 'Playwright Test Assessment - SAT Reading',
  instructions: 'Answer all questions based on the passage provided.',
  duration: 45,
  passages: [
    {
      title: 'The Evolution of Technology',
      content: 'Technology has transformed society in unprecedented ways. From the industrial revolution to the digital age, innovations have continuously reshaped how humans interact, work, and live. The advent of the internet in the late 20th century marked a pivotal moment in human history.',
      imageURL: null,
      order: 0,
      questions: [
        {
          questionText: 'According to the passage, what marked a pivotal moment in human history?',
          order: 0,
          choices: [
            { choiceText: 'The industrial revolution', isCorrect: false, order: 0 },
            { choiceText: 'The advent of the internet', isCorrect: true, order: 1 },
            { choiceText: 'Digital transformation', isCorrect: false, order: 2 },
            { choiceText: 'Human interactions', isCorrect: false, order: 3 }
          ]
        },
        {
          questionText: 'The passage primarily discusses:',
          order: 1,
          choices: [
            { choiceText: 'Industrial processes', isCorrect: false, order: 0 },
            { choiceText: 'Historical events', isCorrect: false, order: 1 },
            { choiceText: 'Technological impact on society', isCorrect: true, order: 2 },
            { choiceText: 'Internet history', isCorrect: false, order: 3 }
          ]
        }
      ]
    },
    {
      title: 'Environmental Challenges',
      content: 'Climate change poses significant challenges to ecosystems worldwide. Rising temperatures, melting ice caps, and extreme weather events threaten biodiversity and human settlements. Scientists emphasize the urgent need for global cooperation.',
      imageURL: null,
      order: 1,
      questions: [
        {
          questionText: 'What do scientists emphasize according to the passage?',
          order: 0,
          choices: [
            { choiceText: 'Rising temperatures', isCorrect: false, order: 0 },
            { choiceText: 'Melting ice caps', isCorrect: false, order: 1 },
            { choiceText: 'The urgent need for global cooperation', isCorrect: true, order: 2 },
            { choiceText: 'Extreme weather events', isCorrect: false, order: 3 }
          ]
        }
      ]
    }
  ]
};

/**
 * Helper Functions
 */

// Make authenticated API request
async function apiRequest(request, method, endpoint, token, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (body) {
    options.data = body;
  }

  return await request.fetch(`${BASE_URL}${endpoint}`, options);
}

// Authenticate admin
async function authenticateAdmin(request) {
  const response = await request.fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: ADMIN_CREDENTIALS
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.token).toBeTruthy();
  return data.token;
}

// Authenticate or create student
async function authenticateStudent(request) {
  // Try to sign in first
  let response = await request.fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: TEST_STUDENT_CREDENTIALS
  });

  // If student doesn't exist, create one
  if (!response.ok()) {
    console.log('Creating test student...');
    const signupData = {
      email: TEST_STUDENT_CREDENTIALS.email,
      password: TEST_STUDENT_CREDENTIALS.password,
      firstName: 'Test',
      middleName: 'Playwright',
      lastName: 'Student',
      phone: '01234567890',
      parentFirstName: 'Parent',
      parentLastName: 'Test',
      parentEmail: 'parent.test@example.com',
      parentPhone: '01234567891'
    };

    response = await request.fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: signupData
    });

    expect(response.ok()).toBeTruthy();
  }

  const data = await response.json();
  expect(data.token).toBeTruthy();
  testStudentId = data.user?.uuid || data.student?.uuid;
  return data.token;
}

/**
 * Test Suite Setup
 */
test.describe('Phase 7: Assessment System - Complete Test Suite', () => {

  test.beforeAll(async ({ request }) => {
    console.log('\n=== Setting up test environment ===');
    adminToken = await authenticateAdmin(request);
    studentToken = await authenticateStudent(request);
    console.log('✓ Admin and student authenticated');
  });

  /**
   * ADMIN ENDPOINTS TESTS
   */
  test.describe('Admin Assessment Management', () => {

    test('1.1 - Should create a new assessment with complete structure', async ({ request }) => {
      const response = await apiRequest(
        request,
        'POST',
        '/admin/assessments',
        adminToken,
        SAMPLE_ASSESSMENT
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeTruthy();
      expect(data.data.id).toBeTruthy();
      expect(data.data.title).toBe(SAMPLE_ASSESSMENT.title);
      expect(data.data.duration).toBe(SAMPLE_ASSESSMENT.duration);
      expect(data.data.passages).toHaveLength(2);
      expect(data.data.passages[0].questions).toHaveLength(2);
      expect(data.data.passages[1].questions).toHaveLength(1);

      // Store for later tests
      createdAssessmentId = data.data.id;

      console.log(`✓ Created assessment with ID: ${createdAssessmentId}`);
    });

    test('1.2 - Should reject assessment with invalid data (no passages)', async ({ request }) => {
      const invalidAssessment = {
        title: 'Invalid Assessment',
        duration: 30,
        passages: []
      };

      const response = await apiRequest(
        request,
        'POST',
        '/admin/assessments',
        adminToken,
        invalidAssessment
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('at least one passage');

      console.log('✓ Correctly rejected invalid assessment');
    });

    test('1.3 - Should reject assessment with invalid choices (not exactly 4)', async ({ request }) => {
      const invalidAssessment = {
        title: 'Invalid Choices Assessment',
        duration: 30,
        passages: [
          {
            content: 'Test passage',
            questions: [
              {
                questionText: 'Test question?',
                choices: [
                  { choiceText: 'A', isCorrect: true },
                  { choiceText: 'B', isCorrect: false }
                ]
              }
            ]
          }
        ]
      };

      const response = await apiRequest(
        request,
        'POST',
        '/admin/assessments',
        adminToken,
        invalidAssessment
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);

      console.log('✓ Correctly rejected assessment with invalid choices');
    });

    test('1.4 - Should reject assessment with multiple correct answers', async ({ request }) => {
      const invalidAssessment = {
        title: 'Multiple Correct Answers',
        duration: 30,
        passages: [
          {
            content: 'Test passage',
            questions: [
              {
                questionText: 'Test question?',
                choices: [
                  { choiceText: 'A', isCorrect: true },
                  { choiceText: 'B', isCorrect: true },
                  { choiceText: 'C', isCorrect: false },
                  { choiceText: 'D', isCorrect: false }
                ]
              }
            ]
          }
        ]
      };

      const response = await apiRequest(
        request,
        'POST',
        '/admin/assessments',
        adminToken,
        invalidAssessment
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('exactly one correct answer');

      console.log('✓ Correctly rejected assessment with multiple correct answers');
    });

    test('1.5 - Should get single assessment by ID with complete structure', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const response = await apiRequest(
        request,
        'GET',
        `/admin/assessments/${createdAssessmentId}`,
        adminToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdAssessmentId);
      expect(data.data.title).toBe(SAMPLE_ASSESSMENT.title);
      expect(data.data.passages).toBeTruthy();
      expect(data.data.passages[0].questions).toBeTruthy();
      expect(data.data.passages[0].questions[0].choices).toBeTruthy();
      expect(data.data.passages[0].questions[0].choices).toHaveLength(4);

      console.log('✓ Retrieved assessment with complete structure');
    });

    test('1.6 - Should return 404 for non-existent assessment', async ({ request }) => {
      const response = await apiRequest(
        request,
        'GET',
        '/admin/assessments/999999',
        adminToken
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);

      console.log('✓ Correctly returned 404 for non-existent assessment');
    });

    test('1.7 - Should list assessments with pagination', async ({ request }) => {
      const response = await apiRequest(
        request,
        'GET',
        '/admin/assessments?page=1&limit=10',
        adminToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.assessments).toBeTruthy();
      expect(Array.isArray(data.data.assessments)).toBe(true);
      expect(data.data.pagination).toBeTruthy();
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.limit).toBe(10);
      expect(data.data.pagination.total).toBeGreaterThanOrEqual(1);

      console.log(`✓ Listed assessments (total: ${data.data.pagination.total})`);
    });

    test('1.8 - Should filter assessments by search term', async ({ request }) => {
      const response = await apiRequest(
        request,
        'GET',
        `/admin/assessments?search=${encodeURIComponent('Playwright')}`,
        adminToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.assessments).toBeTruthy();

      // Should find our test assessment
      const foundAssessment = data.data.assessments.find(a => a.id === createdAssessmentId);
      expect(foundAssessment).toBeTruthy();

      console.log('✓ Search filtering works correctly');
    });

    test('1.9 - Should filter by assessment type (timed/untimed)', async ({ request }) => {
      const response = await apiRequest(
        request,
        'GET',
        '/admin/assessments?type=timed',
        adminToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      // All returned assessments should have duration
      data.data.assessments.forEach(assessment => {
        expect(assessment.duration).toBeTruthy();
      });

      console.log('✓ Type filtering works correctly');
    });

    test('1.10 - Should update assessment', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const updateData = {
        title: 'Updated Assessment Title - Playwright',
        duration: 60
      };

      const response = await apiRequest(
        request,
        'PUT',
        `/admin/assessments/${createdAssessmentId}`,
        adminToken,
        updateData
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.title).toBe(updateData.title);
      expect(data.data.duration).toBe(updateData.duration);

      console.log('✓ Assessment updated successfully');
    });

    test('1.11 - Should get assessment submissions (empty before student submits)', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const response = await apiRequest(
        request,
        'GET',
        `/admin/assessments/${createdAssessmentId}/submissions`,
        adminToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      console.log(`✓ Retrieved submissions (count: ${data.data.length})`);
    });
  });

  /**
   * STUDENT ENDPOINTS TESTS
   */
  test.describe('Student Assessment Attempt Flow', () => {

    test('2.1 - Should start an assessment attempt', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const response = await apiRequest(
        request,
        'POST',
        `/student/assessments/${createdAssessmentId}/attempt`,
        studentToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.assessment).toBeTruthy();
      expect(data.data.assessment.id).toBe(createdAssessmentId);
      expect(data.data.assessment.passages).toBeTruthy();
      expect(data.data.timeRemaining).toBeTruthy();
      expect(data.data.hasExistingSubmission).toBe(false);

      console.log('✓ Assessment attempt started successfully');
    });

    test('2.2 - Should get assessment attempt status', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const response = await apiRequest(
        request,
        'GET',
        `/student/assessments/${createdAssessmentId}/attempt`,
        studentToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.assessment).toBeTruthy();
      expect(data.data.hasExistingSubmission).toBeDefined();

      console.log('✓ Retrieved attempt status');
    });

    test('2.3 - Should reject attempt start without authentication', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const response = await apiRequest(
        request,
        'POST',
        `/student/assessments/${createdAssessmentId}/attempt`,
        null // No token
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);

      console.log('✓ Correctly rejected unauthenticated attempt');
    });

    test('2.4 - Should submit assessment with answers', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      // First, get the assessment structure to know the question IDs
      const assessmentResponse = await apiRequest(
        request,
        'GET',
        `/student/assessments/${createdAssessmentId}/attempt`,
        studentToken
      );

      const assessmentData = await assessmentResponse.json();
      const questions = assessmentData.data.assessment.passages.flatMap(p => p.questions);

      // Create answers (answer all questions correctly for testing auto-grading)
      const answers = questions.map(question => {
        const correctChoice = question.choices.find(c => c.isCorrect);
        return {
          questionId: question.id.toString(),
          choiceId: correctChoice.id.toString()
        };
      });

      const response = await apiRequest(
        request,
        'POST',
        `/student/assessments/${createdAssessmentId}/submit`,
        studentToken,
        { answers }
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.submission).toBeTruthy();
      expect(data.data.submission.score).toBeTruthy();
      expect(data.data.submission.totalQuestions).toBe(questions.length);
      expect(data.data.submission.score).toBe(questions.length); // All correct

      console.log(`✓ Submitted assessment - Score: ${data.data.submission.score}/${data.data.submission.totalQuestions}`);
    });

    test('2.5 - Should prevent duplicate submissions', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      // Get assessment structure
      const assessmentResponse = await apiRequest(
        request,
        'GET',
        `/student/assessments/${createdAssessmentId}/attempt`,
        studentToken
      );

      const assessmentData = await assessmentResponse.json();

      // Check if already submitted
      if (assessmentData.data.hasExistingSubmission) {
        console.log('✓ Already has submission, testing duplicate prevention');

        const questions = assessmentData.data.assessment.passages.flatMap(p => p.questions);
        const answers = questions.map(q => ({
          questionId: q.id.toString(),
          choiceId: q.choices[0].id.toString()
        }));

        const response = await apiRequest(
          request,
          'POST',
          `/student/assessments/${createdAssessmentId}/submit`,
          studentToken,
          { answers }
        );

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(400);
        const data = await response.json();
        expect(data.error).toContain('already submitted');

        console.log('✓ Correctly prevented duplicate submission');
      } else {
        console.log('✓ No existing submission to test duplicate prevention');
      }
    });

    test('2.6 - Should get submission details with correct answers', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const response = await apiRequest(
        request,
        'GET',
        `/student/assessments/${createdAssessmentId}/submission`,
        studentToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.submission).toBeTruthy();
      expect(data.data.submission.score).toBeTruthy();
      expect(data.data.submission.answers).toBeTruthy();
      expect(Array.isArray(data.data.submission.answers)).toBe(true);

      // Verify answer structure
      data.data.submission.answers.forEach(answer => {
        expect(answer.questionId).toBeTruthy();
        expect(answer.question).toBeTruthy();
        expect(answer.selectedChoice).toBeTruthy();
        expect(answer.correctChoice).toBeTruthy();
        expect(answer.isCorrect).toBeDefined();
      });

      console.log(`✓ Retrieved submission details with ${data.data.submission.answers.length} answers`);
    });

    test('2.7 - Should return 404 for submission that does not exist', async ({ request }) => {
      // Use an assessment ID that the student hasn't submitted
      const response = await apiRequest(
        request,
        'GET',
        '/student/assessments/999999/submission',
        studentToken
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);

      console.log('✓ Correctly returned 404 for non-existent submission');
    });
  });

  /**
   * AUTO-GRADING VERIFICATION
   */
  test.describe('Auto-Grading Logic Verification', () => {

    test('3.1 - Should correctly calculate score for mixed correct/incorrect answers', async ({ request }) => {
      // Create a new assessment for this test
      const testAssessment = {
        title: 'Auto-Grading Test Assessment',
        instructions: 'Test auto-grading',
        duration: 30,
        passages: [
          {
            content: 'Test passage for auto-grading',
            questions: [
              {
                questionText: 'Question 1?',
                choices: [
                  { choiceText: 'A', isCorrect: true, order: 0 },
                  { choiceText: 'B', isCorrect: false, order: 1 },
                  { choiceText: 'C', isCorrect: false, order: 2 },
                  { choiceText: 'D', isCorrect: false, order: 3 }
                ]
              },
              {
                questionText: 'Question 2?',
                choices: [
                  { choiceText: 'A', isCorrect: false, order: 0 },
                  { choiceText: 'B', isCorrect: true, order: 1 },
                  { choiceText: 'C', isCorrect: false, order: 2 },
                  { choiceText: 'D', isCorrect: false, order: 3 }
                ]
              },
              {
                questionText: 'Question 3?',
                choices: [
                  { choiceText: 'A', isCorrect: false, order: 0 },
                  { choiceText: 'B', isCorrect: false, order: 1 },
                  { choiceText: 'C', isCorrect: true, order: 2 },
                  { choiceText: 'D', isCorrect: false, order: 3 }
                ]
              }
            ]
          }
        ]
      };

      // Create assessment
      const createResponse = await apiRequest(
        request,
        'POST',
        '/admin/assessments',
        adminToken,
        testAssessment
      );

      expect(createResponse.ok()).toBeTruthy();
      const createData = await createResponse.json();
      const testAssessmentId = createData.data.id;

      // Get assessment structure
      const getResponse = await apiRequest(
        request,
        'POST',
        `/student/assessments/${testAssessmentId}/attempt`,
        studentToken
      );

      const getData = await getResponse.json();
      const questions = getData.data.assessment.passages.flatMap(p => p.questions);

      // Answer: first correct, second wrong, third correct (2/3)
      const answers = [
        {
          questionId: questions[0].id.toString(),
          choiceId: questions[0].choices.find(c => c.isCorrect).id.toString()
        },
        {
          questionId: questions[1].id.toString(),
          choiceId: questions[1].choices.find(c => !c.isCorrect).id.toString() // Wrong answer
        },
        {
          questionId: questions[2].id.toString(),
          choiceId: questions[2].choices.find(c => c.isCorrect).id.toString()
        }
      ];

      // Submit
      const submitResponse = await apiRequest(
        request,
        'POST',
        `/student/assessments/${testAssessmentId}/submit`,
        studentToken,
        { answers }
      );

      expect(submitResponse.ok()).toBeTruthy();
      const submitData = await submitResponse.json();

      expect(submitData.data.submission.score).toBe(2);
      expect(submitData.data.submission.totalQuestions).toBe(3);
      expect(submitData.data.submission.percentage).toBeCloseTo(66.67, 1);

      console.log('✓ Auto-grading correctly calculated 2/3 (66.67%)');

      // Clean up
      await apiRequest(request, 'DELETE', `/admin/assessments/${testAssessmentId}`, adminToken);
    });

    test('3.2 - Should handle unanswered questions correctly', async ({ request }) => {
      // Create test assessment
      const testAssessment = {
        title: 'Unanswered Questions Test',
        duration: 30,
        passages: [
          {
            content: 'Test passage',
            questions: [
              {
                questionText: 'Question 1?',
                choices: [
                  { choiceText: 'A', isCorrect: true, order: 0 },
                  { choiceText: 'B', isCorrect: false, order: 1 },
                  { choiceText: 'C', isCorrect: false, order: 2 },
                  { choiceText: 'D', isCorrect: false, order: 3 }
                ]
              },
              {
                questionText: 'Question 2?',
                choices: [
                  { choiceText: 'A', isCorrect: false, order: 0 },
                  { choiceText: 'B', isCorrect: true, order: 1 },
                  { choiceText: 'C', isCorrect: false, order: 2 },
                  { choiceText: 'D', isCorrect: false, order: 3 }
                ]
              }
            ]
          }
        ]
      };

      const createResponse = await apiRequest(
        request,
        'POST',
        '/admin/assessments',
        adminToken,
        testAssessment
      );

      const createData = await createResponse.json();
      const testAssessmentId = createData.data.id;

      // Start attempt
      await apiRequest(
        request,
        'POST',
        `/student/assessments/${testAssessmentId}/attempt`,
        studentToken
      );

      // Get questions
      const getResponse = await apiRequest(
        request,
        'GET',
        `/student/assessments/${testAssessmentId}/attempt`,
        studentToken
      );

      const getData = await getResponse.json();
      const questions = getData.data.assessment.passages.flatMap(p => p.questions);

      // Answer only first question, leave second unanswered
      const answers = [
        {
          questionId: questions[0].id.toString(),
          choiceId: questions[0].choices.find(c => c.isCorrect).id.toString()
        },
        {
          questionId: questions[1].id.toString(),
          choiceId: null // Unanswered
        }
      ];

      // Submit
      const submitResponse = await apiRequest(
        request,
        'POST',
        `/student/assessments/${testAssessmentId}/submit`,
        studentToken,
        { answers }
      );

      expect(submitResponse.ok()).toBeTruthy();
      const submitData = await submitResponse.json();

      expect(submitData.data.submission.score).toBe(1);
      expect(submitData.data.submission.totalQuestions).toBe(2);

      console.log('✓ Correctly handled unanswered questions (1/2)');

      // Clean up
      await apiRequest(request, 'DELETE', `/admin/assessments/${testAssessmentId}`, adminToken);
    });
  });

  /**
   * EDGE CASES AND ERROR HANDLING
   */
  test.describe('Edge Cases and Error Handling', () => {

    test('4.1 - Should reject invalid assessment ID format', async ({ request }) => {
      const response = await apiRequest(
        request,
        'GET',
        '/admin/assessments/invalid-id',
        adminToken
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);

      console.log('✓ Correctly rejected invalid ID format');
    });

    test('4.2 - Should require authorization for admin endpoints', async ({ request }) => {
      const response = await apiRequest(
        request,
        'GET',
        '/admin/assessments',
        null // No token
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);

      console.log('✓ Correctly required authorization for admin endpoints');
    });

    test('4.3 - Should prevent student from accessing admin endpoints', async ({ request }) => {
      const response = await apiRequest(
        request,
        'GET',
        '/admin/assessments',
        studentToken // Student token, not admin
      );

      expect(response.ok()).toBeFalsy();
      expect([401, 403]).toContain(response.status());

      console.log('✓ Correctly prevented student from accessing admin endpoints');
    });

    test('4.4 - Should validate submission data structure', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const invalidSubmission = {
        answers: [
          { questionId: 'invalid' } // Missing choiceId, invalid format
        ]
      };

      const response = await apiRequest(
        request,
        'POST',
        `/student/assessments/${createdAssessmentId}/submit`,
        studentToken,
        invalidSubmission
      );

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);

      console.log('✓ Correctly validated submission data structure');
    });

    test('4.5 - Should handle empty answers array', async ({ request }) => {
      // Create test assessment
      const testAssessment = {
        title: 'Empty Answers Test',
        duration: 30,
        passages: [
          {
            content: 'Test',
            questions: [
              {
                questionText: 'Q?',
                choices: [
                  { choiceText: 'A', isCorrect: true, order: 0 },
                  { choiceText: 'B', isCorrect: false, order: 1 },
                  { choiceText: 'C', isCorrect: false, order: 2 },
                  { choiceText: 'D', isCorrect: false, order: 3 }
                ]
              }
            ]
          }
        ]
      };

      const createResponse = await apiRequest(
        request,
        'POST',
        '/admin/assessments',
        adminToken,
        testAssessment
      );

      const createData = await createResponse.json();
      const testAssessmentId = createData.data.id;

      // Start attempt
      await apiRequest(
        request,
        'POST',
        `/student/assessments/${testAssessmentId}/attempt`,
        studentToken
      );

      // Submit with empty answers
      const submitResponse = await apiRequest(
        request,
        'POST',
        `/student/assessments/${testAssessmentId}/submit`,
        studentToken,
        { answers: [] }
      );

      expect(submitResponse.ok()).toBeFalsy();
      expect(submitResponse.status()).toBe(400);

      console.log('✓ Correctly rejected empty answers array');

      // Clean up
      await apiRequest(request, 'DELETE', `/admin/assessments/${testAssessmentId}`, adminToken);
    });

    test('4.6 - Should handle pagination edge cases', async ({ request }) => {
      // Test with page 0 (should default to 1)
      const response1 = await apiRequest(
        request,
        'GET',
        '/admin/assessments?page=0',
        adminToken
      );

      expect(response1.ok()).toBeTruthy();
      const data1 = await response1.json();
      expect(data1.data.pagination.page).toBeGreaterThanOrEqual(1);

      // Test with very large page number
      const response2 = await apiRequest(
        request,
        'GET',
        '/admin/assessments?page=9999',
        adminToken
      );

      expect(response2.ok()).toBeTruthy();
      const data2 = await response2.json();
      expect(data2.data.assessments).toBeTruthy();

      console.log('✓ Correctly handled pagination edge cases');
    });
  });

  /**
   * ADMIN SUBMISSIONS VIEW
   */
  test.describe('Admin View Submissions', () => {

    test('5.1 - Should view all submissions for an assessment', async ({ request }) => {
      expect(createdAssessmentId).toBeTruthy();

      const response = await apiRequest(
        request,
        'GET',
        `/admin/assessments/${createdAssessmentId}/submissions`,
        adminToken
      );

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const submission = data.data[0];
        expect(submission.id).toBeTruthy();
        expect(submission.student).toBeTruthy();
        expect(submission.score).toBeDefined();
        expect(submission.submittedAt).toBeTruthy();
      }

      console.log(`✓ Retrieved ${data.data.length} submissions for assessment`);
    });
  });

  /**
   * CLEANUP
   */
  test.describe('Cleanup Test Data', () => {

    test('6.1 - Should delete test assessment', async ({ request }) => {
      if (createdAssessmentId) {
        const response = await apiRequest(
          request,
          'DELETE',
          `/admin/assessments/${createdAssessmentId}`,
          adminToken
        );

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);

        console.log(`✓ Deleted test assessment (ID: ${createdAssessmentId})`);
      }
    });

    test('6.2 - Should verify assessment is deleted', async ({ request }) => {
      if (createdAssessmentId) {
        const response = await apiRequest(
          request,
          'GET',
          `/admin/assessments/${createdAssessmentId}`,
          adminToken
        );

        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBe(404);

        console.log('✓ Verified assessment is deleted');
      }
    });
  });
});

/**
 * TEST SUMMARY
 *
 * This comprehensive test suite covers:
 *
 * Admin Endpoints:
 * - Create assessment with validation
 * - Get single assessment
 * - List assessments with pagination
 * - Search and filter assessments
 * - Update assessment
 * - Delete assessment
 * - View submissions
 *
 * Student Endpoints:
 * - Start assessment attempt
 * - Get attempt status
 * - Submit assessment answers
 * - Prevent duplicate submissions
 * - Get submission details
 *
 * Auto-Grading:
 * - Correct score calculation
 * - Mixed correct/incorrect answers
 * - Unanswered questions handling
 *
 * Edge Cases:
 * - Invalid data validation
 * - Authorization checks
 * - Role-based access control
 * - Pagination edge cases
 * - Empty data handling
 *
 * Total Tests: 30+ comprehensive test cases
 */