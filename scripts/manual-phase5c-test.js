// Manual Phase 5C Test - Run in Browser Console
// Open browser, navigate to DrLeeGPT, open Developer Tools (F12), paste and run

console.log('🚀 MANUAL PHASE 5C TEST STARTING...');
console.log('=' .repeat(50));

// Test 1: Check UI Elements
console.log('\n📋 TEST 1: UI Elements Check');
const debugBtn = document.querySelector('button[title="Debug Session & API"]');
const healthBtn = document.querySelector('button[title="Advanced Queue Health Monitoring"]');

console.log('🐛 Debug Button:', debugBtn ? '✅ FOUND' : '❌ MISSING');
console.log('❤️‍🩹 Health Button:', healthBtn ? '✅ FOUND' : '❌ MISSING');

// Test 2: SessionManager Methods
console.log('\n📋 TEST 2: SessionManager Health Methods');
if (typeof sessionManager !== 'undefined') {
  console.log('📊 SessionManager Available: ✅');
  
  const methods = ['getHealthStatus', 'getPerformanceTrends', 'setupHealthAlerts'];
  methods.forEach(method => {
    const exists = typeof sessionManager[method] === 'function';
    console.log(`📊 ${method}:`, exists ? '✅ Available' : '❌ Missing');
  });
  
  // Test health status
  try {
    const health = sessionManager.getHealthStatus();
    console.log('🏥 Health Status Test:', health ? '✅ Working' : '❌ Failed');
    if (health) {
      console.log('   📊 Overall Status:', health.overall);
      console.log('   📊 Score:', health.score);
      console.log('   📊 Alerts:', health.alerts?.length || 0);
    }
  } catch (error) {
    console.log('🏥 Health Status Test: ❌ Error -', error.message);
  }
} else {
  console.log('📊 SessionManager: ❌ NOT AVAILABLE');
}

// Test 3: Debug Button Click
console.log('\n📋 TEST 3: Debug Button Test');
if (debugBtn) {
  console.log('🐛 Attempting to click debug button...');
  debugBtn.click();
  console.log('🐛 Debug button clicked! Check for alert and console output.');
} else {
  console.log('🐛 Cannot test - button not found');
}

// Test 4: Health Button Click
console.log('\n📋 TEST 4: Health Button Test');
if (healthBtn) {
  console.log('❤️‍🩹 Attempting to click health monitoring button...');
  healthBtn.click();
  
  // Check if dashboard appeared
  setTimeout(() => {
    const dashboard = document.querySelector('[class*="HealthMonitoring"]') || 
                    document.querySelector('[aria-label*="health"]') ||
                    document.querySelector('.bg-white.rounded-xl.shadow-2xl');
    console.log('❤️‍🩹 Health Dashboard:', dashboard ? '✅ OPENED' : '❌ NOT VISIBLE');
    
    if (dashboard) {
      console.log('   📊 Dashboard element found:', dashboard.tagName);
      // Try to close it
      const closeBtn = dashboard.querySelector('button[title*="Close"]') || 
                      dashboard.querySelector('button:last-child');
      if (closeBtn) {
        console.log('   🔴 Closing dashboard...');
        closeBtn.click();
      }
    }
  }, 500);
} else {
  console.log('❤️‍🩹 Cannot test - button not found');
}

// Test 5: Integration Status
console.log('\n📋 TEST 5: Phase 5C Integration Status');
console.log('🔄 Queue Integration:', typeof sessionQueue !== 'undefined' ? '✅' : '❌');
console.log('🔄 Health Monitor:', typeof queueHealthMonitor !== 'undefined' ? '✅' : '❌');

console.log('\n🎯 MANUAL TEST COMPLETE!');
console.log('=' .repeat(50));
console.log('✅ Results logged above');
console.log('✅ Check for alerts and dashboard visibility');
console.log('✅ Try clicking buttons manually to verify UI');
console.log('\n📝 Expected Results:');
console.log('   🐛 Debug button should show alert');
console.log('   ❤️‍🩹 Health button should open modal dashboard');
console.log('   📊 All methods should be available');
console.log('   🔄 Integration should show ✅ status');
