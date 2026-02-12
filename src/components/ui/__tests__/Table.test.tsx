/**
 * Table Component Tests
 * Comprehensive tests for Table component and all subcomponents
 * @module components/ui/__tests__/Table
 */

import React, { createRef } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from '@/components/ui/Table';

// ============================================================================
// Table Tests
// ============================================================================

describe('Table', () => {
  const defaultProps = {
    children: (
      <>
        <TableHeader>
          <tr>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  };

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders table element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(document.querySelector('table')).toBeInTheDocument();
    });

    it('renders with caption', () => {
      render(
        <Table caption="User Data">
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(document.querySelector('caption')).toHaveTextContent('User Data');
      expect(document.querySelector('caption')).toHaveClass('sr-only');
    });

    it('renders without caption when not provided', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(document.querySelector('caption')).not.toBeInTheDocument();
    });

    it('renders complete table structure', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Row 1, Cell 1</TableCell>
              <TableCell>Row 1, Cell 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 2, Cell 1</TableCell>
              <TableCell>Row 2, Cell 2</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <tr>
              <TableCell colSpan={2}>Footer Content</TableCell>
            </tr>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Row 1, Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
      expect(document.querySelector('thead')).toBeInTheDocument();
      expect(document.querySelector('tbody')).toBeInTheDocument();
      expect(document.querySelector('tfoot')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ARIA Attribute Tests
  // ============================================================================

  describe('ARIA Attributes', () => {
    it('has correct role and aria-label', () => {
      render(
        <Table caption="Test Table">
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Test Table');
    });

    it('has default aria-label when caption is not provided', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Data table');
    });

    it('has tabIndex for keyboard navigation', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('tabIndex', '0');
    });
  });

  // ============================================================================
  // Styling Tests
  // ============================================================================

  describe('Styling', () => {
    it('has correct wrapper styling', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const wrapper = screen.getByRole('region');
      expect(wrapper).toHaveClass('overflow-x-auto');
      expect(wrapper).toHaveClass('rounded-lg');
      expect(wrapper).toHaveClass('border');
      expect(wrapper).toHaveClass('border-slate-700');
    });

    it('has correct table styling', () => {
      render(
        <Table className="custom-table-class">
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = document.querySelector('table');
      expect(table).toHaveClass('w-full');
      expect(table).toHaveClass('text-left');
      expect(table).toHaveClass('custom-table-class');
    });

    it('forwards ref correctly', () => {
      const ref = createRef<HTMLTableElement>();
      render(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });
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
          <tr>
            <TableHead>Header</TableHead>
          </tr>
        </TableHeader>
      </Table>
    );

    expect(document.querySelector('thead')).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Header</TableHead>
          </tr>
        </TableHeader>
      </Table>
    );

    const thead = document.querySelector('thead');
    expect(thead).toHaveClass('bg-slate-800/50');
  });

  it('accepts custom className', () => {
    render(
      <Table>
        <TableHeader className="custom-header">
          <tr>
            <TableHead>Header</TableHead>
          </tr>
        </TableHeader>
      </Table>
    );

    const thead = document.querySelector('thead');
    expect(thead).toHaveClass('custom-header');
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <Table>
        <TableHeader ref={ref}>
          <tr>
            <TableHead>Header</TableHead>
          </tr>
        </TableHeader>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
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
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(document.querySelector('tbody')).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const tbody = document.querySelector('tbody');
    expect(tbody).toHaveClass('divide-y');
    expect(tbody).toHaveClass('divide-slate-700');
  });

  it('renders multiple rows', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Row 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const rows = document.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <Table>
        <TableBody ref={ref}>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
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
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(document.querySelector('tr')).toBeInTheDocument();
  });

  it('has transition classes', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const row = document.querySelector('tbody tr');
    expect(row).toHaveClass('transition-colors');
  });

  describe('isSelected', () => {
    it('applies selected styling when isSelected is true', () => {
      render(
        <Table>
          <TableBody>
            <TableRow isSelected>
              <TableCell>Selected Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = document.querySelector('tbody tr');
      expect(row).toHaveClass('bg-indigo-500/10');
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('does not apply selected styling when isSelected is false', () => {
      render(
        <Table>
          <TableBody>
            <TableRow isSelected={false}>
              <TableCell>Unselected Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = document.querySelector('tbody tr');
      expect(row).not.toHaveClass('bg-indigo-500/10');
      expect(row).toHaveAttribute('aria-selected', 'false');
    });

    it('has aria-selected attribute', () => {
      render(
        <Table>
          <TableBody>
            <TableRow isSelected>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = document.querySelector('tbody tr');
      expect(row).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('isInteractive', () => {
    it('applies hover and cursor styling when isInteractive is true', () => {
      render(
        <Table>
          <TableBody>
            <TableRow isInteractive>
              <TableCell>Interactive Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = document.querySelector('tbody tr');
      expect(row).toHaveClass('hover:bg-slate-800/30');
      expect(row).toHaveClass('cursor-pointer');
    });

    it('does not apply interactive styling when isInteractive is false', () => {
      render(
        <Table>
          <TableBody>
            <TableRow isInteractive={false}>
              <TableCell>Non-Interactive Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = document.querySelector('tbody tr');
      expect(row).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Combined Props', () => {
    it('handles both isSelected and isInteractive together', () => {
      render(
        <Table>
          <TableBody>
            <TableRow isSelected isInteractive>
              <TableCell>Interactive Selected Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = document.querySelector('tbody tr');
      expect(row).toHaveClass('bg-indigo-500/10');
      expect(row).toHaveClass('hover:bg-slate-800/30');
      expect(row).toHaveClass('cursor-pointer');
      expect(row).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <Table>
        <TableBody>
          <TableRow onClick={handleClick} isInteractive>
            <TableCell>Clickable</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const row = document.querySelector('tbody tr')!;
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLTableRowElement>();
    render(
      <Table>
        <TableBody>
          <TableRow ref={ref}>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableRowElement);
  });
});

// ============================================================================
// TableHead Tests
// ============================================================================

describe('TableHead', () => {
  it('renders th element with scope="col"', () => {
    render(
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Header Cell</TableHead>
          </tr>
        </TableHeader>
      </Table>
    );

    const th = document.querySelector('th');
    expect(th).toBeInTheDocument();
    expect(th).toHaveAttribute('scope', 'col');
  });

  it('has correct styling', () => {
    render(
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Header</TableHead>
          </tr>
        </TableHeader>
      </Table>
    );

    const th = document.querySelector('th');
    expect(th).toHaveClass('px-4');
    expect(th).toHaveClass('py-3');
    expect(th).toHaveClass('text-xs');
    expect(th).toHaveClass('font-semibold');
    expect(th).toHaveClass('text-slate-400');
    expect(th).toHaveClass('uppercase');
    expect(th).toHaveClass('tracking-wider');
  });

  describe('Sortable', () => {
    it('renders sort button when sortable is true', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable>Sortable Header</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      expect(document.querySelector('th button')).toBeInTheDocument();
    });

    it('has cursor pointer when sortable', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable>Sortable</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const th = document.querySelector('th');
      expect(th).toHaveClass('cursor-pointer');
      expect(th).toHaveClass('select-none');
    });

    it('has aria-sort attribute when sortable', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable>Sortable</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const th = document.querySelector('th');
      expect(th).toHaveAttribute('aria-sort', 'none');
    });

    it('has aria-sort="ascending" when sortDirection is asc', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable sortDirection="asc">Name</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const th = document.querySelector('th');
      expect(th).toHaveAttribute('aria-sort', 'asc');
    });

    it('has aria-sort="descending" when sortDirection is desc', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable sortDirection="desc">Name</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const th = document.querySelector('th');
      expect(th).toHaveAttribute('aria-sort', 'desc');
    });

    it('renders sort indicators when sortable', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable sortDirection="asc">Name</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const indicators = document.querySelectorAll('th svg');
      expect(indicators).toHaveLength(2);
    });

    it('has sr-only text for sort direction', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable sortDirection="asc">Name</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const srText = document.querySelector('.sr-only');
      expect(srText).toHaveTextContent('sorted ascending');
    });

    it('calls onSort when clicked', () => {
      const handleSort = jest.fn();
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable onSort={handleSort}>Sortable</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const th = document.querySelector('th')!;
      fireEvent.click(th);
      expect(handleSort).toHaveBeenCalledTimes(1);
    });

    it('does not call onSort when not sortable', () => {
      const handleSort = jest.fn();
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead onSort={handleSort}>Not Sortable</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const th = document.querySelector('th')!;
      fireEvent.click(th);
      expect(handleSort).not.toHaveBeenCalled();
    });

    it('has tabIndex on sort button for keyboard accessibility', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable>Sortable</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const button = document.querySelector('th button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('highlights active sort direction', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable sortDirection="asc">Name</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const svgs = document.querySelectorAll('th svg');
      expect(svgs[0]).toHaveClass('text-indigo-400');
      expect(svgs[1]).toHaveClass('text-slate-600');
    });

    it('highlights descending sort direction', () => {
      render(
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable sortDirection="desc">Name</TableHead>
            </tr>
          </TableHeader>
        </Table>
      );

      const svgs = document.querySelectorAll('th svg');
      expect(svgs[0]).toHaveClass('text-slate-600');
      expect(svgs[1]).toHaveClass('text-indigo-400');
    });
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <Table>
        <TableHeader>
          <tr>
            <TableHead ref={ref}>Header</TableHead>
          </tr>
        </TableHeader>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
  });
});

// ============================================================================
// TableCell Tests
// ============================================================================

describe('TableCell', () => {
  it('renders td element by default', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const td = document.querySelector('td');
    expect(td).toBeInTheDocument();
    expect(td).toHaveTextContent('Cell Data');
  });

  it('has correct styling', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const td = document.querySelector('td');
    expect(td).toHaveClass('px-4');
    expect(td).toHaveClass('py-3');
    expect(td).toHaveClass('text-sm');
    expect(td).toHaveClass('text-slate-300');
  });

  describe('asHeader', () => {
    it('renders as th when asHeader is true', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell asHeader>Row Header</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const th = document.querySelector('tbody th');
      expect(th).toBeInTheDocument();
      expect(th).toHaveAttribute('scope', 'row');
    });

    it('has header styling when asHeader is true', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell asHeader>Row Header</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const th = document.querySelector('tbody th');
      expect(th).toHaveClass('font-medium');
      expect(th).toHaveClass('text-slate-200');
    });

    it('does not have scope attribute when asHeader is false', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Regular Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const td = document.querySelector('td');
      expect(td).not.toHaveAttribute('scope');
    });
  });

  it('accepts colSpan attribute', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2}>Spanning Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const td = document.querySelector('td');
    expect(td).toHaveAttribute('colSpan', '2');
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell ref={ref}>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
  });
});

