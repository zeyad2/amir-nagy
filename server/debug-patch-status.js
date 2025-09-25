// Debug PATCH status endpoint
const BASE_URL = 'http://localhost:5000/api';

const testAuth = {
  email: 'admin@test.com',
  password: 'admin123'
};

async function debugPatchStatus() {
  try {
    // Step 1: Authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAuth),
    });

    const authResult = await authResponse.json();
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResult.message}`);
    }

    const authToken = authResult.token;
    console.log('✅ Authentication successful');

    // Step 2: Get current course status
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('\n📋 Getting current course status...');
    const getCurrentResponse = await fetch(`${BASE_URL}/admin/courses/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    const getCurrentResult = await getCurrentResponse.json();
    console.log(`Current status: ${getCurrentResult.data?.course?.status}`);

    // Step 3: Try to PATCH status
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('\n🔧 Attempting PATCH status...');
    const patchResponse = await fetch(`${BASE_URL}/admin/courses/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: 'archived' })
    });

    const patchResult = await patchResponse.json();

    console.log(`PATCH Response Status: ${patchResponse.status}`);
    console.log(`PATCH Response OK: ${patchResponse.ok}`);
    console.log(`PATCH Response Body:`, JSON.stringify(patchResult, null, 2));

    if (!patchResponse.ok) {
      console.log('\n❌ PATCH failed. Error details:');
      console.log(`Status: ${patchResponse.status}`);
      console.log(`Message: ${patchResult.message || patchResult.error || 'No error message'}`);

      if (patchResult.validationErrors) {
        console.log('Validation Errors:', patchResult.validationErrors);
      }
    } else {
      console.log('✅ PATCH succeeded');

      // Verify the change
      await new Promise(resolve => setTimeout(resolve, 500));
      const verifyResponse = await fetch(`${BASE_URL}/admin/courses/1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      const verifyResult = await verifyResponse.json();
      console.log(`New status: ${verifyResult.data?.course?.status}`);

      // Revert back
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetch(`${BASE_URL}/admin/courses/1/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: 'published' })
      });
      console.log('✅ Status reverted to published');
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugPatchStatus();