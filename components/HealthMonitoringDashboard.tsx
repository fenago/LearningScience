/**
 * Phase 5C: Advanced Health Monitoring Dashboard
 * Comprehensive real-time system health, alerts, and performance analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon,
  WifiIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { sessionManager } from '../libs/sessionManager';
import { queueHealthMonitor, HealthStatus, HealthAlert } from '../libs/queueHealthMonitor';

interface HealthMonitoringDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const HealthMonitoringDashboard: React.FC<HealthMonitoringDashboardProps> = ({ isVisible, onClose }) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [performanceTrends, setPerformanceTrends] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isVisible && autoRefresh) {
      // Update every 2 seconds for real-time monitoring
      const interval = setInterval(() => {
        const health = queueHealthMonitor.getHealthStatus();
        const trends = queueHealthMonitor.getPerformanceTrends();
        setHealthStatus(health);
        setPerformanceTrends(trends);
      }, 2000);

      // Initial load
      const health = queueHealthMonitor.getHealthStatus();
      const trends = queueHealthMonitor.getPerformanceTrends();
      setHealthStatus(health);
      setPerformanceTrends(trends);

      return () => clearInterval(interval);
    }
  }, [isVisible, autoRefresh]);

  const getHealthColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
    }
  };

  const getHealthBgColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'declining': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      case 'stable': return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const resolveAlert = (alertId: string) => {
    queueHealthMonitor.resolveAlert(alertId);
    // Refresh health status
    const health = queueHealthMonitor.getHealthStatus();
    setHealthStatus(health);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">System Health Monitor</h2>
            {healthStatus && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthBgColor(healthStatus.overall)}`}>
                <span className={`${getHealthColor(healthStatus.overall)} capitalize`}>
                  {healthStatus.overall} ({healthStatus.score}/100)
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Auto-refresh</span>
            </label>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!healthStatus ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading health data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Component Health Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border ${getHealthBgColor(healthStatus.components.queuePerformance)}`}>
                  <div className="flex items-center justify-between">
                    <ChartBarIcon className="w-6 h-6 text-gray-600" />
                    <span className={`text-sm font-medium ${getHealthColor(healthStatus.components.queuePerformance)}`}>
                      {healthStatus.components.queuePerformance}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mt-2">Queue Performance</h3>
                </div>

                <div className={`p-4 rounded-lg border ${getHealthBgColor(healthStatus.components.reliability)}`}>
                  <div className="flex items-center justify-between">
                    <CheckCircleIcon className="w-6 h-6 text-gray-600" />
                    <span className={`text-sm font-medium ${getHealthColor(healthStatus.components.reliability)}`}>
                      {healthStatus.components.reliability}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mt-2">Reliability</h3>
                </div>

                <div className={`p-4 rounded-lg border ${getHealthBgColor(healthStatus.components.capacity)}`}>
                  <div className="flex items-center justify-between">
                    <CpuChipIcon className="w-6 h-6 text-gray-600" />
                    <span className={`text-sm font-medium ${getHealthColor(healthStatus.components.capacity)}`}>
                      {healthStatus.components.capacity}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mt-2">Capacity</h3>
                </div>

                <div className={`p-4 rounded-lg border ${getHealthBgColor(healthStatus.components.connectivity)}`}>
                  <div className="flex items-center justify-between">
                    <WifiIcon className="w-6 h-6 text-gray-600" />
                    <span className={`text-sm font-medium ${getHealthColor(healthStatus.components.connectivity)}`}>
                      {healthStatus.components.connectivity}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mt-2">Connectivity</h3>
                </div>
              </div>

              {/* Performance Trends */}
              {performanceTrends && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                    Performance Trends
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {getTrendIcon(performanceTrends.successRateTrend)}
                        <span className="text-sm font-medium">Success Rate</span>
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{performanceTrends.successRateTrend}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {getTrendIcon(performanceTrends.processingTimeTrend)}
                        <span className="text-sm font-medium">Processing Time</span>
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{performanceTrends.processingTimeTrend}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {getTrendIcon(performanceTrends.throughputTrend)}
                        <span className="text-sm font-medium">Throughput</span>
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{performanceTrends.throughputTrend}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Alerts */}
              {healthStatus.alerts.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-500" />
                      Active Alerts ({healthStatus.alerts.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {healthStatus.alerts.map((alert: HealthAlert) => (
                      <div key={alert.id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {alert.type.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {alert.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(alert.timestamp)}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                          </div>
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="ml-4 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {healthStatus.recommendations.length > 0 && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Recommendations</h3>
                  <ul className="space-y-2">
                    {healthStatus.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => sessionManager.forceProcessQueue()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Force Process Queue
                </button>
                <button
                  onClick={() => queueHealthMonitor.clearResolvedAlerts()}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Resolved Alerts
                </button>
                <button
                  onClick={() => sessionManager.clearQueue()}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoringDashboard;