// ============================================================================
// TableFooter Tests
// ============================================================================

describe('TableFooter', () => {
  it('renders tfoot element', () => {
    render(
      <Table>
        <TableFooter>
          <tr>
            <TableCell>Footer</TableCell>
          </tr>
        </TableFooter>
      </Table>
    );

    expect(document.querySelector('tfoot')).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(
      <Table>
        <TableFooter>
          <tr>
            <TableCell>Footer</TableCell>
          </tr>
        </TableFooter>
      </Table>
    );

    const tfoot = document.querySelector('tfoot');
    expect(tfoot).toHaveClass('bg-slate-800/50');
    expect(tfoot).toHaveClass('font-semibold');
  });

  it('accepts custom className', () => {
    render(
      <Table>
        <TableFooter className="custom-footer">
          <tr>
            <TableCell>Footer</TableCell>
          </tr>
        </TableFooter>
      </Table>
    );

    const tfoot = document.querySelector('tfoot');
    expect(tfoot).toHaveClass('custom-footer');
  });

  it('renders footer content', () => {
    render(
      <Table>
        <TableFooter>
          <tr>
            <TableCell colSpan={3}>Total: $100</TableCell>
          </tr>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('Total: $100')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLTableSectionElement>();
    render(
      <Table>
        <TableFooter ref={ref}>
          <tr>
            <TableCell>Footer</TableCell>
          </tr>
        </TableFooter>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Table Integration', () => {
  it('renders complex table with all features', () => {
    const handleSort = jest.fn();
    const handleRowClick = jest.fn();

    render(
      <Table caption="User Management">
        <TableHeader>
          <tr>
            <TableHead sortable sortDirection="asc" onSort={handleSort}>
              Name
            </TableHead>
            <TableHead sortable onSort={handleSort}>Email</TableHead>
            <TableHead>Role</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <TableRow isInteractive onClick={handleRowClick}>
            <TableCell asHeader>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
          <TableRow isSelected isInteractive onClick={handleRowClick}>
            <TableCell asHeader>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <tr>
            <TableCell colSpan={3}>2 users total</TableCell>
          </tr>
        </TableFooter>
      </Table>
    );

    // Check structure
    expect(document.querySelector('thead')).toBeInTheDocument();
    expect(document.querySelector('tbody')).toBeInTheDocument();
    expect(document.querySelector('tfoot')).toBeInTheDocument();

    // Check content
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('2 users total')).toBeInTheDocument();

    // Check accessibility
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'User Management');

    // Check interactions
    const header = screen.getByText('Email').closest('th')!;
    fireEvent.click(header);
    expect(handleSort).toHaveBeenCalled();

    const rows = document.querySelectorAll('tbody tr');
    fireEvent.click(rows[0]!);
    expect(handleRowClick).toHaveBeenCalled();
  });

  it('supports empty table state', () => {
    render(
      <Table caption="Empty Table">
        <TableHeader>
          <tr>
            <TableHead>Column</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={1}>No data available</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles multiple sortable columns', () => {
    const sortCalls: string[] = [];

    render(
      <Table>
        <TableHeader>
          <tr>
            <TableHead sortable sortDirection="asc" onSort={() => sortCalls.push('name')} >
              Name
            </TableHead>
            <TableHead sortable sortDirection="desc" onSort={() => sortCalls.push('date')} >
              Date
            </TableHead>
            <TableHead sortable onSort={() => sortCalls.push('status')} >
              Status
            </TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>2024-01-01</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const headers = document.querySelectorAll('thead th');
    fireEvent.click(headers[0]!);
    fireEvent.click(headers[1]!);
    fireEvent.click(headers[2]!);

    expect(sortCalls).toEqual(['name', 'date', 'status']);
  });

  it('maintains correct table structure with complex data', () => {
    const data = [
      { id: 1, name: 'John', email: 'john@example.com', role: 'Admin' },
      { id: 2, name: 'Jane', email: 'jane@example.com', role: 'User' },
      { id: 3, name: 'Bob', email: 'bob@example.com', role: 'Editor' },
    ];

    render(
      <Table caption="Team Members">
        <TableHeader>
          <tr>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id} isInteractive>
              <TableCell asHeader>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    // Check all data is rendered
    data.forEach((user) => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByText(user.role)).toBeInTheDocument();
    });

    // Check structure
    expect(document.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(document.querySelectorAll('tbody th')).toHaveLength(3); // asHeader cells
    expect(document.querySelectorAll('tbody td')).toHaveLength(6); // regular cells
  });
});

export default {};
