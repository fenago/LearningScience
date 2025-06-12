/**
 * Phase 5C: Advanced Queue Health Monitoring System
 * Provides real-time health assessment, alerting, and predictive analytics
 */

export interface HealthThresholds {
  successRateWarning: number;    // e.g., 90% - warn if below
  successRateCritical: number;   // e.g., 80% - critical if below
  queueSizeWarning: number;      // e.g., 50 - warn if above
  queueSizeCritical: number;     // e.g., 100 - critical if above
  avgProcessingTimeWarning: number; // e.g., 2000ms - warn if above
  avgProcessingTimeCritical: number; // e.g., 5000ms - critical if above
  retryRateWarning: number;      // e.g., 15% - warn if above
  retryRateCritical: number;     // e.g., 30% - critical if above
}

export interface HealthAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: 'performance' | 'reliability' | 'capacity' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  data?: any;
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    queuePerformance: 'healthy' | 'warning' | 'critical';
    reliability: 'healthy' | 'warning' | 'critical';
    capacity: 'healthy' | 'warning' | 'critical';
    connectivity: 'healthy' | 'warning' | 'critical';
  };
  score: number; // 0-100
  alerts: HealthAlert[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  timestamp: Date;
  queueSize: number;
  successRate: number;
  retryRate: number;
  avgProcessingTime: number;
  throughput: number; // operations per minute
  errorCount: number;
  onlineStatus: boolean;
}

class QueueHealthMonitor {
  private thresholds: HealthThresholds;
  private alerts: HealthAlert[] = [];
  private metricsHistory: PerformanceMetrics[] = [];
  private maxHistorySize = 100; // Keep last 100 data points
  private alertCallbacks: ((alert: HealthAlert) => void)[] = [];
  private lastHealthCheck: Date = new Date();

  constructor() {
    this.thresholds = {
      successRateWarning: 90,
      successRateCritical: 80,
      queueSizeWarning: 25,
      queueSizeCritical: 50,
      avgProcessingTimeWarning: 2000,
      avgProcessingTimeCritical: 5000,
      retryRateWarning: 15,
      retryRateCritical: 30
    };
  }

