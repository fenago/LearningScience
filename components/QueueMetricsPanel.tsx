// Phase 5B: Queue Metrics Display Component
import { useState, useEffect } from 'react';
import { sessionManager } from '@/libs/sessionManager';
import { QueueMetrics } from '@/libs/sessionQueue';

interface QueueMetricsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function QueueMetricsPanel({ isVisible, onClose }: QueueMetricsPanelProps) {
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (isVisible) {
      // Update metrics every 500ms for more responsive feedback
      const interval = setInterval(() => {
        const currentMetrics = sessionManager.getQueueMetrics();
        setMetrics(currentMetrics);
        setIsOnline(navigator.onLine);
      }, 500);

      // Initial load
      const currentMetrics = sessionManager.getQueueMetrics();
      setMetrics(currentMetrics);
      setIsOnline(navigator.onLine);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible || !metrics) return null;

  const successRate = metrics.totalOperations > 0 
    ? ((metrics.successfulOperations / metrics.totalOperations) * 100).toFixed(1)
    : '100';

  const retryRate = metrics.totalOperations > 0
    ? ((metrics.retryOperations / metrics.totalOperations) * 100).toFixed(1) 
    : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 border-b">
          <h2 className="text-xl font-bold text-gray-900">📊 Phase 5B: Session Queue Metrics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 rounded-lg border-2" style={{
          backgroundColor: isOnline ? '#f0f9ff' : '#fef2f2',
          borderColor: isOnline ? '#3b82f6' : '#ef4444'
        }}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isOnline ? 'text-blue-800' : 'text-red-800'}`}>
              {isOnline ? '🌐 Online - Queue Processing Active' : '📴 Offline - Operations Queued for Later'}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Queue Size */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{metrics.queueSize}</div>
            <div className="text-sm text-blue-600">Queued Operations</div>
            {metrics.queueSize > 0 && (
              <div className="mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Success Rate */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{successRate}%</div>
            <div className="text-sm text-green-600">Success Rate</div>
            <div className="text-xs text-green-500 mt-1">
              {metrics.successfulOperations}/{metrics.totalOperations}
            </div>
          </div>

          {/* Retry Rate */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{retryRate}%</div>
            <div className="text-sm text-yellow-600">Retry Rate</div>
            <div className="text-xs text-yellow-500 mt-1">
              {metrics.retryOperations} retries
            </div>
          </div>

          {/* Processing Time */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {metrics.avgProcessingTime ? Math.round(metrics.avgProcessingTime) : 0}ms
            </div>
            <div className="text-sm text-purple-600">Avg Process Time</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📈 Operation Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Operations:</span>
                <span className="font-medium">{metrics.totalOperations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Successful:</span>
                <span className="font-medium text-green-600">{metrics.successfulOperations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">{metrics.failedOperations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Offline Operations:</span>
                <span className="font-medium text-orange-600">{metrics.offlineOperations}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📦 Batch Processing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Batches Sent:</span>
                <span className="font-medium">{metrics.batchesSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Batch Size:</span>
                <span className="font-medium">
                  {metrics.batchesSent > 0 
                    ? Math.round((metrics.successfulOperations + metrics.failedOperations) / metrics.batchesSent)
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Queue Processing:</span>
                <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                  {isOnline ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Health Indicator */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">🏥 Queue Health</h3>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                parseFloat(successRate) >= 95 ? 'bg-green-500' :
                parseFloat(successRate) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Poor</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => sessionManager.forceProcessQueue()}
            disabled={!isOnline || metrics.queueSize === 0}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              isOnline && metrics.queueSize > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🚀 Force Process Queue
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear the queue? This action cannot be undone.')) {
                sessionManager.clearQueue();
              }
            }}
            disabled={metrics.queueSize === 0}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              metrics.queueSize > 0
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🗑️ Clear Queue
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Phase 5B: Advanced session queue with batching, retry logic, and offline support
          </p>
        </div>
      </div>
    </div>
  );
}
