/**
 * Alerting System
 * 
 * Configures error rate thresholds and alert notifications.
 * Supports multiple notification channels:
 * - Slack
 * - PagerDuty
 * - Email
 * - Webhooks
 */

import { logger } from '@/lib/logging';

// Alert severity levels
export type AlertSeverity = 'info' | 'warning' | 'critical';

// Alert configuration
interface AlertConfig {
  enabled: boolean;
  severity: AlertSeverity;
  threshold: number; // Error rate percentage or count
  windowMinutes: number; // Time window for threshold calculation
  cooldownMinutes: number; // Cooldown between alerts
  channels: NotificationChannel[];
}

// Notification channels
interface NotificationChannel {
  type: 'slack' | 'pagerduty' | 'email' | 'webhook';
  config: Record<string, string>;
}

// Alert state tracking
interface AlertState {
  lastAlertTime: number;
  errorCount: number;
  requestCount: number;
  lastErrorRate: number;
}

// Default alert configurations
const DEFAULT_ALERTS: Record<string, AlertConfig> = {
  errorRate: {
    enabled: true,
    severity: 'critical',
    threshold: 5, // 5% error rate
    windowMinutes: 5,
    cooldownMinutes: 15,
    channels: [],
  },
  apiLatency: {
    enabled: true,
    severity: 'warning',
    threshold: 2000, // 2 seconds
    windowMinutes: 5,
    cooldownMinutes: 10,
    channels: [],
  },
  databaseErrors: {
    enabled: true,
    severity: 'critical',
    threshold: 3, // 3 errors in window
    windowMinutes: 5,
    cooldownMinutes: 5,
    channels: [],
  },
  memoryUsage: {
    enabled: true,
    severity: 'warning',
    threshold: 85, // 85% memory usage
    windowMinutes: 1,
    cooldownMinutes: 30,
    channels: [],
  },
};

// In-memory state (use Redis in production)
const alertStates = new Map<string, AlertState>();

/**
 * Initialize alert state for a metric
 */
function getAlertState(metricName: string): AlertState {
  if (!alertStates.has(metricName)) {
    alertStates.set(metricName, {
      lastAlertTime: 0,
      errorCount: 0,
      requestCount: 0,
      lastErrorRate: 0,
    });
  }
  return alertStates.get(metricName)!;
}

/**
 * Check if alert should be sent (respect cooldown)
 */
function shouldAlert(metricName: string, config: AlertConfig): boolean {
  const state = getAlertState(metricName);
  const now = Date.now();
  const cooldownMs = config.cooldownMinutes * 60 * 1000;
  
  return now - state.lastAlertTime > cooldownMs;
}

/**
 * Update alert state
 */
function updateAlertState(metricName: string, updates: Partial<AlertState>) {
  const current = getAlertState(metricName);
  alertStates.set(metricName, { ...current, ...updates });
}

/**
 * Send Slack notification
 */
async function sendSlackAlert(
  webhookUrl: string,
  alert: { severity: AlertSeverity; title: string; message: string; details: Record<string, unknown> }
) {
  const colorMap: Record<AlertSeverity, string> = {
    info: '#36a64f',
    warning: '#ff9900',
    critical: '#ff0000',
  };
  
  const payload = {
    attachments: [{
      color: colorMap[alert.severity],
      title: alert.title,
      text: alert.message,
      fields: Object.entries(alert.details).map(([key, value]) => ({
        title: key,
        value: String(value),
        short: true,
      })),
      footer: 'QuoteGen Monitoring',
      ts: Math.floor(Date.now() / 1000),
    }],
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }
    
    logger.info('Slack alert sent', { severity: alert.severity, title: alert.title });
  } catch (error) {
    logger.error('Failed to send Slack alert', error as Error);
  }
}

/**
 * Send PagerDuty alert
 */
