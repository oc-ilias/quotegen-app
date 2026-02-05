/**
 * Request Context Middleware
 * 
 * Provides request-scoped logging context for Next.js API routes
 * and server components with automatic request ID generation
 * and context propagation.
 */

import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { LogContext } from './types';

// AsyncLocalStorage for request context
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

interface RequestContext extends LogContext {
  requestId: string;
  startTime: number;
  userId?: string;
  shopId?: string;
}

/**
 * Get the current request context if available
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Run a function within a request context
 */
export function withRequestContext<T>(
  context: Partial<RequestContext>,
  fn: () => T
): T {
  const fullContext: RequestContext = {
    requestId: context.requestId || generateRequestId(),
    startTime: context.startTime || Date.now(),
    ...context,
  };
  
  return requestContextStorage.run(fullContext, fn);
}

/**
 * Run an async function within a request context
 */
export async function withRequestContextAsync<T>(
  context: Partial<RequestContext>,
  fn: () => Promise<T>
): Promise<T> {
  const fullContext: RequestContext = {
    requestId: context.requestId || generateRequestId(),
    startTime: context.startTime || Date.now(),
    ...context,
  };
  
  return requestContextStorage.run(fullContext, fn);
}

/**
 * Get request ID from current context or generate new one
 */
export function getRequestId(): string {
  return getRequestContext()?.requestId || generateRequestId();
}

/**
 * Build log context from current request context
 */
export function buildLogContext(additionalContext?: LogContext): LogContext {
  const requestContext = getRequestContext();
  
  return {
    requestId: requestContext?.requestId,
    userId: requestContext?.userId,
    shopId: requestContext?.shopId,
    ...additionalContext,
  };
}

/**
 * Middleware for API routes to add request context
 */
export function withLoggingContext(handler: Function) {
  return async (req: Request, ...args: unknown[]) => {
    const requestId = req.headers.get('x-request-id') || generateRequestId();
    const context: Partial<RequestContext> = {
      requestId,
      startTime: Date.now(),
    };
    
    return withRequestContextAsync(context, async () => {
      return handler(req, ...args);
    });
  };
}

/**
 * Calculate request duration
 */
export function getRequestDuration(): number {
  const context = getRequestContext();
  if (!context) return 0;
  return Date.now() - context.startTime;
}
