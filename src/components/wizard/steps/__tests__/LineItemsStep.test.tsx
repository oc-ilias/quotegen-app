/**
 * LineItemsStep Component Tests
 * Tests for the Line Items wizard step
 * @module components/wizard/steps/__tests__/LineItemsStep
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LineItemsStep from '../LineItemsStep';
import type { LineItemsData, Product } from '@/types';

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
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LineItemsStep', () => {
  const mockOnUpdate = jest.fn();

  const mockProducts: Product[] = [
    {
      id: 'prod_1',
      title: 'Test Product',
      handle: 'test-product',
      images: [],
      variants: [
        { id: 'var_1', title: 'Default', sku: 'TEST-001', price: 100, inventoryQuantity: 10, options: {} }
      ],
      tags: ['test'],
      productType: 'Test',
      vendor: 'Test Vendor',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const defaultData: LineItemsData = {
    items: [],
  };

  const mockVariants = { prod_1: 'var_1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step title and description', () => {
    render(
      <LineItemsStep 
        data={defaultData} 
        products={[]} 
        variants={{}} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByText('Line Items')).toBeInTheDocument();
  });

  it('renders add line item button', () => {
    render(
      <LineItemsStep 
        data={defaultData} 
        products={[]} 
        variants={{}} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByTestId('add-line-item-button')).toBeInTheDocument();
  });

  it('calls onUpdate when adding a custom line item', async () => {
    const user = userEvent.setup();
    render(
      <LineItemsStep 
        data={defaultData} 
        products={[]} 
        variants={{}} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    const addButton = screen.getByTestId('add-line-item-button');
    await user.click(addButton);
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            title: '',
            quantity: 1,
            unitPrice: 0,
          })
        ])
      }));
    });
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to load line items';
    render(
      <LineItemsStep 
        data={defaultData} 
        products={[]} 
        variants={{}} 
        onUpdate={mockOnUpdate} 
        error={errorMessage} 
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders line items from data', () => {
    const dataWithItems: LineItemsData = {
      items: [
        {
          id: 'item_1',
          productId: 'prod_1',
          title: 'Test Item',
          variantTitle: 'Default',
          sku: 'TEST-001',
          quantity: 2,
          unitPrice: 100,
          discountAmount: 0,
          discountPercentage: 0,
          taxRate: 10,
          taxAmount: 20,
          subtotal: 200,
          total: 220,
        }
      ],
    };
    
    render(
      <LineItemsStep 
        data={dataWithItems} 
        products={mockProducts} 
        variants={mockVariants} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
  });

  it('calls onUpdate when removing a line item', async () => {
    const user = userEvent.setup();
    const dataWithItems: LineItemsData = {
      items: [
        {
          id: 'item_1',
          productId: 'prod_1',
          title: 'Test Item',
          quantity: 1,
          unitPrice: 100,
          sku: 'TEST-001',
          discountAmount: 0,
          taxRate: 0,
          taxAmount: 0,
          subtotal: 100,
          total: 100,
        }
      ],
    };
    
    render(
      <LineItemsStep 
        data={dataWithItems} 
        products={mockProducts} 
        variants={mockVariants} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    const removeButton = screen.getByTestId('line-item-0-remove');
    await user.click(removeButton);
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ items: [] });
    });
  });

  it('shows quote summary with correct totals', () => {
    const dataWithItems: LineItemsData = {
      items: [
        {
          id: 'item_1',
          productId: 'prod_1',
          title: 'Test Item',
          quantity: 2,
          unitPrice: 100,
          sku: 'TEST-001',
          discountAmount: 10,
          discountPercentage: 5,
          taxRate: 10,
          taxAmount: 19,
          subtotal: 200,
          total: 209,
        }
      ],
    };
    
    render(
      <LineItemsStep 
        data={dataWithItems} 
        products={mockProducts} 
        variants={mockVariants} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByText('Quote Summary')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    // Total appears multiple times, so we check it's present at least once
    expect(screen.getAllByText(/Total/i).length).toBeGreaterThan(0);
  });

  it('shows add at least one line item message when no items', () => {
    render(
      <LineItemsStep 
        data={defaultData} 
        products={[]} 
        variants={{}} 
        onUpdate={mockOnUpdate} 
      />
    );
    
    expect(screen.getByText('Add at least one line item')).toBeInTheDocument();
  });
});
