/**
 * Logging Types
 * 
 * TypeScript interfaces and types for the logging system
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';

export interface LogContext {
  [key: string]: unknown;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  shopId?: string;
  component?: string;
  action?: string;
  duration?: number;
  url?: string;
  method?: string;
  statusCode?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  prettyPrint: boolean;
  redactFields: string[];
  destination?: string;
}

export interface Logger {
  trace(msg: string, context?: LogContext): void;
  debug(msg: string, context?: LogContext): void;
  info(msg: string, context?: LogContext): void;
  warn(msg: string, context?: LogContext): void;
  error(msg: string, error?: Error, context?: LogContext): void;
  fatal(msg: string, error?: Error, context?: LogContext): void;
  child(bindings: Record<string, unknown>): Logger;
}

// HTTP Request/Response logging types
export interface RequestLogContext extends LogContext {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

export interface ResponseLogContext extends LogContext {
  statusCode: number;
  duration: number;
  contentLength?: number;
}

// Performance logging types
export interface PerformanceLogContext extends LogContext {
  metricName: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  threshold?: number;
}

// Business event logging types
export interface BusinessEventLogContext extends LogContext {
  eventType: 'quote_created' | 'quote_updated' | 'quote_sent' | 'customer_created' | 'email_sent' | 'webhook_received';
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}
