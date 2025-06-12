// Test Health Monitoring Integration
// Run this in browser console after sending a few chat messages

console.log('🔬 TESTING HEALTH MONITORING INTEGRATION');
console.log('=' .repeat(50));

// Test 1: Check if session queue is recording activity
console.log('\n📊 TEST 1: Session Queue Activity');
try {
  if (typeof sessionQueue !== 'undefined') {
    console.log('✅ Session Queue Available');
    
    // Manually trigger health metrics recording
    sessionQueue.recordHealthMetrics();
    console.log('✅ Health metrics recorded manually');
    
    // Check queue status
    const queueStatus = sessionQueue.getQueueStatus();
    console.log('📈 Queue Status:', queueStatus);
  } else {
    console.log('❌ Session Queue not available globally');
  }
} catch (error) {
  console.log('❌ Session Queue Error:', error.message);
}

// Test 2: Check health monitor data
console.log('\n🏥 TEST 2: Health Monitor Data');
try {
  if (typeof queueHealthMonitor !== 'undefined') {
    console.log('✅ Health Monitor Available');
    
    const healthStatus = queueHealthMonitor.getHealthStatus();
    console.log('📊 Health Status:', healthStatus);
    
    const trends = queueHealthMonitor.getPerformanceTrends();
    console.log('📈 Performance Trends:', trends);
    
    // Manually record some metrics to test
    queueHealthMonitor.recordMetrics({
      queueLength: 2,
      processingTime: 1500,
      errorRate: 0,
      throughputPerMinute: 4,
      memoryUsage: 45
    });
    console.log('✅ Test metrics recorded');
    
    // Check health again
    const newHealthStatus = queueHealthMonitor.getHealthStatus();
    console.log('📊 Updated Health Status:', newHealthStatus);
    
  } else {
    console.log('❌ Health Monitor not available globally');
  }
} catch (error) {
  console.log('❌ Health Monitor Error:', error.message);
}

// Test 3: Trigger manual health dashboard refresh
console.log('\n🔄 TEST 3: Dashboard Refresh');
try {
  // Force refresh the health dashboard if it's open
  const healthButton = document.querySelector('button[title="Advanced Queue Health Monitoring"]');
  if (healthButton) {
    console.log('✅ Health Button Found');
    healthButton.click();
    
    setTimeout(() => {
      console.log('🔄 Dashboard should be refreshed with new data');
      console.log('👀 Check the dashboard for updated metrics');
    }, 1000);
  } else {
    console.log('❌ Health Button not found');
  }
} catch (error) {
  console.log('❌ Dashboard Refresh Error:', error.message);
}

// Test 4: Simulate chat activity for health monitoring
console.log('\n💬 TEST 4: Simulate Chat Activity');
console.log('📝 Instructions:');
console.log('1. Send a few chat messages to DrLeeGPT');
console.log('2. Run this script again after sending messages');
console.log('3. Click the health monitor button (❤️‍🩹)');
console.log('4. Check if metrics show real activity');

console.log('\n🎯 INTEGRATION TEST COMPLETE');
console.log('=' .repeat(50));
console.log('✅ If you see "Test metrics recorded" above, health monitoring is working');
console.log('✅ Send more chat messages and rerun this test');
console.log('✅ The health dashboard should show real-time activity');
