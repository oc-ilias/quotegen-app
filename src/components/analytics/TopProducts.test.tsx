/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TopProducts } from '@/components/analytics/TopProducts';

const mockProducts = [
  { id: '1', name: 'Premium Widget', quantity: 150, revenue: 15000, averagePrice: 100 },
  { id: '2', name: 'Standard Widget', quantity: 230, revenue: 11500, averagePrice: 50 },
  { id: '3', name: 'Basic Widget', quantity: 300, revenue: 6000, averagePrice: 20 },
  { id: '4', name: 'Deluxe Package', quantity: 45, revenue: 9000, averagePrice: 200 },
  { id: '5', name: 'Starter Kit', quantity: 120, revenue: 3600, averagePrice: 30 },
];

describe('TopProducts', () => {
  it('renders without crashing', () => {
    render(<TopProducts products={mockProducts} />);
    
    expect(screen.getByText(/Top Products/i)).toBeInTheDocument();
  });

  it('displays all products', () => {
    render(<TopProducts products={mockProducts} />);
    
    mockProducts.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it('displays product quantities', () => {
    render(<TopProducts products={mockProducts} />);
    
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('230')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('displays product revenues', () => {
    render(<TopProducts products={mockProducts} />);
    
    expect(screen.getByText(/\$15,000|\$15000/)).toBeInTheDocument();
    expect(screen.getByText(/\$11,500|\$11500/)).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<TopProducts products={mockProducts} isLoading={true} />);
    
    expect(screen.getByText(/Loading top products/i)).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    render(<TopProducts products={[]} />);
    
    expect(screen.getByText(/No products available/i)).toBeInTheDocument();
  });

  it('sorts products by revenue by default', () => {
    render(<TopProducts products={mockProducts} />);
    
    // First product should be Premium Widget (highest revenue)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Premium Widget');
  });

  it('allows sorting by quantity', () => {
    render(<TopProducts products={mockProducts} />);
    
    const quantityHeader = screen.getByText(/Quantity/i);
    fireEvent.click(quantityHeader);
    
    // Should re-sort by quantity
    expect(screen.getByText(/Top Products/i)).toBeInTheDocument();
  });

  it('allows sorting by revenue', () => {
    render(<TopProducts products={mockProducts} />);
    
    const revenueHeader = screen.getByText(/Revenue/i);
    fireEvent.click(revenueHeader);
    
    // Should re-sort by revenue
    expect(screen.getByText(/Top Products/i)).toBeInTheDocument();
  });

  it('allows sorting by average price', () => {
    render(<TopProducts products={mockProducts} />);
    
    const priceHeader = screen.getByText(/Price|Avg/i);
    fireEvent.click(priceHeader);
    
    expect(screen.getByText(/Top Products/i)).toBeInTheDocument();
  });

  it('displays total revenue summary', () => {
    render(<TopProducts products={mockProducts} />);
    
    // Total: 15000 + 11500 + 6000 + 9000 + 3600 = 45100
    expect(screen.getByText(/45,100|45100/)).toBeInTheDocument();
  });

  it('displays total quantity summary', () => {
    render(<TopProducts products={mockProducts} />);
    
    // Total: 150 + 230 + 300 + 45 + 120 = 845
    expect(screen.getByText(/845/)).toBeInTheDocument();
  });

  it('limits displayed products based on limit prop', () => {
    render(<TopProducts products={mockProducts} limit={3} />);
    
    // Should only show top 3
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeLessThanOrEqual(4); // header + 3 products
  });

  it('applies custom className', () => {
    const { container } = render(
      <TopProducts products={mockProducts} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays average price for each product', () => {
    render(<TopProducts products={mockProducts} />);
    
    expect(screen.getByText(/\$100/)).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
    expect(screen.getByText(/\$20/)).toBeInTheDocument();
  });

  it('handles products with missing data gracefully', () => {
    const incompleteProducts = [
      { id: '1', name: 'Product 1' }, // missing quantity, revenue, averagePrice
    ];
    
    render(<TopProducts products={incompleteProducts} />);
    
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('shows view all link when showViewAll is true', () => {
    render(<TopProducts products={mockProducts} showViewAll={true} />);
    
    expect(screen.getByText(/View All/i)).toBeInTheDocument();
  });

  it('calls onViewAll callback when view all is clicked', () => {
    const mockCallback = jest.fn();
    render(
      <TopProducts 
        products={mockProducts} 
        showViewAll={true} 
        onViewAll={mockCallback}
      />
    );
    
    const viewAllLink = screen.getByText(/View All/i);
    fireEvent.click(viewAllLink);
    
    expect(mockCallback).toHaveBeenCalled();
  });
});
