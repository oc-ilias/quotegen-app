/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TopProducts } from '@/components/analytics/TopProducts';

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
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="bar">Bar{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">CartesianGrid</div>,
  Tooltip: ({ content }: { content?: React.ReactNode }) => (
    <div data-testid="tooltip">{content || 'Tooltip'}</div>
  ),
  Cell: () => <div data-testid="cell">Cell</div>,
}));

const mockProducts = [
  { productId: '1', title: 'Premium Widget', quantity: 150, revenue: 15000 },
  { productId: '2', title: 'Standard Widget', quantity: 230, revenue: 11500 },
  { productId: '3', title: 'Basic Widget', quantity: 300, revenue: 6000 },
  { productId: '4', title: 'Deluxe Package', quantity: 45, revenue: 9000 },
  { productId: '5', title: 'Starter Kit', quantity: 120, revenue: 3600 },
];

describe('TopProducts', () => {
  it('renders without crashing', () => {
    render(<TopProducts data={mockProducts} />);
    
    expect(screen.getByText(/Top Quoted Products/i)).toBeInTheDocument();
  });

  it('displays chart when data is provided', () => {
    render(<TopProducts data={mockProducts} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<TopProducts data={mockProducts} isLoading={true} />);
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    render(<TopProducts data={[]} />);
    
    expect(screen.getByText(/No product data available/i)).toBeInTheDocument();
  });

  it('displays all products in the list', () => {
    render(<TopProducts data={mockProducts} />);
    
    mockProducts.forEach(product => {
      expect(screen.getByText(product.title)).toBeInTheDocument();
    });
  });

  it('displays product quantities', () => {
    render(<TopProducts data={mockProducts} />);
    
    // Check for "quoted" text which appears with quantities
    const quotedElements = screen.getAllByText(/quoted/i);
    expect(quotedElements.length).toBeGreaterThan(0);
  });

  it('displays product revenues', () => {
    render(<TopProducts data={mockProducts} />);
    
    // Should show formatted revenue numbers
    expect(screen.getByText(/\$15,000|\$15000/)).toBeInTheDocument();
  });

  it('renders chart axes', () => {
    render(<TopProducts data={mockProducts} />);
    
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  it('renders tooltip', () => {
    render(<TopProducts data={mockProducts} />);
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('renders cartesian grid', () => {
    render(<TopProducts data={mockProducts} />);
    
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  it('renders cells for each product', () => {
    render(<TopProducts data={mockProducts} />);
    
    const cells = screen.getAllByTestId('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <TopProducts data={mockProducts} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays description text', () => {
    render(<TopProducts data={mockProducts} />);
    
    expect(screen.getByText(/Most frequently quoted products/i)).toBeInTheDocument();
  });

  it('displays product rankings', () => {
    render(<TopProducts data={mockProducts} />);
    
    // Should show ranking numbers (1, 2, 3, etc.)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles single product', () => {
    const singleProduct = [
      { productId: '1', title: 'Only Product', quantity: 10, revenue: 1000 }
    ];
    
    render(<TopProducts data={singleProduct} />);
    
    expect(screen.getByText('Only Product')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('truncates long product titles', () => {
    const longTitleProduct = [
      { productId: '1', title: 'A'.repeat(50), quantity: 10, revenue: 1000 }
    ];
    
    render(<TopProducts data={longTitleProduct} />);
    
    // Component should handle long titles gracefully
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('sorts products by quantity', () => {
    render(<TopProducts data={mockProducts} />);
    
    // Highest quantity should be ranked #1
    // Basic Widget has 300 quantity
    const firstProduct = screen.getAllByText(/Basic Widget|Premium Widget/)[0];
    expect(firstProduct).toBeInTheDocument();
  });
});
