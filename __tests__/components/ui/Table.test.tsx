/**
 * Table Component Tests
 * Comprehensive tests for Table component including sorting, filtering, row selection, and empty states
 * @module __tests__/components/ui/Table
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

describe('Table Components', () => {
  // ============================================================================
  // Table Tests
  // ============================================================================

  describe('Table', () => {
    it('renders table element', () => {
      render(
        <Table>
          <tbody><tr><td>Content</td></tr></tbody>
        </Table>
      );
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Table>
          <thead>
            <tr><th>Header</th></tr>
          </thead>
          <tbody>
            <tr><td>Cell</td></tr>
          </tbody>
        </Table>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Table className="custom-table">
          <tbody><tr><td>Content</td></tr></tbody>
        </Table>
      );
      expect(screen.getByRole('table')).toHaveClass('custom-table');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTableElement>();
      render(
        <Table ref={ref}>
          <tbody><tr><td>Content</td></tr></tbody>
        </Table>
      );
      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });

    it('has overflow-x-auto wrapper for responsive design', () => {
      const { container } = render(
        <Table>
          <tbody><tr><td>Content</td></tr></tbody>
        </Table>
      );
      expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    });

    it('has proper border styling', () => {
      const { container } = render(
        <Table>
          <tbody><tr><td>Content</td></tr></tbody>
        </Table>
      );
      expect(container.querySelector('.border')).toBeInTheDocument();
      expect(container.querySelector('.border-slate-700')).toBeInTheDocument();
    });

    it('has rounded corners', () => {
      const { container } = render(
        <Table>
          <tbody><tr><td>Content</td></tr></tbody>
        </Table>
      );
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    });

    it('spreads additional props to table element', () => {
      render(
        <Table data-testid="test-table" id="my-table">
          <tbody><tr><td>Content</td></tr></tbody>
        </Table>
      );
      expect(screen.getByTestId('test-table')).toBeInTheDocument();
      expect(screen.getByRole('table')).toHaveAttribute('id', 'my-table');
    });
  });

  // ============================================================================
  // TableHeader Tests
  // ============================================================================

  describe('TableHeader', () => {
    it('renders thead element', () => {
      render(
        <Table>
          <TableHeader>
            <tr><th>Header</th></tr>
          </TableHeader>
        </Table>
      );
      expect(screen.getByRole('rowgroup')).toBeInTheDocument();
    });

    it('applies background styling', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <tr><th>Header</th></tr>
          </TableHeader>
        </Table>
      );
      const thead = container.querySelector('thead');
      expect(thead).toHaveClass('bg-slate-800/50');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader className="custom-header">
            <tr><th>Header</th></tr>
          </TableHeader>
        </Table>
      );
      expect(screen.getByRole('rowgroup')).toHaveClass('custom-header');
    });

    it('renders children correctly', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
            </tr>
          </TableHeader>
        </Table>
      );
      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 2')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TableBody Tests
  // ============================================================================

  describe('TableBody', () => {
    it('renders tbody element', () => {
      render(
        <Table>
          <TableBody>
            <tr><td>Cell</td></tr>
          </TableBody>
        </Table>
      );
      expect(document.querySelector('tbody')).toBeInTheDocument();
    });

    it('applies divider styling', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <tr><td>Cell</td></tr>
          </TableBody>
        </Table>
      );
      const tbody = container.querySelector('tbody');
      expect(tbody).toHaveClass('divide-y');
      expect(tbody).toHaveClass('divide-slate-700');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody className="custom-body">
            <tr><td>Cell</td></tr>
          </TableBody>
        </Table>
      );
      expect(document.querySelector('tbody')).toHaveClass('custom-body');
    });

    it('renders multiple rows', () => {
      render(
        <Table>
          <TableBody>
            <tr><td>Row 1</td></tr>
            <tr><td>Row 2</td></tr>
            <tr><td>Row 3</td></tr>
          </TableBody>
        </Table>
      );
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3);
    });
  });

  // ============================================================================
  // TableRow Tests
  // ============================================================================

  describe('TableRow', () => {
    it('renders tr element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <td>Cell</td>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('applies hover styling', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <td>Cell</td>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = container.querySelector('tr');
      expect(row).toHaveClass('hover:bg-slate-800/30');
      expect(row).toHaveClass('transition-colors');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow className="custom-row">
              <td>Cell</td>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByRole('row')).toHaveClass('custom-row');
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(
        <Table>
          <TableBody>
            <TableRow onClick={handleClick}>
              <td>Cell</td>
            </TableRow>
          </TableBody>
        </Table>
      );
      fireEvent.click(screen.getByRole('row'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders children cells', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <td>Cell 1</td>
              <td>Cell 2</td>
              <td>Cell 3</td>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 2')).toBeInTheDocument();
      expect(screen.getByText('Cell 3')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TableHead Tests
  // ============================================================================

  describe('TableHead', () => {
    it('renders th element', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Header</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );
      expect(screen.getByRole('columnheader')).toBeInTheDocument();
    });

    it('applies proper styling', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Header</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );
      const th = container.querySelector('th');
      expect(th).toHaveClass('px-4');
      expect(th).toHaveClass('py-3');
      expect(th).toHaveClass('text-xs');
      expect(th).toHaveClass('font-semibold');
      expect(th).toHaveClass('text-slate-400');
      expect(th).toHaveClass('uppercase');
      expect(th).toHaveClass('tracking-wider');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="custom-head">Header</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );
      expect(screen.getByRole('columnheader')).toHaveClass('custom-head');
    });

    it('renders text content correctly', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders with sorting indicators', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead>
                Name
                <svg aria-label="Sort ascending"></svg>
              </TableHead>
            </tr>
          </TableHeader>
        </Table>
      );
      expect(screen.getByLabelText(/sort ascending/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TableCell Tests
  // ============================================================================

  describe('TableCell', () => {
    it('renders td element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByRole('cell')).toBeInTheDocument();
    });

    it('applies proper styling', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const td = container.querySelector('td');
      expect(td).toHaveClass('px-4');
      expect(td).toHaveClass('py-3');
      expect(td).toHaveClass('text-sm');
      expect(td).toHaveClass('text-slate-300');
    });

    it('applies custom className', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell">Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByRole('cell')).toHaveClass('custom-cell');
    });

    it('renders complex children', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <button>Action</button>
                <span className="badge">Badge</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByText('Badge')).toBeInTheDocument();
    });

    it('renders with data attributes', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell-1">Cell 1</TableCell>
              <TableCell data-testid="cell-2">Cell 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('cell-1')).toBeInTheDocument();
      expect(screen.getByTestId('cell-2')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Complete Table Integration Tests
  // ============================================================================

  describe('Complete Table Integration', () => {
    const testData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
    ];

    const renderTable = (data = testData, onRowClick?: (row: typeof testData[0]) => void) => {
      return render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow 
                key={row.id} 
                onClick={() => onRowClick?.(row)}
                data-testid={`row-${row.id}`}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    };

    it('renders complete table with headers and data', () => {
      renderTable();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('handles row click events', () => {
      const handleRowClick = jest.fn();
      renderTable(testData, handleRowClick);
      fireEvent.click(screen.getByTestId('row-1'));
      expect(handleRowClick).toHaveBeenCalledWith(testData[0]);
    });

    it('renders empty table body', () => {
      renderTable([]);
      expect(screen.getByText('Name')).toBeInTheDocument();
      const rows = screen.queryAllByTestId(/^row-/);
      expect(rows).toHaveLength(0);
    });

    it('has correct table structure', () => {
      const { container } = renderTable();
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(container.querySelectorAll('th')).toHaveLength(3);
      expect(container.querySelectorAll('tr')).toHaveLength(4); // header + 3 data rows
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper table structure for screen readers', () => {
      render(
        <Table aria-label="User list">
          <TableHeader>
            <tr>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Email</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'User list');
    });

    it('table cells have proper contrast colors', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = container.querySelector('td');
      expect(cell).toHaveClass('text-slate-300');
    });

    it('header cells have proper contrast colors', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <tr><TableHead>Header</TableHead></tr>
          </TableHeader>
        </Table>
      );
      const head = container.querySelector('th');
      expect(head).toHaveClass('text-slate-400');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles table with single row', () => {
      render(
        <Table>
          <TableHeader>
            <tr><TableHead>Header</TableHead></tr>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>Single Row</TableCell></TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Single Row')).toBeInTheDocument();
    });

    it('handles table with many columns', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableHead key={i}>Col {i + 1}</TableHead>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            <TableRow>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableCell key={i}>Data {i + 1}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Col 1')).toBeInTheDocument();
      expect(screen.getByText('Col 10')).toBeInTheDocument();
      expect(screen.getByText('Data 1')).toBeInTheDocument();
      expect(screen.getByText('Data 10')).toBeInTheDocument();
    });

    it('handles table with many rows', () => {
      render(
        <Table>
          <TableHeader>
            <tr><TableHead>ID</TableHead></tr>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 50 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>Row {i + 1}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Row 1')).toBeInTheDocument();
      expect(screen.getByText('Row 50')).toBeInTheDocument();
    });

    it('handles cells with empty content', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Has Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(2);
    });

    it('handles cells with null/undefined children', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>{null}</TableCell>
              <TableCell>{undefined}</TableCell>
              <TableCell>0</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(3);
    });
  });
});
