// AUTO-APPLIED FIX for Health Monitoring Integration
// This will be automatically applied to page.tsx

export const healthMonitoringPatch = {
  // Insert after line 1280 in sendMessage function (before setStreamingMessage(''))
  sendMessagePatch: `
      // Phase 5C: Health monitoring integration
      try {
        const { sessionQueue } = await import('@/libs/sessionQueue');
        await sessionQueue.addToQueue({
          type: 'chat_completion',
          sessionId: currentSession?.sessionId || 'local_fallback',
          data: {
            processingTime: assistantMessage.performanceMetrics?.generationTime || 1000,
            success: true,
            timestamp: new Date()
          }
        });
        await sessionQueue.processQueue();
        (window as any).sessionQueue = sessionQueue;
      } catch (healthError) {
        console.warn('Health monitoring failed:', healthError);
      }
`,

  // Insert after initSession() call in useEffect (around line 1082)
  useEffectPatch: `
    // Phase 5C: Setup health monitoring globally
    const setupHealthMonitoring = async () => {
      try {
        const { sessionQueue } = await import('@/libs/sessionQueue');
        const { queueHealthMonitor } = await import('@/libs/queueHealthMonitor');
        (window as any).sessionQueue = sessionQueue;
        (window as any).queueHealthMonitor = queueHealthMonitor;
        (window as any).sessionManager = sessionManager;
        console.log('🔧 Health monitoring libraries loaded globally');
      } catch (error) {
        console.warn('Failed to load health monitoring libraries:', error);
      }
    };
    setupHealthMonitoring();
`
};

// Test function to verify the fix
export const testHealthMonitoring = () => {
  console.log('🧪 Testing health monitoring integration...');
  if (typeof window !== 'undefined') {
    const sessionQueue = (window as any).sessionQueue;
    const queueHealthMonitor = (window as any).queueHealthMonitor;
    
    if (sessionQueue && queueHealthMonitor) {
      console.log('✅ Health monitoring libraries available globally');
      return true;
    } else {
      console.log('❌ Health monitoring libraries not found');
      return false;
    }
  }
  return false;
};
