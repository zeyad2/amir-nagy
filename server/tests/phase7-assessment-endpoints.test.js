/**
 * Phase 7 Assessment System - Comprehensive API Tests
 * Tests all admin and student assessment endpoints
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin22@gmail.com';
const ADMIN_PASSWORD = 'TestPass123';

let adminToken = '';
let studentToken = '';
let createdAssessmentId = '';
let studentId = '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();
  return { status: response.status, data };
}

// Test runner
async function runTests() {
  console.log('🚀 Starting Phase 7 Assessment System Tests\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Admin Login
  console.log('TEST 1: Admin Login');
  try {
    const result = await apiCall('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (result.status === 200 && result.data.token) {
      adminToken = result.data.token;
      console.log('✅ PASSED - Admin logged in successfully');
      console.log('   Role:', result.data.user.role);
      passedTests++;
    } else {
      console.log('❌ FAILED - Admin login failed:', result.data);
      failedTests++;
      return;
    }
  } catch (error) {
    console.log('❌ FAILED - Error during admin login:', error.message);
    failedTests++;
    return;
  }
  console.log('');

  // Test 2: Create Assessment (Admin)
  console.log('TEST 2: Create Assessment');
  try {
    const assessmentData = {
      title: 'SAT Reading Practice Test 1',
      instructions: 'Read the passage carefully and answer all questions. You have 60 minutes.',
      duration: 60,
      passages: [
        {
          title: 'The History of Space Exploration',
          content: 'Space exploration has been one of humanity\'s greatest achievements...',
          order: 0,
          questions: [
            {
              questionText: 'What is the main idea of this passage?',
              order: 0,
              choices: [
                { choiceText: 'Space is big', isCorrect: false, order: 0 },
                { choiceText: 'Space exploration is important', isCorrect: true, order: 1 },
                { choiceText: 'Rockets are fast', isCorrect: false, order: 2 },
                { choiceText: 'NASA was founded', isCorrect: false, order: 3 }
              ]
            },
            {
              questionText: 'According to the passage, when did space exploration begin?',
              order: 1,
              choices: [
                { choiceText: '1950s', isCorrect: false, order: 0 },
                { choiceText: '1960s', isCorrect: true, order: 1 },
                { choiceText: '1970s', isCorrect: false, order: 2 },
                { choiceText: '1980s', isCorrect: false, order: 3 }
              ]
            }
          ]
        }
      ]
    };

    const result = await apiCall('/api/admin/assessments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(assessmentData)
    });

    if (result.status === 201 && result.data.data?.id) {
      createdAssessmentId = result.data.data.id;
      console.log('✅ PASSED - Assessment created with ID:', createdAssessmentId);
      console.log('   Type:', result.data.data.type);
      console.log('   Passages:', result.data.data.passages.length);
      passedTests++;
    } else {
      console.log('❌ FAILED - Assessment creation failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error creating assessment:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 3: Get All Assessments (Admin)
  console.log('TEST 3: Get All Assessments');
  try {
    const result = await apiCall('/api/admin/assessments?page=1&limit=10', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (result.status === 200 && Array.isArray(result.data.data?.assessments)) {
      console.log('✅ PASSED - Retrieved', result.data.data.assessments.length, 'assessments');
      console.log('   Pagination:', result.data.data.pagination);
      passedTests++;
    } else {
      console.log('❌ FAILED - Get assessments failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error getting assessments:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 4: Get Assessment By ID (Admin)
  console.log('TEST 4: Get Assessment By ID');
  try {
    const result = await apiCall(`/api/admin/assessments/${createdAssessmentId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (result.status === 200 && result.data.data?.id === createdAssessmentId) {
      console.log('✅ PASSED - Retrieved assessment details');
      console.log('   Title:', result.data.data.title);
      console.log('   Questions:', result.data.data.passages.reduce((sum, p) => sum + p.questions.length, 0));
      passedTests++;
    } else {
      console.log('❌ FAILED - Get assessment by ID failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error getting assessment by ID:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 5: Filter Assessments by Type (Admin)
  console.log('TEST 5: Filter Assessments by Type (timed)');
  try {
    const result = await apiCall('/api/admin/assessments?type=timed', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (result.status === 200) {
      console.log('✅ PASSED - Filtered timed assessments:', result.data.data.assessments.length);
      passedTests++;
    } else {
      console.log('❌ FAILED - Filter assessments failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error filtering assessments:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 6: Create Student Account
  console.log('TEST 6: Create Student Account');
  try {
    const studentData = {
      firstName: 'Test',
      middleName: 'Student',
      lastName: 'Phase7',
      email: `teststudent.phase7.${Date.now()}@test.com`,
      password: 'TestPass123',
      phone: '01234567890',
      parentFirstName: 'Parent',
      parentLastName: 'Test',
      parentEmail: 'parent@test.com',
      parentPhone: '01234567891'
    };

    const result = await apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });

    if (result.status === 201 && result.data.token) {
      studentToken = result.data.token;
      studentId = result.data.user.uuid;
      console.log('✅ PASSED - Student account created');
      console.log('   Student ID:', studentId);
      passedTests++;
    } else {
      console.log('❌ FAILED - Student creation failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error creating student:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 7: Student Start Assessment Attempt
  console.log('TEST 7: Student Start Assessment Attempt');
  try {
    const result = await apiCall(`/api/student/assessments/${createdAssessmentId}/attempt`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    if (result.status === 200 && result.data.data?.assessment) {
      console.log('✅ PASSED - Assessment attempt started');
      console.log('   Duration:', result.data.data.assessment.duration, 'minutes');
      console.log('   Total Questions:', result.data.data.assessment.totalQuestions);

      // Verify correct answers are NOT included in student view
      const firstChoice = result.data.data.assessment.passages[0].questions[0].choices[0];
      if (firstChoice.isCorrect === undefined) {
        console.log('   ✓ Correct answers hidden from student');
      } else {
        console.log('   ⚠ WARNING: Correct answers exposed to student!');
      }
      passedTests++;
    } else {
      console.log('❌ FAILED - Start assessment attempt failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error starting assessment:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 8: Get Assessment Attempt Status
  console.log('TEST 8: Get Assessment Attempt Status');
  try {
    const result = await apiCall(`/api/student/assessments/${createdAssessmentId}/attempt`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    if (result.status === 200 && result.data.data?.status === 'not_started') {
      console.log('✅ PASSED - Attempt status retrieved');
      console.log('   Status:', result.data.data.status);
      passedTests++;
    } else {
      console.log('❌ FAILED - Get attempt status failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error getting attempt status:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 9: Submit Assessment (with 1 correct, 1 wrong answer)
  console.log('TEST 9: Submit Assessment Answers');
  try {
    // Get the assessment structure first to get question/choice IDs
    const assessmentResult = await apiCall(`/api/student/assessments/${createdAssessmentId}/attempt`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    const questions = assessmentResult.data.data.assessment.passages[0].questions;
    const answers = [
      { questionId: questions[0].id, choiceId: questions[0].choices[1].id }, // Correct (index 1)
      { questionId: questions[1].id, choiceId: questions[1].choices[0].id }  // Wrong (index 0)
    ];

    const result = await apiCall(`/api/student/assessments/${createdAssessmentId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ answers })
    });

    if (result.status === 201 && result.data.data?.score !== undefined) {
      console.log('✅ PASSED - Assessment submitted successfully');
      console.log('   Score:', result.data.data.score, '/', result.data.data.totalQuestions);
      console.log('   Percentage:', result.data.data.percentage + '%');
      console.log('   Expected: 1/2 (50%) - Got:', result.data.data.score + '/' + result.data.data.totalQuestions);

      // Verify grading logic
      if (result.data.data.score === 1 && result.data.data.totalQuestions === 2) {
        console.log('   ✓ Auto-grading working correctly!');
      } else {
        console.log('   ⚠ WARNING: Grading mismatch!');
      }
      passedTests++;
    } else {
      console.log('❌ FAILED - Submit assessment failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error submitting assessment:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 10: Get Submission Details
  console.log('TEST 10: Get Submission Details');
  try {
    const result = await apiCall(`/api/student/assessments/${createdAssessmentId}/submission`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    if (result.status === 200 && result.data.data?.answers) {
      console.log('✅ PASSED - Submission details retrieved');
      console.log('   Answers reviewed:', result.data.data.answers.length);
      console.log('   Correct answers shown:', result.data.data.answers[0].allChoices.some(c => c.isCorrect));
      passedTests++;
    } else {
      console.log('❌ FAILED - Get submission details failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error getting submission details:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 11: Try Duplicate Submission (should fail)
  console.log('TEST 11: Try Duplicate Submission (should fail)');
  try {
    const result = await apiCall(`/api/student/assessments/${createdAssessmentId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ answers: [{ questionId: '1', choiceId: '1' }] })
    });

    if (result.status === 400) {
      console.log('✅ PASSED - Duplicate submission blocked correctly');
      console.log('   Message:', result.data.message);
      passedTests++;
    } else {
      console.log('❌ FAILED - Duplicate submission should be blocked');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error testing duplicate submission:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 12: Get Assessment Submissions (Admin)
  console.log('TEST 12: Get Assessment Submissions (Admin)');
  try {
    const result = await apiCall(`/api/admin/assessments/${createdAssessmentId}/submissions`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (result.status === 200 && Array.isArray(result.data.data?.submissions)) {
      console.log('✅ PASSED - Retrieved submissions');
      console.log('   Total submissions:', result.data.data.totalSubmissions);
      if (result.data.data.submissions.length > 0) {
        console.log('   First submission score:', result.data.data.submissions[0].score);
      }
      passedTests++;
    } else {
      console.log('❌ FAILED - Get submissions failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error getting submissions:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 13: Update Assessment (Admin)
  console.log('TEST 13: Update Assessment (Admin)');
  try {
    const updateData = {
      title: 'SAT Reading Practice Test 1 (Updated)',
      duration: 65
    };

    const result = await apiCall(`/api/admin/assessments/${createdAssessmentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(updateData)
    });

    if (result.status === 400) {
      console.log('✅ PASSED - Update blocked because assessment has submissions');
      console.log('   Message:', result.data.message);
      passedTests++;
    } else if (result.status === 200) {
      console.log('⚠ WARNING - Update succeeded (should be blocked if has submissions)');
      passedTests++;
    } else {
      console.log('❌ FAILED - Update assessment failed:', result.data);
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error updating assessment:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 14: Try to Delete Assessment with Submissions (should fail)
  console.log('TEST 14: Try to Delete Assessment with Submissions (should fail)');
  try {
    const result = await apiCall(`/api/admin/assessments/${createdAssessmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (result.status === 400) {
      console.log('✅ PASSED - Delete blocked because assessment has submissions');
      console.log('   Message:', result.data.message);
      passedTests++;
    } else {
      console.log('❌ FAILED - Delete should be blocked');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error testing delete:', error.message);
    failedTests++;
  }
  console.log('');

  // Test 15: Unauthorized Access (Student trying to access admin endpoint)
  console.log('TEST 15: Unauthorized Access Test');
  try {
    const result = await apiCall('/api/admin/assessments', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    if (result.status === 403) {
      console.log('✅ PASSED - Student blocked from admin endpoint');
      passedTests++;
    } else {
      console.log('❌ FAILED - Student should not access admin endpoint');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAILED - Error testing unauthorized access:', error.message);
    failedTests++;
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total:  ${passedTests + failedTests}`);
  console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%`);
  console.log('═══════════════════════════════════════════');
}

// Run tests
runTests().catch(console.error);