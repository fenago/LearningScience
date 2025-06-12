// 🔧 Health Monitoring Integration Patch
// Copy and paste this code AFTER line 1280 in page.tsx, before setStreamingMessage('');

// Phase 5C: Record health monitoring metrics for real-time dashboard
try {
  const { sessionQueue } = await import('@/libs/sessionQueue');
  const { queueHealthMonitor } = await import('@/libs/queueHealthMonitor');
  
  // Record chat completion metrics
  await sessionQueue.addToQueue({
    type: 'chat_completion',
    sessionId: currentSession?.sessionId || 'local_fallback',
    data: {
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
      processingTime: assistantMessage.performanceMetrics?.generationTime || 0,
      tokenCount: assistantMessage.performanceMetrics?.tokenCount?.output || 0,
      success: true,
      timestamp: new Date()
    }
  });
  
  // Process queue and record health metrics
  await sessionQueue.processQueue();
  
  // Make available globally for testing
  (window as any).sessionQueue = sessionQueue;
  (window as any).queueHealthMonitor = queueHealthMonitor;
  
} catch (healthError) {
  console.warn('Health monitoring update failed:', healthError);
}

// ALSO ADD THIS to the session initialization useEffect (around line 1082):

// Phase 5C: Setup health monitoring libraries globally
const setupHealthMonitoring = async () => {
  try {
    const { sessionQueue } = await import('@/libs/sessionQueue');
    const { queueHealthMonitor } = await import('@/libs/queueHealthMonitor');
    
    // Make globally accessible for browser console testing
    (window as any).sessionQueue = sessionQueue;
    (window as any).queueHealthMonitor = queueHealthMonitor;
    (window as any).sessionManager = sessionManager;
    
    console.log('🔧 Health monitoring libraries loaded globally');
  } catch (error) {
    console.warn('Failed to load health monitoring libraries:', error);
  }
};

setupHealthMonitoring(); // Add this call after initSession();
