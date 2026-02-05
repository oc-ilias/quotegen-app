/**
 * Structured Logging Infrastructure
 * 
 * This module provides a centralized logging system using Pino with:
 * - Multiple log levels (debug, info, warn, error, fatal)
 * - Request context tracking
 * - Different configurations for client/server environments
 * - Integration with external error tracking (Sentry)
 */

import pino from 'pino';
import { LogLevel, LogContext, Logger, LoggerConfig } from './types';

// Default log levels with numeric priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: 100,
};

// Base configuration for Pino
const getBaseConfig = (isBrowser: boolean): pino.LoggerOptions => ({
  level: (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  customLevels: LOG_LEVELS,
  useOnlyCustomLevels: false,
  
  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.secret',
      '*.apiKey',
      '*.api_key',
      '*.authorization',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    remove: true,
  },
  
  // Base metadata
  base: {
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    service: 'quotegen',
    platform: isBrowser ? 'browser' : 'server',
  },
  
  // Formatting based on environment
  ...(process.env.NODE_ENV === 'development' 
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
  
  // Timestamp configuration
  timestamp: pino.stdTimeFunctions.isoTime,
  
  // Error key for consistent error formatting
  errorKey: 'error',
});

// Create server-side logger
const createServerLogger = (): Logger => {
  const pinoLogger = pino(getBaseConfig(false));
  
  return {
    trace: (msg: string, context?: LogContext) => {
      pinoLogger.trace(context || {}, msg);
    },
    debug: (msg: string, context?: LogContext) => {
      pinoLogger.debug(context || {}, msg);
    },
    info: (msg: string, context?: LogContext) => {
      pinoLogger.info(context || {}, msg);
    },
    warn: (msg: string, context?: LogContext) => {
      pinoLogger.warn(context || {}, msg);
    },
    error: (msg: string, error?: Error, context?: LogContext) => {
      const errorContext = error
        ? {
            ...context,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause,
            },
          }
        : context;
      pinoLogger.error(errorContext || {}, msg);
    },
    fatal: (msg: string, error?: Error, context?: LogContext) => {
      const errorContext = error
        ? {
            ...context,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause,
            },
          }
        : context;
      pinoLogger.fatal(errorContext || {}, msg);
    },
    child: (bindings: Record<string, unknown>) => {
      const childLogger = pinoLogger.child(bindings);
      return {
        trace: (msg: string, ctx?: LogContext) => childLogger.trace(ctx || {}, msg),
        debug: (msg: string, ctx?: LogContext) => childLogger.debug(ctx || {}, msg),
        info: (msg: string, ctx?: LogContext) => childLogger.info(ctx || {}, msg),
        warn: (msg: string, ctx?: LogContext) => childLogger.warn(ctx || {}, msg),
        error: (msg: string, err?: Error, ctx?: LogContext) => {
          const errCtx = err
            ? {
                ...ctx,
                error: {
                  name: err.name,
                  message: err.message,
                  stack: err.stack,
                  cause: err.cause,
                },
              }
            : ctx;
          childLogger.error(errCtx || {}, msg);
        },
        fatal: (msg: string, err?: Error, ctx?: LogContext) => {
          const errCtx = err
            ? {
                ...ctx,
                error: {
                  name: err.name,
                  message: err.message,
                  stack: err.stack,
                  cause: err.cause,
                },
              }
            : ctx;
          childLogger.fatal(errCtx || {}, msg);
        },
        child: () => createServerLogger(),
      };
    },
  };
};

// Create browser-side logger (lightweight)
const createBrowserLogger = (): Logger => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    trace: (msg: string, context?: LogContext) => {
      if (isDev) console.trace('[TRACE]', msg, context);
    },
    debug: (msg: string, context?: LogContext) => {
      if (isDev) console.debug('[DEBUG]', msg, context);
    },
    info: (msg: string, context?: LogContext) => {
      console.info('[INFO]', msg, context);
    },
    warn: (msg: string, context?: LogContext) => {
      console.warn('[WARN]', msg, context);
    },
    error: (msg: string, error?: Error, context?: LogContext) => {
      console.error('[ERROR]', msg, error, context);
    },
    fatal: (msg: string, error?: Error, context?: LogContext) => {
      console.error('[FATAL]', msg, error, context);
    },
    child: (bindings: Record<string, unknown>) => {
      const prefix = `[${Object.entries(bindings).map(([k, v]) => `${k}=${v}`).join(' ')}]`;
      return {
        trace: (msg: string, ctx?: LogContext) => {
          if (isDev) console.trace(prefix, '[TRACE]', msg, ctx);
        },
        debug: (msg: string, ctx?: LogContext) => {
          if (isDev) console.debug(prefix, '[DEBUG]', msg, ctx);
        },
        info: (msg: string, ctx?: LogContext) => console.info(prefix, '[INFO]', msg, ctx),
        warn: (msg: string, ctx?: LogContext) => console.warn(prefix, '[WARN]', msg, ctx),
        error: (msg: string, err?: Error, ctx?: LogContext) => console.error(prefix, '[ERROR]', msg, err, ctx),
        fatal: (msg: string, err?: Error, ctx?: LogContext) => console.error(prefix, '[FATAL]', msg, err, ctx),
        child: () => createBrowserLogger(),
      };
    },
  };
};

// Detect environment and create appropriate logger
const isBrowser = typeof window !== 'undefined';
export const logger: Logger = isBrowser ? createBrowserLogger() : createServerLogger();

// Export for direct usage
export default logger;
