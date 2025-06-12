// Phase 5B: Session Queue Management with Batching and Retry Logic
import { v4 as uuidv4 } from 'uuid';
import { queueHealthMonitor } from './queueHealthMonitor';

export interface QueuedOperation {
  id: string;
  sessionId: string;
  action: 'message_sent' | 'heartbeat' | 'end_session' | 'update_metadata';
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  maxRetries: number;
}

export interface BatchUpdate {
  sessionId: string;
  operations: QueuedOperation[];
  consolidatedData: any;
  timestamp: Date;
}

export interface QueueMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  retryOperations: number;
  avgProcessingTime: number;
  queueSize: number;
  batchesSent: number;
  offlineOperations: number;
  successRate: number;
  retryRate: number;
  throughput: number; // operations per minute
  errorCount: number;
  onlineStatus: boolean;
}

export class SessionQueue {
  private static instance: SessionQueue;
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private isOnline = true;
  private batchSize = 5;
  private batchTimeoutMs = 3000; // 3 seconds
  private maxRetries = 3;
  private retryDelayMs = 1000; // Base delay for exponential backoff
  private metrics: QueueMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    retryOperations: 0,
    avgProcessingTime: 0,
    queueSize: 0,
    batchesSent: 0,
    offlineOperations: 0,
    successRate: 0,
    retryRate: 0,
    throughput: 0,
    errorCount: 0,
    onlineStatus: true
  };

  private processingTimes: number[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  static getInstance(): SessionQueue {
    if (!SessionQueue.instance) {
      SessionQueue.instance = new SessionQueue();
    }
    return SessionQueue.instance;
  }

  constructor() {
    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Back online - processing queued operations');
        this.isOnline = true;
        this.processQueue();
      });
      
      window.addEventListener('offline', () => {
        console.log('📴 Offline - queueing operations for later');
        this.isOnline = false;
      });
      
      this.isOnline = window.navigator.onLine;
    }

    // Start background processing
    this.startBackgroundSync();
    
    // Load any persisted queue from localStorage
    this.loadPersistedQueue();
  }

  // Add operation to queue
  enqueue(sessionId: string, action: QueuedOperation['action'], data: any, priority: QueuedOperation['priority'] = 'medium'): string {
    const operation: QueuedOperation = {
      id: uuidv4(),
      sessionId,
      action,
      data,
      timestamp: new Date(),
      retryCount: 0,
      priority,
      maxRetries: this.getMaxRetries(action)
    };

    // Insert based on priority
    const insertIndex = this.findInsertIndex(operation);
    this.queue.splice(insertIndex, 0, operation);
    
    this.metrics.totalOperations++;
    this.metrics.queueSize = this.queue.length;
    
    // Persist queue to localStorage
    this.persistQueue();
    
    console.log(`📝 Queued ${action} operation (Priority: ${priority}, Queue size: ${this.queue.length})`);
    
    // Trigger processing if online
    if (this.isOnline) {
      this.scheduleProcessing();
    } else {
      this.metrics.offlineOperations++;
    }
    
    // For local operations, process immediately for better metrics
    if (sessionId.startsWith('local_')) {
      setTimeout(() => this.processQueue(), 100); // Small delay to allow batching
    }
    
    return operation.id;
  }

  // Find correct insertion index based on priority
  private findInsertIndex(operation: QueuedOperation): number {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const opPriority = priorityOrder[operation.priority];
    
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorityOrder[this.queue[i].priority];
      if (opPriority < queuePriority) {
        return i;
      }
    }
    return this.queue.length;
  }

  // Get max retries based on action type
  private getMaxRetries(action: QueuedOperation['action']): number {
    switch (action) {
      case 'message_sent': return 5; // Critical - more retries
      case 'heartbeat': return 2; // Less critical
      case 'end_session': return 3; // Important for cleanup
      case 'update_metadata': return 3; // Moderately important
      default: return this.maxRetries;
    }
  }

  // Schedule batch processing
  private scheduleProcessing(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Process immediately if high priority items or queue is full
    const hasHighPriority = this.queue.some(op => op.priority === 'high');
    const shouldProcessImmediately = hasHighPriority || this.queue.length >= this.batchSize;

    if (shouldProcessImmediately) {
      this.processQueue();
    } else {
      // Schedule batch processing after timeout
      this.batchTimeout = setTimeout(() => {
        this.processQueue();
      }, this.batchTimeoutMs);
    }
  }

  // Process queued operations in batches
  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      // Group operations by sessionId for batching
      const batches = this.createBatches();
      
      for (const batch of batches) {
        await this.processBatch(batch);
      }
      
      const processingTime = Date.now() - startTime;
      this.updateProcessingMetrics(processingTime);
      
      // Phase 5C: Record metrics for health monitoring
      this.recordHealthMetrics();
      
      console.log(`✅ Processed ${batches.length} batches in ${processingTime}ms`);
      
    } catch (error) {
      console.error('❌ Queue processing error:', error);
    } finally {
      this.isProcessing = false;
      this.metrics.queueSize = this.queue.length;
      this.persistQueue();
    }
  }

  // Create batches from queue operations
  private createBatches(): BatchUpdate[] {
    const batches: BatchUpdate[] = [];
    const sessionGroups = new Map<string, QueuedOperation[]>();
    
    // Take up to batchSize * 2 operations to allow for multiple sessions
    const operationsToProcess = this.queue.splice(0, this.batchSize * 2);
    
    // Group by sessionId
    operationsToProcess.forEach(op => {
      if (!sessionGroups.has(op.sessionId)) {
        sessionGroups.set(op.sessionId, []);
      }
      sessionGroups.get(op.sessionId)!.push(op);
    });
    
    // Create batches
    sessionGroups.forEach((operations, sessionId) => {
      const consolidatedData = this.consolidateOperations(operations);
      batches.push({
        sessionId,
        operations,
        consolidatedData,
        timestamp: new Date()
      });
    });
    
    return batches;
  }

  // Consolidate multiple operations into a single update
  private consolidateOperations(operations: QueuedOperation[]): any {
    const consolidated: any = {
      lastActivity: new Date(),
      actions: []
    };
    
    let messageCount = 0;
    let shouldEndSession = false;
    
    operations.forEach(op => {
      consolidated.actions.push(op.action);
      
      switch (op.action) {
        case 'message_sent':
          if (typeof op.data.messageCount === 'number') {
            messageCount = Math.max(messageCount, op.data.messageCount);
          } else {
            messageCount++;
          }
          break;
        case 'end_session':
          shouldEndSession = true;
          break;
        case 'update_metadata':
          consolidated.metadata = { ...consolidated.metadata, ...op.data };
          break;
      }
    });
    
    if (messageCount > 0) {
      consolidated.messageCount = messageCount;
    }
    
    if (shouldEndSession) {
      consolidated.isActive = false;
      consolidated.endTime = new Date();
    }
    
    return consolidated;
  }

  // Process a single batch
  private async processBatch(batch: BatchUpdate): Promise<void> {
    try {
      // Check if this is a local session (doesn't need API call)
      const isLocalSession = batch.sessionId.startsWith('local_');
      
      if (isLocalSession) {
        // Local session - just mark as successful for metrics
        console.log(`📍 Processing local session batch: ${batch.sessionId}`);
        
        batch.operations.forEach(op => {
          this.removeFromQueue(op.id);
          this.metrics.successfulOperations++;
        });
        
        this.metrics.batchesSent++;
        console.log(`✅ Local batch processed successfully (${batch.operations.length} operations)`);
        return;
      }
      
      // Remote session - make API call
      const response = await fetch(`/api/sessions/${batch.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_update',
          batchData: batch.consolidatedData,
          operationIds: batch.operations.map(op => op.id)
        })
      });
      
      if (!response.ok) {
        throw new Error(`Batch update failed: ${response.status}`);
      }
      
      // Mark operations as successful
      batch.operations.forEach(op => {
        this.metrics.successfulOperations++;
      });
      
      this.metrics.batchesSent++;
      
      console.log(`✅ Batch processed for session ${batch.sessionId}: ${batch.operations.length} operations`);
      
    } catch (error) {
      console.error(`❌ Batch processing failed for session ${batch.sessionId}:`, error);
      
      // Handle failed operations with retry logic
      batch.operations.forEach(op => {
        this.handleFailedOperation(op);
      });
    }
  }

  // Handle failed operations with exponential backoff
  private handleFailedOperation(operation: QueuedOperation): void {
    operation.retryCount++;
    
    if (operation.retryCount <= operation.maxRetries) {
      // Calculate exponential backoff delay
      const delay = this.retryDelayMs * Math.pow(2, operation.retryCount - 1);
      
      console.log(`🔄 Retrying operation ${operation.action} (attempt ${operation.retryCount}/${operation.maxRetries}) in ${delay}ms`);
      
      // Re-queue with delay
      setTimeout(() => {
        const insertIndex = this.findInsertIndex(operation);
        this.queue.splice(insertIndex, 0, operation);
        this.scheduleProcessing();
      }, delay);
      
      this.metrics.retryOperations++;
    } else {
      console.error(`❌ Operation ${operation.action} failed after ${operation.maxRetries} retries`);
      this.metrics.failedOperations++;
    }
  }

  // Update processing metrics
  private updateProcessingMetrics(processingTime: number): void {
    this.processingTimes.push(processingTime);
    
    // Keep only last 100 processing times for rolling average
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }
    
    this.metrics.avgProcessingTime = this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
  }

  // Phase 5C: Get comprehensive metrics for health monitoring
  getMetrics(): QueueMetrics {
    // Calculate derived metrics
    const totalOps = this.metrics.totalOperations;
    const successfulOps = this.metrics.successfulOperations;
    const retryOps = this.metrics.retryOperations;
    
    const successRate = totalOps > 0 ? (successfulOps / totalOps) * 100 : 100;
    const retryRate = totalOps > 0 ? (retryOps / totalOps) * 100 : 0;
    
    // Calculate throughput (operations per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentProcessingTimes = this.processingTimes.filter(time => time > oneMinuteAgo);
    const throughput = recentProcessingTimes.length;

    return {
      ...this.metrics,
      successRate,
      retryRate,
      throughput,
      errorCount: this.metrics.failedOperations,
      onlineStatus: this.isOnline
    };
  }

  // Phase 5C: Record metrics for health monitoring
  private recordHealthMetrics(): void {
    const metrics = this.getMetrics();
    
    // Send metrics to health monitor
    if (queueHealthMonitor && typeof queueHealthMonitor.recordMetrics === 'function') {
      queueHealthMonitor.recordMetrics({
        queueSize: metrics.queueSize,
        successRate: metrics.successRate,
        retryRate: metrics.retryRate,
        avgProcessingTime: metrics.avgProcessingTime,
        throughput: metrics.throughput,
        errorCount: metrics.errorCount,
        onlineStatus: metrics.onlineStatus
      });
    }
  }

  // Clear queue (for testing/debugging)
  clearQueue(): void {
    this.queue = [];
    this.metrics.queueSize = 0;
    this.persistQueue();
    console.log('🗑️ Session queue cleared');
  }

  // Background sync every 30 seconds
  private startBackgroundSync(): void {
    setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        console.log('🔄 Background sync processing queued operations');
        this.processQueue();
      }
    }, 30000); // 30 seconds
  }

  // Persist queue to localStorage
  private persistQueue(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drleegpt_session_queue', JSON.stringify({
          queue: this.queue,
          metrics: this.metrics,
          timestamp: new Date()
        }));
      } catch (error) {
        console.warn('Failed to persist session queue:', error);
      }
    }
  }

  // Load persisted queue from localStorage
  private loadPersistedQueue(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drleegpt_session_queue');
        if (saved) {
          const data = JSON.parse(saved);
          
          // Only restore if saved within last hour
          const saveTime = new Date(data.timestamp);
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          if (saveTime > hourAgo) {
            this.queue = data.queue || [];
            this.metrics = { ...this.metrics, ...data.metrics };
            console.log(`📁 Restored ${this.queue.length} queued operations from storage`);
          } else {
            localStorage.removeItem('drleegpt_session_queue');
          }
        }
      } catch (error) {
        console.warn('Failed to load persisted session queue:', error);
        localStorage.removeItem('drleegpt_session_queue');
      }
    }
  }

  // Force immediate processing
  forceProcess(): void {
    if (this.isOnline) {
      this.processQueue();
    }
  }

  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter(op => op.id !== id);
  }
}

// Export singleton instance
export const sessionQueue = SessionQueue.getInstance();
