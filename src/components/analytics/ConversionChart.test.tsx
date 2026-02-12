/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConversionChart } from '@/components/analytics/ConversionChart';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <p {...props}>{children}</p>
    ),
  },
}));

// Mock EmptyState
jest.mock('./EmptyState', () => ({
  EmptyState: ({ title }: { title?: string }) => <div data-testid="empty-state">{title || 'Empty'}</div>,
}));

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line">Line</div>,
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">CartesianGrid</div>,
  Tooltip: ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="tooltip">{content || 'Tooltip'}</div>
  ),
  Legend: () => <div data-testid="legend">Legend</div>,
  ReferenceLine: () => <div data-testid="reference-line">ReferenceLine</div>,
}));

const mockData = [
  { date: '2024-01-01', conversionRate: 45.2, sent: 20, viewed: 15, accepted: 9 },
  { date: '2024-01-02', conversionRate: 52.3, sent: 23, viewed: 18, accepted: 12 },
  { date: '2024-01-03', conversionRate: 48.7, sent: 19, viewed: 14, accepted: 9 },
  { date: '2024-01-04', conversionRate: 61.1, sent: 18, viewed: 16, accepted: 11 },
  { date: '2024-01-05', conversionRate: 55.0, sent: 20, viewed: 15, accepted: 11 },
];

describe('ConversionChart', () => {
  it('renders without crashing', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByText(/Quote Conversion Rate/i)).toBeInTheDocument();
  });

  it('displays chart when data is provided', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    // Multiple lines are rendered (sent, viewed, accepted, conversionRate)
    const lines = screen.getAllByTestId('line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('shows loading state when isLoading is true', () => {
    render(<ConversionChart data={mockData} isLoading={true} />);
    
    // Loading state has animate-pulse class
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<ConversionChart data={[]} />);
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays current conversion rate', () => {
    render(<ConversionChart data={mockData} />);
    
    // Current rate from last data point: 55.0%
    expect(screen.getByText(/55\.0%/)).toBeInTheDocument();
  });

  it('displays trend indicator', () => {
    render(<ConversionChart data={mockData} />);
    
    // Trend is 55.0 - 61.1 = -6.1 (negative)
    expect(screen.getByText(/-6\.1%/)).toBeInTheDocument();
  });

  it('renders chart axes', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    // Multiple Y-axis components (left and right)
    const yAxes = screen.getAllByTestId('y-axis');
    expect(yAxes.length).toBeGreaterThanOrEqual(1);
  });

  it('renders tooltip', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders cartesian grid', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders reference line for target', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('reference-line')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ConversionChart data={mockData} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom title', () => {
    render(<ConversionChart data={mockData} title="Custom Title" />);
    
    expect(screen.getByText(/Custom Title/i)).toBeInTheDocument();
  });

  it('displays total sent', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByText(/Total Sent/i)).toBeInTheDocument();
  });

  it('displays accepted count', () => {
    render(<ConversionChart data={mockData} />);
    
    // "Accepted" appears in multiple places
    const acceptedElements = screen.getAllByText(/Accepted/i);
    expect(acceptedElements.length).toBeGreaterThanOrEqual(1);
  });

  it('displays average rate', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByText(/Avg Rate/i)).toBeInTheDocument();
  });

  it('displays target rate', () => {
    render(<ConversionChart data={mockData} targetRate={30} />);
    
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleData = [
      { date: '2024-01-01', conversionRate: 50, sent: 10, viewed: 8, accepted: 5 }
    ];
    
    render(<ConversionChart data={singleData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    // 50.0% appears in both current rate and avg rate for single data point
    const rates = screen.getAllByText(/50\.0%/);
    expect(rates.length).toBeGreaterThanOrEqual(1);
  });

  it('shows no change when only one data point', () => {
    const singleData = [
      { date: '2024-01-01', conversionRate: 50, sent: 10, viewed: 8, accepted: 5 }
    ];
    
    render(<ConversionChart data={singleData} />);
    
    // Should show 50.0% as current rate
    const currentRates = screen.getAllByText(/50\.0%/);
    expect(currentRates.length).toBeGreaterThan(0);
  });
});
