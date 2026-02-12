/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBreakdown } from '@/components/analytics/StatusBreakdown';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container" style={{ width: '100%', height: '300px' }}>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data, children }: { data?: unknown[]; children?: React.ReactNode }) => (
    <div data-testid="pie" data-points={data?.length}>Pie{children}</div>
  ),
  Cell: ({ fill }: { fill?: string }) => (
    <div data-testid="cell" style={{ fill }}>Cell</div>
  ),
  Tooltip: ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="tooltip">{content || 'Tooltip'}</div>
  ),
  Legend: ({ formatter }: { formatter?: (value: string) => string }) => (
    <div data-testid="legend">{formatter ? formatter('accepted') : 'Legend'}</div>
  ),
}));

const mockData = [
  { status: 'draft' as const, count: 10, value: 5000, percentage: 10 },
  { status: 'sent' as const, count: 25, value: 15000, percentage: 25 },
  { status: 'accepted' as const, count: 45, value: 45000, percentage: 45 },
  { status: 'rejected' as const, count: 8, value: 8000, percentage: 8 },
  { status: 'expired' as const, count: 12, value: 12000, percentage: 12 },
];

describe('StatusBreakdown', () => {
  it('renders without crashing', () => {
    render(<StatusBreakdown data={mockData} />);
    
    expect(screen.getByText(/Quote Status Breakdown/i)).toBeInTheDocument();
  });

  it('displays chart when data is provided', () => {
    render(<StatusBreakdown data={mockData} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    const { container } = render(<StatusBreakdown data={mockData} isLoading={true} />);
    
    // Loading state has animate-pulse class
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('displays total quotes count', () => {
    render(<StatusBreakdown data={mockData} />);
    
    // Total: 10 + 25 + 45 + 8 + 12 = 100
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays total value', () => {
    render(<StatusBreakdown data={mockData} />);
    
    // Total value: 5000 + 15000 + 45000 + 8000 + 12000 = 85,000
    expect(screen.getByText(/\$85,000|\$85,0/)).toBeInTheDocument();
  });

  it('calculates average value correctly', () => {
    render(<StatusBreakdown data={mockData} />);
    
    // Average: 85000 / 100 = 850
    expect(screen.getByText(/\$850/)).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<StatusBreakdown data={mockData} />);
    
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders tooltip wrapper', () => {
    render(<StatusBreakdown data={mockData} />);
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    render(<StatusBreakdown data={[]} />);
    
    expect(screen.getByText(/Quote Status Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatusBreakdown data={mockData} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays description text', () => {
    render(<StatusBreakdown data={mockData} />);
    
    expect(screen.getByText(/Distribution of quotes by status/i)).toBeInTheDocument();
  });

  it('displays quotes label', () => {
    render(<StatusBreakdown data={mockData} />);
    
    // "quotes" label appears near the total count
    const quotesElements = screen.getAllByText(/quotes/i);
    expect(quotesElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders summary stats section', () => {
    render(<StatusBreakdown data={mockData} />);
    
    expect(screen.getByText(/Total Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Value/i)).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleData = [{ status: 'accepted' as const, count: 1, value: 1000, percentage: 100 }];
    
    render(<StatusBreakdown data={singleData} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    // Total value should be $1,000
    const totalValues = screen.getAllByText(/\$1,000|\$1000/);
    expect(totalValues.length).toBeGreaterThan(0);
  });

  it('handles zero average when no quotes', () => {
    render(<StatusBreakdown data={[]} />);
    
    expect(screen.getByText(/Avg Value/i)).toBeInTheDocument();
  });
});
