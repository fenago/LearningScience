// Session Management Utilities for Phase 5A/5B
import { v4 as uuidv4 } from 'uuid';
import { SessionInfo } from '@/types/session';
import { sessionQueue } from './sessionQueue';
import { queueHealthMonitor } from './queueHealthMonitor';

export interface PerformanceMetrics {
  sessionCreationTime?: number;
  sessionUpdateTime?: number;
  lastUpdateTimestamp?: Date;
  queueMetrics?: any;
}

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionInfo | null = null;
  private performanceMetrics: PerformanceMetrics = {};

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Initialize or resume session
  async initializeSession(learningMode: string = 'Learn'): Promise<SessionInfo> {
    console.log(`🔄 Starting session initialization with mode: ${learningMode}`);
    const startTime = Date.now();
    
    try {
      // Check for existing session in localStorage
      const existingSessionId = localStorage.getItem('drleegpt_session_id');
      
      if (existingSessionId) {
        const session = await this.resumeSession(existingSessionId);
        if (session) {
          this.currentSession = session;
          
          // Persist resumed session to sessionStorage for hot reload recovery
          if (typeof window !== 'undefined') {
            try {
              console.log(`🔍 Saving resumed session to sessionStorage:`, session.sessionId);
              sessionStorage.setItem('drleegpt_current_session', JSON.stringify(session));
              console.log(`✅ Successfully saved session to sessionStorage`);
              
              // Verify it was saved
              const verification = sessionStorage.getItem('drleegpt_current_session');
              console.log(`🔍 Verification - sessionStorage contains:`, !!verification);
            } catch (error) {
              console.error('❌ Failed to save resumed session to storage:', error);
            }
          }
          
          console.log(`✅ Resumed session: ${existingSessionId}`);
          return session;
        }
      }
      
      // Create new session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learningMode,
          deviceInfo: {
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            platform: typeof window !== 'undefined' ? window.navigator.platform : 'Unknown', 
            language: typeof window !== 'undefined' ? window.navigator.language : 'en-US'
          }
        })
      });
      
      console.log(`📡 Session API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Session API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to create session: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`📊 Session API response data:`, data);
      
      const newSession: SessionInfo = {
        sessionId: data.sessionId,
        startTime: new Date(data.startTime),
        isActive: true,
        messageCount: 0,
        learningMode,
        lastActivity: new Date()
      };
      
      this.currentSession = newSession;
      localStorage.setItem('drleegpt_session_id', newSession.sessionId);
      
      // Persist session to sessionStorage for hot reload recovery
      if (typeof window !== 'undefined') {
        try {
          console.log(`🔍 Saving new session to sessionStorage:`, newSession.sessionId);
          sessionStorage.setItem('drleegpt_current_session', JSON.stringify(newSession));
          console.log(`✅ Successfully saved session to sessionStorage`);
          
          // Verify it was saved
          const verification = sessionStorage.getItem('drleegpt_current_session');
          console.log(`🔍 Verification - sessionStorage contains:`, !!verification);
        } catch (error) {
          console.error('❌ Failed to save session to storage:', error);
        }
      }
      
      const responseTime = Date.now() - startTime;
      this.performanceMetrics.sessionCreationTime = responseTime;
      
      console.log(`✅ Created new session: ${newSession.sessionId} (${responseTime}ms)`);
      
      return newSession;
      
    } catch (error) {
      console.error('Session initialization error:', error);
      
      // Fallback: Create local session without database
      const fallbackSession: SessionInfo = {
        sessionId: `local_${uuidv4()}`,
        startTime: new Date(),
        isActive: true,
        messageCount: 0,
        learningMode,
        lastActivity: new Date()
      };
      
      this.currentSession = fallbackSession;
      console.warn('⚠️ Using fallback session (no database connection)');
      
      return fallbackSession;
    }
  }

  // Resume existing session
  private async resumeSession(sessionId: string): Promise<SessionInfo | null> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      
      if (!response.ok) {
        console.warn(`Session ${sessionId} not found, will create new session`);
        return null;
      }
      
      const { session: sessionData } = await response.json();
      
      // Create session object FIRST
      const session = {
        sessionId: sessionData.sessionId,
        startTime: new Date(sessionData.startTime),
        isActive: sessionData.isActive,
        messageCount: sessionData.messageCount,
        learningMode: sessionData.learningMode,
        lastActivity: new Date()
      };
      
      // Assign to currentSession BEFORE calling updateSession
      this.currentSession = session;
      console.log(`🔍 Saving resumed session to sessionStorage: ${session.sessionId}`);
      sessionStorage.setItem('drleegpt_current_session', JSON.stringify(session));
      console.log(`✅ Successfully saved session to sessionStorage`);
      
      // Verify sessionStorage persistence
      const verification = sessionStorage.getItem('drleegpt_current_session');
      console.log(`🔍 Verification - sessionStorage contains: ${!!verification}`);
      
      console.log(`✅ Resumed session: ${sessionId}`);
      
      // Now update last activity (this will succeed because currentSession exists)
      await this.updateSession('heartbeat');
      
      return session;
      
    } catch (error) {
      console.error('Resume session error:', error);
      return null;
    }
  }

  // Update session activity - Phase 5B: Uses queue system
  async updateSession(action: 'message_sent' | 'heartbeat' | 'end_session', messageCount?: number): Promise<void> {
    console.log(`🔍 DEBUG updateSession called with action: ${action}`);
    
    // Use getCurrentSession() which handles hot reload recovery
    const currentSession = this.getCurrentSession();
    
    console.log(`🔍 DEBUG currentSession:`, currentSession);
    console.log(`🔍 DEBUG currentSession exists:`, !!currentSession);
    console.log(`🔍 DEBUG sessionId exists:`, !!currentSession?.sessionId);
    console.log(`🔍 DEBUG sessionId value:`, currentSession?.sessionId);
    
    if (!currentSession || !currentSession.sessionId) {
      console.warn('⚠️ No active session found for update:', action);
      console.warn('⚠️ currentSession:', currentSession);
      return;
    }
    
    const startTime = Date.now();
    console.log(`📋 Session Update: ${action}, messageCount: ${messageCount}, sessionId: ${currentSession.sessionId}`);
    
    try {
      if (currentSession.sessionId.startsWith('local_')) {
        // Local session - still queue for metrics tracking, but mark as local
        console.log('📍 Local session detected - queuing for metrics only');
        
        const priority = action === 'message_sent' ? 'high' : 
                        action === 'end_session' ? 'medium' : 'low';
        
        const operationData: any = { action, isLocal: true };
        if (messageCount !== undefined) {
          operationData.messageCount = messageCount;
        }
        
        // Queue operation for metrics tracking
        const operationId = sessionQueue.enqueue(
          currentSession.sessionId,
          action,
          operationData,
          priority
        );
        
        // Update local session state immediately
        currentSession.lastActivity = new Date();
        if (action === 'message_sent') {
          currentSession.messageCount = messageCount || currentSession.messageCount + 1;
        }
        if (action === 'end_session') {
          currentSession.isActive = false;
        }
        
        // Update memory and persist changes
        this.currentSession = currentSession;
        if (typeof window !== 'undefined') {
          try {
            console.log(`🔍 Saving updated session to sessionStorage:`, currentSession.sessionId);
            sessionStorage.setItem('drleegpt_current_session', JSON.stringify(currentSession));
            console.log(`✅ Successfully saved session to sessionStorage`);
            
            // Verify it was saved
            const verification = sessionStorage.getItem('drleegpt_current_session');
            console.log(`🔍 Verification - sessionStorage contains:`, !!verification);
          } catch (error) {
            console.error('❌ Failed to save session to storage:', error);
          }
        }
        
        console.log(`📊 Queued local operation: ${operationId}`);
        return;
      }
      
      // Phase 5B: Queue the operation instead of making immediate API call
      const priority = action === 'message_sent' ? 'high' : 
                      action === 'end_session' ? 'medium' : 'low';
      
      const operationData: any = { action };
      if (messageCount !== undefined) {
        operationData.messageCount = messageCount;
      }
      
      const operationId = sessionQueue.enqueue(
        currentSession.sessionId,
        action,
        operationData,
        priority
      );
      
      // Update local session state immediately for responsive UI
      currentSession.lastActivity = new Date();
      if (action === 'message_sent') {
        currentSession.messageCount = messageCount || currentSession.messageCount + 1;
      }
      if (action === 'end_session') {
        currentSession.isActive = false;
      }
      
      // Update memory and persist changes
      this.currentSession = currentSession;
      if (typeof window !== 'undefined') {
        try {
          console.log(`🔍 Saving updated session to sessionStorage:`, currentSession.sessionId);
          sessionStorage.setItem('drleegpt_current_session', JSON.stringify(currentSession));
          console.log(`✅ Successfully saved session to sessionStorage`);
          
          // Verify it was saved
          const verification = sessionStorage.getItem('drleegpt_current_session');
          console.log(`🔍 Verification - sessionStorage contains:`, !!verification);
        } catch (error) {
          console.error('❌ Failed to save session to storage:', error);
        }
      }
      
      const responseTime = Date.now() - startTime;
      this.performanceMetrics.sessionUpdateTime = responseTime;
      this.performanceMetrics.lastUpdateTimestamp = new Date();
      this.performanceMetrics.queueMetrics = sessionQueue.getMetrics();
      
      console.log(`📊 Session update queued: ${action} (Operation ID: ${operationId.slice(0, 8)}...)`);
      
    } catch (error) {
      console.error('Session update error:', error);
      // Continue silently - don't block user experience
    }
  }

  // Get current session info
  getCurrentSession(): SessionInfo | null {
    console.log(`🔍 getCurrentSession called`);
    
    // First check memory
    if (this.currentSession) {
      console.log(`✅ Found session in memory:`, this.currentSession.sessionId);
      return this.currentSession;
    }
    
    console.log(`⚠️ No session in memory, checking sessionStorage...`);
    
    // If not in memory, try to restore from sessionStorage (for hot reloads)
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('drleegpt_current_session');
        console.log(`🔍 sessionStorage contains:`, !!stored);
        
        if (stored) {
          const parsed = JSON.parse(stored);
          // Restore dates from strings
          if (parsed.startTime) parsed.startTime = new Date(parsed.startTime);
          if (parsed.lastActivity) parsed.lastActivity = new Date(parsed.lastActivity);
          
          this.currentSession = parsed;
          console.log('🔄 Restored session from sessionStorage:', parsed.sessionId);
          return this.currentSession;
        }
      } catch (error) {
        console.warn('Failed to restore session from storage:', error);
      }
    }
    
    console.log(`❌ No session found anywhere`);
    return null;
  }

  // Get performance metrics - Phase 5B: includes queue metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return {
      ...this.performanceMetrics,
      queueMetrics: sessionQueue.getMetrics()
    };
  }

  // Phase 5B: Get queue metrics
  getQueueMetrics() {
    return sessionQueue.getMetrics();
  }

  // Phase 5B: Force process queue
  forceProcessQueue(): void {
    sessionQueue.forceProcess();
  }

  // Phase 5B: Clear queue (for debugging)
  clearQueue(): void {
    sessionQueue.clearQueue();
  }

  // Phase 5C: Get health status
  getHealthStatus() {
    return queueHealthMonitor.getHealthStatus();
  }

  getPerformanceTrends() {
    return queueHealthMonitor.getPerformanceTrends();
  }

  // Debug helper for troubleshooting API connectivity
  async debugSessionStatus(): Promise<void> {
    console.log('=== SESSION DEBUG STATUS ===');
    console.log('Current session:', this.currentSession);
    console.log('Queue metrics:', this.getQueueMetrics());
    
    // Test API connectivity
    try {
      console.log('Testing API connectivity...');
      const response = await fetch('/api/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response Data:', data);
      } else {
        const errorText = await response.text();
        console.log('API Error Response:', errorText);
      }
    } catch (error) {
      console.error('API Connectivity Test Failed:', error);
    }
    
    console.log('=== END DEBUG STATUS ===');
  }

  // Add a test method to force session creation and debug
  async testSessionCreation(): Promise<SessionInfo | null> {
    console.log('=== TESTING SESSION CREATION ===');
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          learningMode: 'Learn',
          timestamp: new Date().toISOString(),
          test: true
        }),
      });
      
      console.log('Session Creation Response Status:', response.status);
      console.log('Session Creation Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Session Creation Error:', errorText);
        throw new Error(`Session creation failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Session Creation Success:', data);
      console.log('=== SESSION CREATION SUCCESS ===');
      return data;
    } catch (error) {
      console.error('Session Creation Test Failed:', error);
      console.log('=== SESSION CREATION FAILED ===');
      return null;
    }
  }

  // End session
  async endSession(): Promise<void> {
    if (this.currentSession) {
      await this.updateSession('end_session');
      localStorage.removeItem('drleegpt_session_id');
      this.currentSession = null;
    }
  }

  // Periodic heartbeat to keep session active
  startHeartbeat(intervalMs: number = 60000): void {
    setInterval(() => {
      if (this.currentSession?.isActive) {
        this.updateSession('heartbeat');
      }
    }, intervalMs);
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
