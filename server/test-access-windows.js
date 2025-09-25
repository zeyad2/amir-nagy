// Using native fetch (Node.js 18+)

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testAuth = {
  email: 'admin@test.com',
  password: 'admin123'
};

async function authenticate() {
  try {
    const response = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAuth),
    });

    const result = await response.json();

    if (response.ok && result.token) {
      authToken = result.token;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.error('❌ Authentication failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return false;
  }
}

async function testEndpoint(method, path, body = null, description = '') {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}/admin${path}`, options);
    const result = await response.json();

    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${method} ${path} (${response.status})`);

    if (description) {
      console.log(`   ${description}`);
    }

    if (!response.ok) {
      console.log(`   Error: ${result.message || result.error || 'Unknown error'}`);
    } else if (result.data) {
      // Show relevant response data
      if (result.data.accessWindow) {
        const aw = result.data.accessWindow;
        console.log(`   Created Access Window: ID ${aw.id}, Sessions ${aw.startSessionId}-${aw.endSessionId}`);
        console.log(`   Price: ${aw.pricing?.calculatedPrice || 'N/A'} EGP (${aw.pricing?.accessibleSessions || 0} sessions)`);
      } else if (result.data.accessWindows) {
        console.log(`   Found ${result.data.accessWindows.length} access windows`);
      } else if (result.data.course) {
        console.log(`   Course: ${result.data.course.title}`);
      } else if (result.data.pricing) {
        console.log(`   Calculated Price: ${result.data.pricing.calculatedPrice} EGP`);
        console.log(`   Sessions: ${result.data.sessions.accessibleSessions}/${result.data.sessions.totalSessions}`);
      }
    }

    return { success: response.ok, data: result.data, status: response.status };
  } catch (error) {
    console.log(`❌ ${method} ${path} - Network Error`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Access Window API Tests\n');

  // Step 1: Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  console.log('\n📋 Testing Access Window Endpoints:\n');

  // First, test a known working endpoint to verify our setup
  await testEndpoint('GET', '/courses', null, 'Test known endpoint (courses)');
  await testEndpoint('GET', '/access-windows/by-course/1', null, 'Test access-windows route exists (should get 404 or data, not route not found)');

  // Test 1: Calculate access window pricing (should work without creating anything)
  await testEndpoint('POST', '/access-windows/calculate', {
    courseId: '1',
    startSessionId: '1',
    endSessionId: '2'
  }, 'Calculate pricing for sessions 1-2');

  // Test 2: Try to create access window (might fail if enrollment doesn't exist)
  const createResult = await testEndpoint('POST', '/access-windows', {
    enrollmentId: '1', // Assuming enrollment ID 1 exists based on our data check
    startSessionId: '1',
    endSessionId: '2'
  }, 'Create access window for enrollment 1');

  let createdAccessWindowId = null;
  if (createResult.success && createResult.data.accessWindow) {
    createdAccessWindowId = createResult.data.accessWindow.id;
  }

  // Test 3: Get access windows by course
  await testEndpoint('GET', '/access-windows/by-course/1', null, 'Get access windows for course 1');

  // Test 4: Get access windows by enrollment
  await testEndpoint('GET', '/access-windows/by-enrollment/1', null, 'Get access windows for enrollment 1');

  // Test 5: Update access window (if one was created)
  if (createdAccessWindowId) {
    await testEndpoint('PUT', `/access-windows/${createdAccessWindowId}`, {
      endSessionId: '2'
    }, `Update access window ${createdAccessWindowId}`);
  }

  // Test 6: Error cases
  console.log('\n🧪 Testing Error Cases:\n');

  // Invalid session order
  await testEndpoint('POST', '/access-windows/calculate', {
    courseId: '1',
    startSessionId: '2',
    endSessionId: '1' // End before start - should fail
  }, 'Invalid session order (should fail)');

  // Non-existent enrollment
  await testEndpoint('POST', '/access-windows', {
    enrollmentId: '99999',
    startSessionId: '1',
    endSessionId: '2'
  }, 'Non-existent enrollment (should fail)');

  // Non-existent course
  await testEndpoint('POST', '/access-windows/calculate', {
    courseId: '99999',
    startSessionId: '1',
    endSessionId: '1'
  }, 'Non-existent course (should fail)');

  // Test 7: Delete access window (if one was created)
  if (createdAccessWindowId) {
    await testEndpoint('DELETE', `/access-windows/${createdAccessWindowId}`, null, `Delete access window ${createdAccessWindowId}`);
  }

  console.log('\n🏁 Access Window API Tests Complete!');
}

// Run the tests
runTests().catch(console.error);