  // Update thresholds for customization
  updateThresholds(newThresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Add alert callback for notifications
  onAlert(callback: (alert: HealthAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  // Record metrics for historical analysis
  recordMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const timestampedMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date()
    };

    this.metricsHistory.push(timestampedMetrics);
    
    // Keep only recent history
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Trigger health assessment
    this.assessHealth(timestampedMetrics);
  }

  // Main health assessment logic
  private assessHealth(currentMetrics: PerformanceMetrics): void {
    const newAlerts: HealthAlert[] = [];

    // Check queue performance
    if (currentMetrics.avgProcessingTime > this.thresholds.avgProcessingTimeCritical) {
      newAlerts.push(this.createAlert(
        'critical',
        'performance',
        'High Processing Time',
        `Average processing time (${currentMetrics.avgProcessingTime}ms) exceeds critical threshold`,
        { processingTime: currentMetrics.avgProcessingTime }
      ));
    } else if (currentMetrics.avgProcessingTime > this.thresholds.avgProcessingTimeWarning) {
      newAlerts.push(this.createAlert(
        'warning',
        'performance',
        'Elevated Processing Time',
        `Average processing time (${currentMetrics.avgProcessingTime}ms) above normal levels`,
        { processingTime: currentMetrics.avgProcessingTime }
      ));
    }

    // Check reliability
    if (currentMetrics.successRate < this.thresholds.successRateCritical) {
      newAlerts.push(this.createAlert(
        'critical',
        'reliability',
        'Low Success Rate',
        `Success rate (${currentMetrics.successRate.toFixed(1)}%) below critical threshold`,
        { successRate: currentMetrics.successRate }
      ));
    } else if (currentMetrics.successRate < this.thresholds.successRateWarning) {
      newAlerts.push(this.createAlert(
        'warning',
        'reliability',
        'Declining Success Rate',
        `Success rate (${currentMetrics.successRate.toFixed(1)}%) below normal levels`,
        { successRate: currentMetrics.successRate }
      ));
    }

    // Check capacity
    if (currentMetrics.queueSize > this.thresholds.queueSizeCritical) {
      newAlerts.push(this.createAlert(
        'critical',
        'capacity',
        'Queue Overload',
        `Queue size (${currentMetrics.queueSize}) exceeds critical capacity`,
        { queueSize: currentMetrics.queueSize }
      ));
    } else if (currentMetrics.queueSize > this.thresholds.queueSizeWarning) {
      newAlerts.push(this.createAlert(
        'warning',
        'capacity',
        'High Queue Volume',
        `Queue size (${currentMetrics.queueSize}) above normal levels`,
        { queueSize: currentMetrics.queueSize }
      ));
    }

    // Check retry rates
    if (currentMetrics.retryRate > this.thresholds.retryRateCritical) {
      newAlerts.push(this.createAlert(
        'critical',
        'reliability',
        'High Retry Rate',
        `Retry rate (${currentMetrics.retryRate.toFixed(1)}%) indicates system instability`,
        { retryRate: currentMetrics.retryRate }
      ));
    } else if (currentMetrics.retryRate > this.thresholds.retryRateWarning) {
      newAlerts.push(this.createAlert(
        'warning',
        'reliability',
        'Elevated Retry Rate',
        `Retry rate (${currentMetrics.retryRate.toFixed(1)}%) above normal levels`,
        { retryRate: currentMetrics.retryRate }
      ));
    }

    // Check connectivity
    if (!currentMetrics.onlineStatus) {
      newAlerts.push(this.createAlert(
        'warning',
        'system',
        'Offline Mode',
        'System is operating in offline mode - operations will queue until reconnection',
        { onlineStatus: false }
      ));
    }

    // Add new alerts and trigger notifications
    newAlerts.forEach(alert => {
      this.alerts.unshift(alert); // Add to beginning
      this.notifyAlert(alert);
    });

    // Keep only recent alerts (last 50)
    this.alerts = this.alerts.slice(0, 50);
    this.lastHealthCheck = new Date();
  }

  // Create standardized alert
  private createAlert(
    type: HealthAlert['type'],
    category: HealthAlert['category'],
    title: string,
    message: string,
    data?: any
  ): HealthAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      title,
      message,
      timestamp: new Date(),
      resolved: false,
      data
    };
  }

  // Notify alert callbacks
  private notifyAlert(alert: HealthAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback error:', error);
      }
    });
  }

  // Get current health status
  getHealthStatus(): HealthStatus {
    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const criticalAlerts = activeAlerts.filter(a => a.type === 'critical');
    const warningAlerts = activeAlerts.filter(a => a.type === 'warning');

    // Calculate overall health
    let overall: HealthStatus['overall'] = 'healthy';
    if (criticalAlerts.length > 0) {
      overall = 'critical';
    } else if (warningAlerts.length > 0) {
      overall = 'warning';
    }

    // Calculate component health
    const components = {
      queuePerformance: this.getComponentHealth('performance'),
      reliability: this.getComponentHealth('reliability'),
      capacity: this.getComponentHealth('capacity'),
      connectivity: this.getComponentHealth('system')
    };

    // Calculate health score (0-100)
    const score = this.calculateHealthScore(activeAlerts);

    // Generate recommendations
    const recommendations = this.generateRecommendations(activeAlerts);

    return {
      overall,
      components,
      score,
      alerts: activeAlerts,
      recommendations
    };
  }

  // Get component-specific health
  private getComponentHealth(category: HealthAlert['category']): 'healthy' | 'warning' | 'critical' {
    const categoryAlerts = this.alerts.filter(a => !a.resolved && a.category === category);
    const criticalAlerts = categoryAlerts.filter(a => a.type === 'critical');
    const warningAlerts = categoryAlerts.filter(a => a.type === 'warning');

    if (criticalAlerts.length > 0) return 'critical';
    if (warningAlerts.length > 0) return 'warning';
    return 'healthy';
  }

  // Calculate numeric health score
  private calculateHealthScore(alerts: HealthAlert[]): number {
    let score = 100;
    alerts.forEach(alert => {
      if (alert.type === 'critical') score -= 25;
      else if (alert.type === 'warning') score -= 10;
    });
    return Math.max(0, score);
  }

  // Generate actionable recommendations
  private generateRecommendations(alerts: HealthAlert[]): string[] {
    const recommendations: string[] = [];
    const alertTypes = new Set(alerts.map(a => `${a.category}_${a.type}`));

    if (alertTypes.has('performance_critical') || alertTypes.has('performance_warning')) {
      recommendations.push('Consider reducing batch timeout or increasing processing capacity');
    }

    if (alertTypes.has('reliability_critical') || alertTypes.has('reliability_warning')) {
      recommendations.push('Check network connectivity and API endpoint availability');
    }

    if (alertTypes.has('capacity_critical') || alertTypes.has('capacity_warning')) {
      recommendations.push('Consider processing queue manually or increasing batch size');
    }

    if (alertTypes.has('system_warning')) {
      recommendations.push('Check internet connection and wait for automatic reconnection');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating normally - no action required');
    }

    return recommendations;
  }

  // Get performance trends
  getPerformanceTrends(): {
    successRateTrend: 'improving' | 'stable' | 'declining';
    processingTimeTrend: 'improving' | 'stable' | 'declining';
    throughputTrend: 'improving' | 'stable' | 'declining';
    recentMetrics: PerformanceMetrics[];
  } {
    const recentMetrics = this.metricsHistory.slice(-10); // Last 10 data points
    
    if (recentMetrics.length < 3) {
      return {
        successRateTrend: 'stable',
        processingTimeTrend: 'stable',
        throughputTrend: 'stable',
        recentMetrics
      };
    }

    const first3 = recentMetrics.slice(0, 3);
    const last3 = recentMetrics.slice(-3);

    const avgFirst = (metrics: PerformanceMetrics[], field: keyof PerformanceMetrics) =>
      metrics.reduce((sum, m) => sum + (m[field] as number), 0) / metrics.length;

    // Calculate trends
    const successRateFirst = avgFirst(first3, 'successRate');
    const successRateLast = avgFirst(last3, 'successRate');
    const successRateTrend = successRateLast > successRateFirst + 2 ? 'improving' :
                            successRateLast < successRateFirst - 2 ? 'declining' : 'stable';

    const processingTimeFirst = avgFirst(first3, 'avgProcessingTime');
    const processingTimeLast = avgFirst(last3, 'avgProcessingTime');
    const processingTimeTrend = processingTimeLast < processingTimeFirst - 100 ? 'improving' :
                               processingTimeLast > processingTimeFirst + 100 ? 'declining' : 'stable';

    const throughputFirst = avgFirst(first3, 'throughput');
    const throughputLast = avgFirst(last3, 'throughput');
    const throughputTrend = throughputLast > throughputFirst + 1 ? 'improving' :
                           throughputLast < throughputFirst - 1 ? 'declining' : 'stable';

    return {
      successRateTrend,
      processingTimeTrend,
      throughputTrend,
      recentMetrics
    };
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // Clear all resolved alerts
  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(a => !a.resolved);
  }
}

// Export singleton instance
export const queueHealthMonitor = new QueueHealthMonitor();
