// 🔍 Test Session API Connection
// Run this in browser console to debug DB connection

console.log('🔍 TESTING SESSION API CONNECTION');
console.log('=' .repeat(50));

async function testSessionAPI() {
  try {
    console.log('\n📡 Testing POST /api/sessions...');
    
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learningMode: 'Learn',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Session created:', data);
      
      // Test GET
      console.log('\n📡 Testing GET /api/sessions...');
      const getResponse = await fetch('/api/sessions');
      console.log('GET Response status:', getResponse.status);
      
      if (getResponse.ok) {
        const sessions = await getResponse.json();
        console.log('✅ SUCCESS - Sessions retrieved:', sessions);
      } else {
        const errorText = await getResponse.text();
        console.log('❌ GET Error:', errorText);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ POST Error:', response.status, errorText);
      
      // Common issues to check
      if (response.status === 401) {
        console.log('💡 AUTH ISSUE: You might not be logged in');
        console.log('💡 Try logging in first, then run this test again');
      }
      if (response.status === 500) {
        console.log('💡 SERVER ERROR: Database connection or model issue');
      }
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error);
    console.log('💡 This suggests the API endpoint might not exist or server is down');
  }
}

// Auto-run the test
testSessionAPI();

console.log('\n🎯 NEXT STEPS:');
console.log('1. Check the output above for errors');
console.log('2. If 401 error: Log in to the app first');
console.log('3. If 500 error: Check server logs for database issues');
console.log('4. If network error: Make sure dev server is running');
