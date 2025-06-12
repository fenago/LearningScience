const fs = require('fs');

console.log('🔧 Applying health monitoring fix...');

// Read the file
let content = fs.readFileSync('app/dashboard/drleegpt/page.tsx', 'utf8');

// Fix 1: Add health monitoring to sendMessage function
const healthIntegration = `
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
      
      setStreamingMessage('');`;

content = content.replace("setStreamingMessage('');", healthIntegration);

// Fix 2: Add global health setup to useEffect
const globalSetup = `
    initSession();
    
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
  }, [isAuthenticated, learningMode]);`;

content = content.replace('initSession();\n  }, [isAuthenticated, learningMode]);', globalSetup);

// Write the file back
fs.writeFileSync('app/dashboard/drleegpt/page.tsx', content);

console.log('✅ Health monitoring fix applied successfully!');
console.log('🚀 Restart your dev server and test by sending chat messages');
