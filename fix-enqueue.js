const fs = require('fs');

console.log('🔧 Fixing sessionQueue method call...');

// Read the file
let content = fs.readFileSync('app/dashboard/drleegpt/page.tsx', 'utf8');

// Replace the incorrect addToQueue call with correct enqueue call
const oldCode = `        await sessionQueue.addToQueue({
          type: 'chat_completion',
          sessionId: currentSession?.sessionId || 'local_fallback',
          data: {
            processingTime: assistantMessage.performanceMetrics?.generationTime || 1000,
            success: true,
            timestamp: new Date()
          }
        });`;

const newCode = `        const operationId = sessionQueue.enqueue(
          currentSession?.sessionId || 'local_fallback',
          'message_sent',
          {
            processingTime: assistantMessage.performanceMetrics?.generationTime || 1000,
            success: true,
            timestamp: new Date()
          },
          'medium'
        );
        console.log('📝 Queued chat completion:', operationId);`;

content = content.replace(oldCode, newCode);

// Write the file back
fs.writeFileSync('app/dashboard/drleegpt/page.tsx', content);

console.log('✅ Fixed sessionQueue method call!');
console.log('🚀 Now restart your dev server and test');
