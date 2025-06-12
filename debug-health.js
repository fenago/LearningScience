// 🔍 Debug Health Monitoring Integration
// Run this in browser console to check what's happening

console.log('🔍 DEBUGGING HEALTH MONITORING');
console.log('=' .repeat(50));

// Step 1: Check if libraries are loaded
console.log('\n📚 Checking Global Libraries:');
console.log('sessionQueue available:', typeof window.sessionQueue !== 'undefined');
console.log('queueHealthMonitor available:', typeof window.queueHealthMonitor !== 'undefined');
console.log('sessionManager available:', typeof window.sessionManager !== 'undefined');

// Step 2: Check sessionQueue methods
if (window.sessionQueue) {
  console.log('\n📊 SessionQueue Methods:');
  console.log('addToQueue:', typeof window.sessionQueue.addToQueue);
  console.log('processQueue:', typeof window.sessionQueue.processQueue);
  console.log('recordHealthMetrics:', typeof window.sessionQueue.recordHealthMetrics);
  console.log('getQueueStatus:', typeof window.sessionQueue.getQueueStatus);
  
  // Try to get current status
  try {
    const status = window.sessionQueue.getQueueStatus();
    console.log('Current queue status:', status);
  } catch (e) {
    console.log('Error getting queue status:', e);
  }
}

// Step 3: Check health monitor
if (window.queueHealthMonitor) {
  console.log('\n🏥 Health Monitor Methods:');
  console.log('getHealthStatus:', typeof window.queueHealthMonitor.getHealthStatus);
  console.log('getPerformanceTrends:', typeof window.queueHealthMonitor.getPerformanceTrends);
  console.log('recordMetrics:', typeof window.queueHealthMonitor.recordMetrics);
  
  // Try to get current data
  try {
    const health = window.queueHealthMonitor.getHealthStatus();
    console.log('Current health status:', health);
    
    const trends = window.queueHealthMonitor.getPerformanceTrends();
    console.log('Performance trends length:', trends.length);
    console.log('Latest trend:', trends[trends.length - 1]);
  } catch (e) {
    console.log('Error getting health data:', e);
  }
}

// Step 4: Manual test - add some fake data
console.log('\n🧪 Manual Test - Adding Fake Metrics:');
try {
  if (window.queueHealthMonitor) {
    window.queueHealthMonitor.recordMetrics({
      queueLength: 2,
      processingTime: 1500,
      errorRate: 0,
      throughputPerMinute: 4,
      memoryUsage: 60
    });
    console.log('✅ Test metrics recorded successfully');
    
    // Check if it worked
    const newHealth = window.queueHealthMonitor.getHealthStatus();
    const newTrends = window.queueHealthMonitor.getPerformanceTrends();
    console.log('Updated health status:', newHealth);
    console.log('Updated trends length:', newTrends.length);
  }
} catch (e) {
  console.log('❌ Error recording test metrics:', e);
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Send a chat message in DrLeeGPT');
console.log('2. Check browser console for any "Health monitoring failed" warnings');
console.log('3. Run this script again after sending messages');
console.log('4. Look for changes in trends length or health status');
