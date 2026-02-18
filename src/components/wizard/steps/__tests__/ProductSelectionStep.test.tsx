/**
 * ProductSelectionStep Component Tests
 * Tests for the Product Selection wizard step
 * @module components/wizard/steps/__tests__/ProductSelectionStep
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductSelectionStep from '../ProductSelectionStep';
import type { ProductSelectionData, Product } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, whileHover, whileTap, layout, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, whileHover, whileTap, layout, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    p: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, layout, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ProductSelectionStep', () => {
  const mockOnUpdate = jest.fn();

  const defaultData: ProductSelectionData = {
    selectedProducts: [],
    selectedVariants: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders step title and description', () => {
    render(<ProductSelectionStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Select Products')).toBeInTheDocument();
    expect(screen.getByText('Search and select products to include in your quote.')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ProductSelectionStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByTestId('product-search-input')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to load products';
    render(<ProductSelectionStep data={defaultData} onUpdate={mockOnUpdate} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows empty state when no products are selected', () => {
    render(<ProductSelectionStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('No products selected yet')).toBeInTheDocument();
    expect(screen.getByText('Search and add products above')).toBeInTheDocument();
  });

  it('displays selected products count', () => {
    const dataWithProducts: ProductSelectionData = {
      selectedProducts: [
        {
          id: 'prod_1',
          title: 'Test Product',
          handle: 'test-product',
          images: [],
          variants: [
            { id: 'var_1', title: 'Default', sku: 'TEST-001', price: 99.99, inventoryQuantity: 10, options: {} }
          ],
          tags: ['test'],
          productType: 'Test',
          vendor: 'Test Vendor',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      selectedVariants: { prod_1: 'var_1' },
    };
    
    render(<ProductSelectionStep data={dataWithProducts} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Selected Products (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('calls onUpdate when removing a product', async () => {
    const user = userEvent.setup();
    const dataWithProducts: ProductSelectionData = {
      selectedProducts: [
        {
          id: 'prod_1',
          title: 'Test Product',
          handle: 'test-product',
          images: [],
          variants: [
            { id: 'var_1', title: 'Default', sku: 'TEST-001', price: 99.99, inventoryQuantity: 10, options: {} }
          ],
          tags: ['test'],
          productType: 'Test',
          vendor: 'Test Vendor',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      selectedVariants: { prod_1: 'var_1' },
    };
    
    render(<ProductSelectionStep data={dataWithProducts} onUpdate={mockOnUpdate} />);
    
    const removeButton = screen.getByLabelText('Remove item');
    await user.click(removeButton);
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
        selectedProducts: [],
        selectedVariants: {}
      }));
    });
  });

  it('shows correct price formatting', () => {
    const dataWithProducts: ProductSelectionData = {
      selectedProducts: [
        {
          id: 'prod_1',
          title: 'Test Product',
          handle: 'test-product',
          images: [],
          variants: [
            { id: 'var_1', title: 'Default', sku: 'TEST-001', price: 99.99, inventoryQuantity: 10, options: {} }
          ],
          tags: ['test'],
          productType: 'Test',
          vendor: 'Test Vendor',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      selectedVariants: { prod_1: 'var_1' },
    };
    
    render(<ProductSelectionStep data={dataWithProducts} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/\$99.99/)).toBeInTheDocument();
  });

  it('handles multiple selected products', () => {
    const dataWithMultipleProducts: ProductSelectionData = {
      selectedProducts: [
        {
          id: 'prod_1',
          title: 'Product A',
          handle: 'product-a',
          images: [],
          variants: [
            { id: 'var_1', title: 'Default', sku: 'A-001', price: 50, inventoryQuantity: 10, options: {} }
          ],
          tags: ['test'],
          productType: 'Test',
          vendor: 'Vendor A',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prod_2',
          title: 'Product B',
          handle: 'product-b',
          images: [],
          variants: [
            { id: 'var_2', title: 'Default', sku: 'B-001', price: 75, inventoryQuantity: 5, options: {} }
          ],
          tags: ['test'],
          productType: 'Test',
          vendor: 'Vendor B',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      selectedVariants: { prod_1: 'var_1', prod_2: 'var_2' },
    };
    
    render(<ProductSelectionStep data={dataWithMultipleProducts} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Selected Products (2)')).toBeInTheDocument();
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });
});
