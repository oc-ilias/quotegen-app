/**
 * Health Check API Route
 * 
 * Provides comprehensive health checks for:
 * - Application status
 * - Database connectivity
 * - External service status (Supabase, Resend, etc.)
 * - System metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logging';

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  // Timeouts for external checks (ms)
  timeouts: {
    database: 5000,
    external: 10000,
  },
  // Critical services that affect overall health
  criticalServices: ['database'],
};

// Health check result types
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: Record<string, ServiceHealth>;
  metrics?: SystemMetrics;
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  lastChecked: string;
  details?: Record<string, unknown>;
}

interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu?: {
    usage: number;
  };
}

// Cache for health check results to avoid overloading services
let cachedResult: HealthCheckResult | null = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Missing Supabase configuration',
        lastChecked: new Date().toISOString(),
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    
    // Try to execute a simple query
    const { error } = await supabase
      .from('quotes')
      .select('count')
      .limit(1)
      .abortSignal(AbortSignal.timeout(HEALTH_CHECK_CONFIG.timeouts.database));
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        message: `Database query failed: ${error.message}`,
        lastChecked: new Date().toISOString(),
        details: { code: error.code },
      };
    }
    
    // Degraded if response time is high
    if (responseTime > 2000) {
      return {
        status: 'degraded',
        responseTime,
        message: 'Database responding slowly',
        lastChecked: new Date().toISOString(),
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Unknown database error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check external email service (Resend) health
 */
async function checkEmailServiceHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: 'Email service not configured (optional)',
        lastChecked: new Date().toISOString(),
      };
    }
    
    // Resend doesn't have a dedicated health endpoint, so we just check if the API key exists
    // In production, you might want to do a more thorough check
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      details: { configured: true },
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Email service check failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Get system metrics
 */
function getSystemMetrics(): SystemMetrics {
  const memoryUsage = process.memoryUsage();
  
  return {
    uptime: process.uptime(),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    },
  };
}

/**
 * Run all health checks
 */
async function runHealthChecks(): Promise<HealthCheckResult> {
  const [database, email, metrics] = await Promise.all([
    checkDatabaseHealth(),
    checkEmailServiceHealth(),
    Promise.resolve(getSystemMetrics()),
  ]);
  
  const checks = {
    database,
    email,
  };
  
  // Determine overall status
  const hasUnhealthyCritical = HEALTH_CHECK_CONFIG.criticalServices.some(
    service => checks[service as keyof typeof checks]?.status === 'unhealthy'
  );
  
  const hasDegraded = Object.values(checks).some(
    check => check.status === 'degraded'
  );
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (hasUnhealthyCritical) {
    status = 'unhealthy';
  } else if (hasDegraded) {
    status = 'degraded';
  }
  
  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
    metrics,
  };
}

/**
 * GET /api/health
 * 
 * Main health check endpoint
 */
export async function GET(request: NextRequest) {
  const now = Date.now();
  
  // Check if we should use cached result
  const useCache = now - lastCheckTime < CACHE_DURATION;
  const skipCache = request.headers.get('x-skip-cache') === 'true';
  
  if (useCache && cachedResult && !skipCache) {
    const isHealthy = cachedResult.status === 'healthy';
    return NextResponse.json(cachedResult, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Cache': 'HIT',
      },
    });
  }
  
  try {
    const result = await runHealthChecks();
    cachedResult = result;
    lastCheckTime = now;
    
    // Log degraded/unhealthy states
    if (result.status !== 'healthy') {
      logger.warn(`Health check ${result.status}`, {
        status: result.status,
        checks: result.checks,
      });
    }
    
    const isHealthy = result.status === 'healthy';
    
    return NextResponse.json(result, {
      status: isHealthy ? 200 : result.status === 'degraded' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check execution failed',
      },
      { status: 503 }
    );
  }
}

/**
 * GET /api/health/ready
 * 
 * Kubernetes-style readiness probe
 */
export async function HEAD(request: NextRequest) {
  const result = await runHealthChecks();
  
  const isReady = result.status !== 'unhealthy';
  
  return new NextResponse(null, {
    status: isReady ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
}

// Also support POST for load balancer health checks
export { GET as POST };
