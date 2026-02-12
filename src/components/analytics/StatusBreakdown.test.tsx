/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBreakdown } from '@/components/analytics/StatusBreakdown';

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data }: { data?: unknown[] }) => (
    <div data-testid="pie" data-points={data?.length}>Pie</div>
  ),
  Cell: ({ fill }: { fill?: string }) => (
    <div data-testid="cell" style={{ fill }}>Cell</div>
  ),
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  Legend: () => <div data-testid="legend">Legend</div>,
}));

const mockData = {
  labels: ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'],
  datasets: [{
    data: [10, 25, 45, 8, 12],
    backgroundColor: ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444', '#6b7280'],
  }],
};

const mockStatusCounts = {
  draft: 10,
  sent: 25,
  accepted: 45,
  declined: 8,
  expired: 12,
};

describe('StatusBreakdown', () => {
  it('renders without crashing', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    expect(screen.getByText(/Status Breakdown/i)).toBeInTheDocument();
  });

  it('displays chart when data is provided', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
        isLoading={true}
      />
    );
    
    expect(screen.getByText(/Loading status breakdown/i)).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(
      <StatusBreakdown 
        data={{ labels: [], datasets: [{ data: [], backgroundColor: [] }] }}
        statusCounts={{}}
      />
    );
    
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('displays status counts correctly', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    expect(screen.getByText('45')).toBeInTheDocument(); // accepted
    expect(screen.getByText('25')).toBeInTheDocument(); // sent
    expect(screen.getByText('10')).toBeInTheDocument(); // draft
  });

  it('displays status labels', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    expect(screen.getByText(/Accepted/i)).toBeInTheDocument();
    expect(screen.getByText(/Sent/i)).toBeInTheDocument();
    expect(screen.getByText(/Draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Declined/i)).toBeInTheDocument();
    expect(screen.getByText(/Expired/i)).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders tooltip', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('handles missing status counts gracefully', () => {
    const incompleteCounts = {
      draft: 5,
      // missing other statuses
    };
    
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={incompleteCounts}
      />
    );
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays total quotes count', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    // Total: 10 + 25 + 45 + 8 + 12 = 100
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('shows percentage for each status', () => {
    render(
      <StatusBreakdown 
        data={mockData}
        statusCounts={mockStatusCounts}
      />
    );
    
    // Check for percentage symbols
    const percentages = screen.getAllByText(/%/);
    expect(percentages.length).toBeGreaterThan(0);
  });
});