async function sendPagerDutyAlert(
  routingKey: string,
  alert: { severity: AlertSeverity; title: string; message: string; details: Record<string, unknown> }
) {
  const severityMap: Record<AlertSeverity, string> = {
    info: 'info',
    warning: 'warning',
    critical: 'critical',
  };
  
  const payload = {
    routing_key: routingKey,
    event_action: alert.severity === 'critical' ? 'trigger' : 'trigger',
    payload: {
      summary: alert.title,
      severity: severityMap[alert.severity],
      source: 'quotegen-app',
      custom_details: alert.details,
    },
  };
  
  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`PagerDuty API error: ${response.status}`);
    }
    
    logger.info('PagerDuty alert sent', { severity: alert.severity, title: alert.title });
  } catch (error) {
    logger.error('Failed to send PagerDuty alert', error as Error);
  }
}

/**
 * Send generic webhook alert
 */
async function sendWebhookAlert(
  url: string,
  alert: { severity: AlertSeverity; title: string; message: string; details: Record<string, unknown> }
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        timestamp: new Date().toISOString(),
        ...alert.details,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }
    
    logger.info('Webhook alert sent', { severity: alert.severity, title: alert.title });
  } catch (error) {
    logger.error('Failed to send webhook alert', error as Error);
  }
}

/**
 * Send alert through configured channels
 */
async function sendAlert(config: AlertConfig, alert: { severity: AlertSeverity; title: string; message: string; details: Record<string, unknown> }) {
  const sendPromises = config.channels.map(async (channel) => {
    switch (channel.type) {
      case 'slack':
        if (channel.config.webhookUrl) {
          await sendSlackAlert(channel.config.webhookUrl, alert);
        }
        break;
      case 'pagerduty':
        if (channel.config.routingKey) {
          await sendPagerDutyAlert(channel.config.routingKey, alert);
        }
        break;
      case 'webhook':
        if (channel.config.url) {
          await sendWebhookAlert(channel.config.url, alert);
        }
        break;
      default:
        logger.warn(`Unknown notification channel: ${channel.type}`);
    }
  });
  
  await Promise.all(sendPromises);
}

/**
 * Check error rate and send alert if threshold exceeded
 */
export async function checkErrorRate(
  errors: number,
  requests: number,
  customConfig?: Partial<AlertConfig>
) {
  const config = { ...DEFAULT_ALERTS.errorRate, ...customConfig };
  
  if (!config.enabled) return;
  
  const errorRate = requests > 0 ? (errors / requests) * 100 : 0;
  const state = getAlertState('errorRate');
  
  // Update state
  updateAlertState('errorRate', {
    errorCount: errors,
    requestCount: requests,
    lastErrorRate: errorRate,
  });
  
  // Check threshold
  if (errorRate >= config.threshold && shouldAlert('errorRate', config)) {
    await sendAlert(config, {
      severity: config.severity,
      title: 'High Error Rate Detected',
      message: `Error rate of ${errorRate.toFixed(2)}% exceeds threshold of ${config.threshold}%`,
      details: {
        errorRate: `${errorRate.toFixed(2)}%`,
        errors,
        requests,
        threshold: `${config.threshold}%`,
        window: `${config.windowMinutes} minutes`,
      },
    });
    
    updateAlertState('errorRate', { lastAlertTime: Date.now() });
  }
}

/**
 * Check API latency and send alert if threshold exceeded
 */
export async function checkApiLatency(
  latencyMs: number,
  endpoint: string,
  customConfig?: Partial<AlertConfig>
) {
  const config = { ...DEFAULT_ALERTS.apiLatency, ...customConfig };
  
  if (!config.enabled) return;
  
  if (latencyMs >= config.threshold && shouldAlert('apiLatency', config)) {
    await sendAlert(config, {
      severity: config.severity,
      title: 'High API Latency Detected',
      message: `API latency of ${latencyMs}ms exceeds threshold of ${config.threshold}ms`,
      details: {
        latency: `${latencyMs}ms`,
        endpoint,
        threshold: `${config.threshold}ms`,
      },
    });
    
    updateAlertState('apiLatency', { lastAlertTime: Date.now() });
  }
}

