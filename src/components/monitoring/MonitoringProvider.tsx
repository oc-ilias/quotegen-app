/**
 * Monitoring Provider
 * 
 * Initializes all monitoring systems:
 * - Global error handlers
 * - Performance monitoring (RUM)
 * - User action tracking
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { initializeGlobalErrorHandlers } from '@/components/error';
import { usePerformanceMonitoring } from '@/lib/performance-monitor';

interface MonitoringProviderProps {
  children: ReactNode;
}

function MonitoringInitializer() {
  useEffect(() => {
    // Initialize global error handlers
    initializeGlobalErrorHandlers();
    
    // Log initialization
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitoring] Global error handlers initialized');
    }
  }, []);
  
  // Initialize performance monitoring
  usePerformanceMonitoring();
  
  return null;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  return (
    <>
      <MonitoringInitializer />
      {children}
    </>
  );
}
