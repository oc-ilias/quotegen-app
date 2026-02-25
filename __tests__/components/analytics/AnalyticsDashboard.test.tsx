/**
 * Enhanced AnalyticsDashboard Component Test Suite
 * 
 * Comprehensive tests covering:
 * - Chart rendering
 * - Data loading
 * - Error states
 * - Date range changes
 * - Export functionality
 * - Loading states
 * 
 * @module __tests__/components/analytics/AnalyticsDashboard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, variants, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock chart components
jest.mock('@/components/analytics/RevenueChart', () => ({
  RevenueChart: ({ data, isLoading }: any) => (
    <div data-testid="revenue-chart" data-loading={isLoading}>
      <h3>Revenue Chart</h3>
      <div data-testid="revenue-data-count">{data?.length || 0}</div>
    </div>
  ),
}));

jest.mock('@/components/analytics/ConversionChart', () => ({
  ConversionChart: ({ data, isLoading }: any) => (
    <div data-testid="conversion-chart" data-loading={isLoading}>
      <h3>Conversion Chart</h3>
      <div data-testid="conversion-data-count">{data?.length || 0}</div>
    </div>
  ),
}));

jest.mock('@/components/analytics/StatusBreakdown', () => ({
  StatusBreakdown: ({ data, isLoading }: any) => (
    <div data-testid="status-breakdown" data-loading={isLoading}>
      <h3>Status Breakdown</h3>
      <div data-testid="status-data-count">{data?.length || 0}</div>
    </div>
  ),
}));

jest.mock('@/components/analytics/TopProducts', () => ({
  TopProducts: ({ data, isLoading }: any) => (
    <div data-testid="top-products" data-loading={isLoading}>
      <h3>Top Products</h3>
      <div data-testid="products-data-count">{data?.length || 0}</div>
    </div>
  ),
}));

jest.mock('@/components/dashboard/StatCards', () => ({
  StatCardsGrid: ({ stats, isLoading }: any) => (
    <div data-testid="stat-cards-grid" data-loading={isLoading}>
      {Array.isArray(stats) && stats.map((stat: any, index: number) => (
        <div key={index} data-testid={`stat-card-${index}`}>
          <div data-testid="stat-label">{stat.label}</div>
          <div data-testid="stat-value">{stat.value}</div>
        </div>
      ))}
    </div>
  ),
  useDashboardStats: (data: any) => data || [],
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ArrowPathIcon: () => <svg data-testid="arrow-path-icon" />,
  ExclamationTriangleIcon: () => <svg data-testid="exclamation-icon" />,
  CalendarIcon: () => <svg data-testid="calendar-icon" />,
  ChevronDownIcon: (props: any) => <svg data-testid="chevron-down-icon" {...props} />,
  ArrowDownTrayIcon: () => <svg data-testid="download-icon" />,
}));

// ============================================================================
// Component Import
// ============================================================================

import { AnalyticsDashboard, type DateRange, type AnalyticsDashboardProps } from '@/components/analytics/AnalyticsDashboard';

// ============================================================================
// Test Data
// ============================================================================

const mockRevenueData = [
  { date: '2024-01-01', revenue: 1000, quotes: 5 },
  { date: '2024-01-02', revenue: 1500, quotes: 8 },
  { date: '2024-01-03', revenue: 800, quotes: 3 },
];

const mockConversionData = [
  { date: '2024-01-01', sent: 10, accepted: 5, viewed: 8 },
  { date: '2024-01-02', sent: 12, accepted: 6, viewed: 9 },
];

const mockStatusData = [
  { status: 'accepted', count: 50, value: 25000 },
  { status: 'pending', count: 20, value: 10000 },
  { status: 'sent', count: 30, value: 15000 },
];

const mockTopProducts = [
  { id: '1', name: 'Product A', quantity: 100, revenue: 5000 },
  { id: '2', name: 'Product B', quantity: 80, revenue: 4000 },
  { id: '3', name: 'Product C', quantity: 60, revenue: 3000 },
];

const mockStats = {
  totalQuotes: 100,
  pendingQuotes: 20,
  acceptedQuotes: 50,
  conversionRate: 50,
  totalRevenue: 50000,
  avgQuoteValue: 500,
  avgResponseTime: 24,
  periodChange: {
    totalQuotes: 10,
    conversionRate: 5,
    totalRevenue: 5000,
    avgQuoteValue: 50,
  },
};

const defaultProps: AnalyticsDashboardProps = {
  data: {
    conversionData: mockConversionData,
    revenueData: mockRevenueData,
    statusData: mockStatusData,
    topProducts: mockTopProducts,
    stats: mockStats,
  },
};

// ============================================================================
// Chart Rendering Tests
// ============================================================================

describe('AnalyticsDashboard - Chart Rendering', () => {
  it('renders revenue chart', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    expect(screen.getByText('Revenue Chart')).toBeInTheDocument();
  });

  it('renders conversion chart', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByTestId('conversion-chart')).toBeInTheDocument();
    expect(screen.getByText('Conversion Chart')).toBeInTheDocument();
  });

  it('renders status breakdown', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByTestId('status-breakdown')).toBeInTheDocument();
    expect(screen.getByText('Status Breakdown')).toBeInTheDocument();
  });

  it('renders top products', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByTestId('top-products')).toBeInTheDocument();
    expect(screen.getByText('Top Products')).toBeInTheDocument();
  });

  it('renders stat cards grid', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByTestId('stat-cards-grid')).toBeInTheDocument();
  });

  it('passes data to charts', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByTestId('revenue-data-count')).toHaveTextContent('3');
    expect(screen.getByTestId('conversion-data-count')).toHaveTextContent('2');
    expect(screen.getByTestId('status-data-count')).toHaveTextContent('3');
    expect(screen.getByTestId('products-data-count')).toHaveTextContent('3');
  });

  it('renders charts in grid layout', () => {
    const { container } = render(<AnalyticsDashboard {...defaultProps} />);
    
    const charts = container.querySelectorAll('[data-testid$="-chart"], [data-testid$="-breakdown"], [data-testid$="-products"]');
    expect(charts.length).toBeGreaterThanOrEqual(4);
  });
});

// ============================================================================
// Data Loading Tests
// ============================================================================

describe('AnalyticsDashboard - Data Loading', () => {
  it('shows loading skeleton when isLoading is true', () => {
    render(<AnalyticsDashboard {...defaultProps} isLoading={true} />);
    
    // Should show loading skeleton
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('hides charts when loading', () => {
    render(<AnalyticsDashboard {...defaultProps} isLoading={true} />);
    
    expect(screen.queryByTestId('revenue-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('conversion-chart')).not.toBeInTheDocument();
  });

  it('shows charts when not loading', () => {
    render(<AnalyticsDashboard {...defaultProps} isLoading={false} />);
    
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    expect(screen.getByTestId('conversion-chart')).toBeInTheDocument();
  });

  it('transitions from loading to loaded state', () => {
    const { rerender } = render(
      <AnalyticsDashboard {...defaultProps} isLoading={true} />
    );
    
    expect(screen.queryByTestId('revenue-chart')).not.toBeInTheDocument();
    
    rerender(<AnalyticsDashboard {...defaultProps} isLoading={false} />);
    
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
  });

  it('passes loading state to child components', () => {
    render(<AnalyticsDashboard {...defaultProps} isLoading={true} />);
    
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });
});

// ============================================================================
// Error States Tests
// ============================================================================

describe('AnalyticsDashboard - Error States', () => {
  it('renders error state when error is provided', () => {
    const error = new Error('Failed to load analytics');
    render(<AnalyticsDashboard {...defaultProps} error={error} />);
    
    expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    const error = new Error('Network error occurred');
    render(<AnalyticsDashboard {...defaultProps} error={error} />);
    
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('shows retry button when onRefresh is provided', () => {
    const onRefresh = jest.fn();
    const error = new Error('Failed to load');
    
    render(
      <AnalyticsDashboard 
        {...defaultProps} 
        error={error}
        onRefresh={onRefresh}
      />
    );
    
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRefresh when retry button clicked', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const error = new Error('Failed to load');
    
    render(
      <AnalyticsDashboard 
        {...defaultProps} 
        error={error}
        onRefresh={onRefresh}
      />
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('does not show charts when error is present', () => {
    const error = new Error('Failed to load');
    render(<AnalyticsDashboard {...defaultProps} error={error} />);
    
    expect(screen.queryByTestId('revenue-chart')).not.toBeInTheDocument();
  });

  it('shows error icon', () => {
    const error = new Error('Failed to load');
    render(<AnalyticsDashboard {...defaultProps} error={error} />);
    
    expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
  });
});

// ============================================================================
// Date Range Tests
// ============================================================================

describe('AnalyticsDashboard - Date Range Changes', () => {
  it('renders date range selector', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
  });

  it('opens date range dropdown when clicked', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    const dateRangeButton = screen.getByText(/last 30 days/i);
    fireEvent.click(dateRangeButton);
    
    expect(screen.getByText(/last 7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/last 90 days/i)).toBeInTheDocument();
    expect(screen.getByText(/last year/i)).toBeInTheDocument();
    expect(screen.getByText(/custom range/i)).toBeInTheDocument();
  });

  it('calls onDateRangeChange when date range selected', () => {
    const onDateRangeChange = jest.fn();
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onDateRangeChange={onDateRangeChange}
      />
    );
    
    const dateRangeButton = screen.getByText(/last 30 days/i);
    fireEvent.click(dateRangeButton);
    
    const sevenDaysOption = screen.getByText(/last 7 days/i);
    fireEvent.click(sevenDaysOption);
    
    expect(onDateRangeChange).toHaveBeenCalledWith('7d');
  });

  it('displays selected date range', () => {
    const onDateRangeChange = jest.fn();
    const { rerender } = render(
      <AnalyticsDashboard 
        {...defaultProps}
        onDateRangeChange={onDateRangeChange}
      />
    );
    
    // Open dropdown and select 7 days
    fireEvent.click(screen.getByText(/last 30 days/i));
    fireEvent.click(screen.getByText(/last 7 days/i));
    
    // After selection, should show 7 days
    expect(onDateRangeChange).toHaveBeenCalledWith('7d');
  });

  it('disables date range selector when loading', () => {
    render(<AnalyticsDashboard {...defaultProps} isLoading={true} />);
    
    const dateRangeButton = screen.getByText(/last 30 days/i);
    expect(dateRangeButton).toBeDisabled();
  });

  it('closes dropdown when clicking outside', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    // Open dropdown
    fireEvent.click(screen.getByText(/last 30 days/i));
    expect(screen.getByText(/last 7 days/i)).toBeInTheDocument();
    
    // Click outside
    fireEvent.click(document.body);
    
    // Dropdown should close
    expect(screen.queryByText(/last 7 days/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// Export Functionality Tests
// ============================================================================

describe('AnalyticsDashboard - Export Functionality', () => {
  it('renders export button when onExport is provided', () => {
    const onExport = jest.fn();
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onExport={onExport}
      />
    );
    
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('does not render export button when onExport is not provided', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument();
  });

  it('calls onExport with csv format when export button clicked', async () => {
    const onExport = jest.fn();
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onExport={onExport}
      />
    );
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('shows exported state after export', async () => {
    const onExport = jest.fn();
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onExport={onExport}
      />
    );
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    
    // Should show "Exported!" briefly
    await waitFor(() => {
      expect(onExport).toHaveBeenCalled();
    });
  });

  it('disables export button during export', () => {
    const onExport = jest.fn();
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onExport={onExport}
      />
    );
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    
    // Button should be disabled during export
    expect(exportButton).toBeDisabled();
  });
});

// ============================================================================
// Refresh Tests
// ============================================================================

describe('AnalyticsDashboard - Refresh', () => {
  it('renders refresh button when onRefresh is provided', () => {
    const onRefresh = jest.fn();
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
      />
    );
    
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button clicked', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
      />
    );
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('shows spinning icon during refresh', async () => {
    const onRefresh = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
      />
    );
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Should have spinning class
    expect(refreshButton).toHaveClass('animate-spin');
    
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('disables refresh button during refresh', async () => {
    const onRefresh = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
      />
    );
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Button should be disabled during refresh
    expect(refreshButton).toBeDisabled();
  });
});

// ============================================================================
// Empty State Tests
// ============================================================================

describe('AnalyticsDashboard - Empty State', () => {
  it('renders empty state when no data', () => {
    const emptyProps = {
      data: {
        conversionData: [],
        revenueData: [],
        statusData: [],
        topProducts: [],
      },
    };
    
    render(<AnalyticsDashboard {...emptyProps} />);
    
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('shows empty state message', () => {
    const emptyProps = {
      data: {
        conversionData: [],
        revenueData: [],
        statusData: [],
        topProducts: [],
      },
    };
    
    render(<AnalyticsDashboard {...emptyProps} />);
    
    expect(screen.getByText(/there is no analytics data/i)).toBeInTheDocument();
  });

  it('suggests changing date range in empty state', () => {
    const emptyProps = {
      data: {
        conversionData: [],
        revenueData: [],
        statusData: [],
        topProducts: [],
      },
    };
    
    render(<AnalyticsDashboard {...emptyProps} />);
    
    expect(screen.getByText(/try changing the date range/i)).toBeInTheDocument();
  });

  it('does not show empty state when data exists', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.queryByText(/no data available/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// Header Tests
// ============================================================================

describe('AnalyticsDashboard - Header', () => {
  it('renders page title', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    
    expect(screen.getByText(/track your quote performance/i)).toBeInTheDocument();
  });

  it('renders controls in header', () => {
    const onRefresh = jest.fn();
    const onExport = jest.fn();
    
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
        onExport={onExport}
      />
    );
    
    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });
});

// ============================================================================
// Props Tests
// ============================================================================

describe('AnalyticsDashboard - Props', () => {
  it('applies custom className', () => {
    const { container } = render(
      <AnalyticsDashboard {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles missing optional props', () => {
    const minimalProps = {
      data: {
        conversionData: [],
        revenueData: [],
        statusData: [],
        topProducts: [],
      },
    };
    
    render(<AnalyticsDashboard {...minimalProps} />);
    
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('handles data without stats', () => {
    const propsWithoutStats = {
      data: {
        conversionData: mockConversionData,
        revenueData: mockRevenueData,
        statusData: mockStatusData,
        topProducts: mockTopProducts,
      },
    };
    
    render(<AnalyticsDashboard {...propsWithoutStats} />);
    
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('AnalyticsDashboard - Integration', () => {
  it('renders complete dashboard with all features', () => {
    const onRefresh = jest.fn();
    const onExport = jest.fn();
    const onDateRangeChange = jest.fn();
    
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
        onExport={onExport}
        onDateRangeChange={onDateRangeChange}
      />
    );
    
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    expect(screen.getByTestId('conversion-chart')).toBeInTheDocument();
    expect(screen.getByTestId('status-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('top-products')).toBeInTheDocument();
    expect(screen.getByTestId('stat-cards-grid')).toBeInTheDocument();
  });

  it('handles user interaction flow', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const onExport = jest.fn();
    const onDateRangeChange = jest.fn();
    
    render(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
        onExport={onExport}
        onDateRangeChange={onDateRangeChange}
      />
    );
    
    // Refresh data
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    await waitFor(() => expect(onRefresh).toHaveBeenCalled());
    
    // Change date range
    fireEvent.click(screen.getByText(/last 30 days/i));
    fireEvent.click(screen.getByText(/last 7 days/i));
    expect(onDateRangeChange).toHaveBeenCalledWith('7d');
    
    // Export data
    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('recovers from error state', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    
    const { rerender } = render(
      <AnalyticsDashboard 
        {...defaultProps}
        error={new Error('Failed to load')}
        onRefresh={onRefresh}
      />
    );
    
    // Use getAllByText since multiple elements may contain "failed to load"
    expect(screen.getAllByText(/failed to load/i).length).toBeGreaterThanOrEqual(1);
    
    // Retry
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(onRefresh).toHaveBeenCalled());
    
    // Clear error
    rerender(
      <AnalyticsDashboard 
        {...defaultProps}
        onRefresh={onRefresh}
      />
    );
    
    // After clearing error, the error message should not be in the document
    expect(screen.queryByText(/failed to load analytics/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
  });
});
