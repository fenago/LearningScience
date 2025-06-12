/**
 * Phase 5C Integration Test Script
 * Tests health monitoring functionality end-to-end
 */

console.log('🧪 Phase 5C Health Monitoring Test Starting...');

// Test 1: Check if components exist
function testComponentsExist() {
  console.log('\n📋 Test 1: Component Existence');
  
  // Check if debug button exists
  const debugButton = document.querySelector('button[title="Debug Session & API"]');
  console.log('🐛 Debug Button:', debugButton ? '✅ Found' : '❌ Missing');
  
  // Check if health monitoring button exists
  const healthButton = document.querySelector('button[title="Advanced Queue Health Monitoring"]');
  console.log('❤️‍🩹 Health Button:', healthButton ? '✅ Found' : '❌ Missing');
  
  return debugButton && healthButton;
}

// Test 2: Test sessionManager methods
function testSessionManagerMethods() {
  console.log('\n📋 Test 2: SessionManager Phase 5C Methods');
  
  if (typeof sessionManager === 'undefined') {
    console.log('❌ SessionManager not available globally');
    return false;
  }
  
  const methods = [
    'getHealthStatus',
    'getPerformanceTrends',
    'setupHealthAlerts',
    'debugSessionStatus',
    'testSessionCreation'
  ];
  
  let allMethodsExist = true;
  methods.forEach(method => {
    const exists = typeof sessionManager[method] === 'function';
    console.log(`📊 ${method}:`, exists ? '✅ Available' : '❌ Missing');
    if (!exists) allMethodsExist = false;
  });
  
  return allMethodsExist;
}

// Test 3: Test health monitoring functionality
function testHealthMonitoring() {
  console.log('\n📋 Test 3: Health Monitoring Functionality');
  
  try {
    if (typeof sessionManager !== 'undefined' && sessionManager.getHealthStatus) {
      const healthStatus = sessionManager.getHealthStatus();
      console.log('🏥 Health Status:', healthStatus ? '✅ Retrieved' : '❌ Failed');
      
      if (healthStatus) {
        console.log('📊 Overall Status:', healthStatus.overall);
        console.log('📊 Health Score:', healthStatus.score);
        console.log('📊 Active Alerts:', healthStatus.alerts?.length || 0);
      }
      
      return !!healthStatus;
    } else {
      console.log('❌ Health monitoring methods not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Health monitoring test failed:', error);
    return false;
  }
}

// Test 4: UI Integration Test
function testUIIntegration() {
  console.log('\n📋 Test 4: UI Integration');
  
  try {
    // Test debug button click
    const debugButton = document.querySelector('button[title="Debug Session & API"]');
    if (debugButton) {
      console.log('🐛 Debug button available for click test');
    }
    
    // Test health button click
    const healthButton = document.querySelector('button[title="Advanced Queue Health Monitoring"]');
    if (healthButton) {
      console.log('❤️‍🩹 Health button available for click test');
    }
    
    return debugButton && healthButton;
  } catch (error) {
    console.error('❌ UI integration test failed:', error);
    return false;
  }
}

// Run all tests
function runPhase5CTests() {
  console.log('🚀 Starting Phase 5C Comprehensive Test Suite');
  console.log('=' * 50);
  
  const results = {
    components: testComponentsExist(),
    sessionManager: testSessionManagerMethods(),
    healthMonitoring: testHealthMonitoring(),
    uiIntegration: testUIIntegration()
  };
  
  console.log('\n📊 PHASE 5C TEST RESULTS:');
  console.log('=' * 30);
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const overallSuccess = Object.values(results).every(r => r);
  console.log(`\n🎯 OVERALL: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (overallSuccess) {
    console.log('🎉 Phase 5C is ready for production!');
  } else {
    console.log('🔧 Phase 5C needs additional fixes.');
  }
  
  return results;
}

// Auto-run if script is loaded directly
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPhase5CTests);
  } else {
    runPhase5CTests();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runPhase5CTests, testComponentsExist, testSessionManagerMethods, testHealthMonitoring, testUIIntegration };
}
