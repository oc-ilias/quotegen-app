/**
 * Analytics Components Index
 * @module components/analytics
 */

export { AnalyticsDashboardEnhanced } from './AnalyticsDashboardEnhanced';
export type { 
  AnalyticsDashboardEnhancedProps,
  DateRange,
  AnalyticsData,
  DashboardStats,
} from './AnalyticsDashboardEnhanced';

// New analytics components
export { FunnelChart } from './FunnelChart';
export type { FunnelChartProps } from './FunnelChart';

export { GeographicMap } from './GeographicMap';
export type { GeographicMapProps } from './GeographicMap';
export { generateMockRegionData } from './GeographicMap';

export { PerformanceMetrics } from './PerformanceMetrics';
export type { PerformanceMetricsProps } from './PerformanceMetrics';

// Re-export existing components
export { RevenueChart } from './RevenueChart';
export { ConversionChart } from './ConversionChart';
export { StatusBreakdown } from './StatusBreakdown';
export { TopProducts } from './TopProducts';
export { AnalyticsDashboard } from './AnalyticsDashboard';
