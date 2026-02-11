/**
 * Monitoring Dashboard Page
 * 
 * Internal dashboard for viewing system health and metrics.
 * Protected - should only be accessible to admin users.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ServerIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: Record<string, ServiceCheck>;
  metrics?: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

interface ServiceCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  lastChecked: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unhealthy: 'bg-red-100 text-red-800 border-red-200',
  };

  const icons = {
    healthy: CheckCircleIcon,
    degraded: ExclamationTriangleIcon,
    unhealthy: ExclamationTriangleIcon,
  };

  const Icon = icons[status as keyof typeof icons] || ExclamationTriangleIcon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.unhealthy}`}>
      <Icon className="h-4 w-4 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: typeof HeartIcon;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}

export default function MonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/health', {
        headers: { 'x-skip-cache': 'true' },
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealth(data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Monitor application health, performance, and service status
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {lastRefreshed && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Overall Status */}
        {health && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HeartIcon className={`h-8 w-8 mr-3 ${
                    health.status === 'healthy' ? 'text-green-500' :
                    health.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Overall Status: <StatusBadge status={health.status} />
                    </p>
                    <p className="text-sm text-gray-500">
                      Version {health.version} • {health.environment}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Environment</p>
                  <p className="font-medium text-gray-900 capitalize">{health.environment}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {health?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Uptime"
              value={formatUptime(health.metrics.uptime)}
              icon={ClockIcon}
              color="text-blue-600"
            />
            
            <MetricCard
              title="Memory Usage"
              value={`${health.metrics.memory.percentage}%`}
              subtitle={`${health.metrics.memory.used}MB / ${health.metrics.memory.total}MB`}
              icon={ServerIcon}
              color={health.metrics.memory.percentage > 80 ? 'text-red-600' : 'text-green-600'}
            />
            
            <MetricCard
              title="Services"
              value={`${Object.values(health.checks).filter(c => c.status === 'healthy').length}/${Object.keys(health.checks).length}`}
              subtitle="Healthy services"
              icon={CheckCircleIcon}
              color="text-green-600"
            />
            
            <MetricCard
              title="Response Time"
              value={`${Math.round(Object.values(health.checks).reduce((acc, c) => acc + c.responseTime, 0) / Object.values(health.checks).length)}ms`}
              subtitle="Average"
              icon={ChartBarIcon}
              color="text-purple-600"
            />
          </div>
        )}

        {/* Service Checks */}
        {health?.checks && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Service Health</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {Object.entries(health.checks).map(([name, check]) => (
                <div key={name} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mr-3 ${
                        check.status === 'healthy' ? 'bg-green-500' :
                        check.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{name.replace(/_/g, ' ')}</p>
                        {check.message && (
                          <p className="text-sm text-gray-500">{check.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{check.responseTime}ms</p>
                      <p className="text-xs text-gray-500">
                        {new Date(check.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !health && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        )}
      </div>
    </div>
  );
}
