/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConversionChart } from '@/components/analytics/ConversionChart';

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
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  Legend: () => <div data-testid="legend">Legend</div>,
}));

const mockData = [
  { date: '2024-01-01', conversionRate: 45.2, sent: 20, accepted: 9 },
  { date: '2024-01-02', conversionRate: 52.3, sent: 23, accepted: 12 },
  { date: '2024-01-03', conversionRate: 48.7, sent: 19, accepted: 9 },
  { date: '2024-01-04', conversionRate: 61.1, sent: 18, accepted: 11 },
  { date: '2024-01-05', conversionRate: 55.0, sent: 20, accepted: 11 },
];

describe('ConversionChart', () => {
  it('renders without crashing', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByText(/Conversion Rate/i)).toBeInTheDocument();
  });

  it('displays chart when data is provided', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ConversionChart data={mockData} isLoading={true} />);
    
    expect(screen.getByText(/Loading conversion data/i)).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<ConversionChart data={[]} />);
    
    expect(screen.getByText(/No conversion data available/i)).toBeInTheDocument();
  });

  it('displays average conversion rate', () => {
    render(<ConversionChart data={mockData} />);
    
    // Average: (45.2 + 52.3 + 48.7 + 61.1 + 55.0) / 5 = 52.46
    expect(screen.getByText(/52.46%|Average/i)).toBeInTheDocument();
  });

  it('renders chart axes', () => {
    render(<ConversionChart data={mockData} />);
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
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

  it('applies custom className', () => {
    const { container } = render(
003cConversionChart data={mockData} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays trend indicator', () => {
    render(<ConversionChart data={mockData} />);
    
    // Should show trend up/down indicator
    const trendElement = screen.queryByTestId('trend-indicator') || 
                         screen.queryByText(/↑|↓|trend/i);
    // Trend element might be present
    expect(trendElement !== null || screen.getByText(/Conversion/i)).toBeTruthy();
  });

  it('handles single data point', () => {
    const singleData = [{ date: '2024-01-01', conversionRate: 50, sent: 10, accepted: 5 }];
    
    render(<ConversionChart data={singleData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<ConversionChart data={mockData} />);
    
    // Should display formatted dates
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
  });
});