/**
 * Track database error and alert if threshold exceeded
 */
export async function trackDatabaseError(customConfig?: Partial<AlertConfig>) {
  const config = { ...DEFAULT_ALERTS.databaseErrors, ...customConfig };
  
  if (!config.enabled) return;
  
  const state = getAlertState('databaseErrors');
  const newErrorCount = state.errorCount + 1;
  
  updateAlertState('databaseErrors', { errorCount: newErrorCount });
  
  if (newErrorCount >= config.threshold && shouldAlert('databaseErrors', config)) {
    await sendAlert(config, {
      severity: config.severity,
      title: 'Database Error Threshold Exceeded',
      message: `${newErrorCount} database errors in the last ${config.windowMinutes} minutes`,
      details: {
        errorCount: newErrorCount,
        threshold: config.threshold,
        window: `${config.windowMinutes} minutes`,
      },
    });
    
    updateAlertState('databaseErrors', { 
      lastAlertTime: Date.now(),
      errorCount: 0,
    });
  }
}

/**
 * Check memory usage and alert if threshold exceeded
 */
export async function checkMemoryUsage(customConfig?: Partial<AlertConfig>) {
  const config = { ...DEFAULT_ALERTS.memoryUsage, ...customConfig };
  
  if (!config.enabled || typeof process === 'undefined') return;
  
  const usage = process.memoryUsage();
  const usedPercent = Math.round((usage.heapUsed / usage.heapTotal) * 100);
  
  if (usedPercent >= config.threshold && shouldAlert('memoryUsage', config)) {
    await sendAlert(config, {
      severity: config.severity,
      title: 'High Memory Usage Detected',
      message: `Memory usage of ${usedPercent}% exceeds threshold of ${config.threshold}%`,
      details: {
        memoryUsage: `${usedPercent}%`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        threshold: `${config.threshold}%`,
      },
    });
    
    updateAlertState('memoryUsage', { lastAlertTime: Date.now() });
  }
}

/**
 * Configure alert channels from environment variables
 */
export function configureAlertsFromEnv(): Record<string, AlertConfig> {
  const configs: Record<string, AlertConfig> = {};
  
  // Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    Object.keys(DEFAULT_ALERTS).forEach((key) => {
      configs[key] = {
        ...DEFAULT_ALERTS[key],
        channels: [
          ...DEFAULT_ALERTS[key].channels,
          {
            type: 'slack',
            config: { webhookUrl: process.env.SLACK_WEBHOOK_URL! },
          },
        ],
      };
    });
  }
  
  // PagerDuty
  if (process.env.PAGERDUTY_ROUTING_KEY) {
    Object.keys(DEFAULT_ALERTS).forEach((key) => {
      const criticalOnly = ['errorRate', 'databaseErrors'];
      if (criticalOnly.includes(key)) {
        configs[key] = {
          ...DEFAULT_ALERTS[key],
          channels: [
            ...(configs[key]?.channels || DEFAULT_ALERTS[key].channels),
            {
              type: 'pagerduty',
              config: { routingKey: process.env.PAGERDUTY_ROUTING_KEY! },
            },
          ],
        };
      }
    });
  }
  
  // Generic webhook
  if (process.env.ALERT_WEBHOOK_URL) {
    Object.keys(DEFAULT_ALERTS).forEach((key) => {
      configs[key] = {
        ...(configs[key] || DEFAULT_ALERTS[key]),
        channels: [
          ...(configs[key]?.channels || DEFAULT_ALERTS[key].channels),
          {
            type: 'webhook',
            config: { url: process.env.ALERT_WEBHOOK_URL! },
          },
        ],
      };
    });
  }
  
  return configs;
}
