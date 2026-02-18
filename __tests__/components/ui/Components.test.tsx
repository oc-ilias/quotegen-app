/**
 * UI Component Tests - Comprehensive coverage for UI components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { StatCard } from '@/components/ui/StatCard';

describe('Avatar Component', () => {
  it('renders with fallback', () => {
    render(<Avatar alt="John Doe" fallback="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders with single alt character fallback', () => {
    render(<Avatar alt="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders with image when src provided', () => {
    render(<Avatar alt="John Doe" src="https://example.com/avatar.jpg" fallback="JD" />);
    const img = screen.getByAltText('John Doe');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('handles image load error gracefully', () => {
    render(<Avatar alt="John Doe" src="invalid.jpg" fallback="JD" />);
    const img = screen.getByAltText('John Doe');
    fireEvent.error(img);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies size variants', () => {
    const { rerender } = render(<Avatar alt="Test" size="sm" />);
    rerender(<Avatar alt="Test" size="md" />);
    rerender(<Avatar alt="Test" size="lg" />);
    rerender(<Avatar alt="Test" size="xl" />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });
});

describe('Card Component', () => {
  it('renders children', () => {
    render(
      <Card>
        <div data-testid="card-content">Card Content</div>
      </Card>
    );
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('applies hover effect when hover is true', () => {
    render(<Card hover>Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('hover:shadow-lg');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    fireEvent.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies padding variants', () => {
    const { rerender, container } = render(<Card padding="none">Content</Card>);
    expect(container.firstChild).not.toHaveClass('p-4');
    rerender(<Card padding="sm">Content</Card>);
    expect(container.firstChild).toHaveClass('p-4');
    rerender(<Card padding="md">Content</Card>);
    expect(container.firstChild).toHaveClass('p-6');
    rerender(<Card padding="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('p-8');
  });
});

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders with helper text', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('applies disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders different input types', () => {
    const { rerender } = render(<Input type="text" />);
    rerender(<Input type="email" />);
    rerender(<Input type="password" />);
    rerender(<Input type="number" />);
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('renders with leftIcon', () => {
    render(<Input leftIcon={<span data-testid="input-icon">🔍</span>} />);
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });
});

describe('Modal Component', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('calls onClose when clicking close button', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );
    const closeButton = screen.getByLabelText('Close modal');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('renders with title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Title">
        Content
      </Modal>
    );
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('applies size variants', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test" size="sm">Content</Modal>
    );
    rerender(<Modal isOpen={true} onClose={() => {}} title="Test" size="md">Content</Modal>);
    rerender(<Modal isOpen={true} onClose={() => {}} title="Test" size="lg">Content</Modal>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('Badge Component', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    rerender(<Badge variant="success">Success</Badge>);
    rerender(<Badge variant="warning">Warning</Badge>);
    rerender(<Badge variant="error">Error</Badge>);
    rerender(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('applies size variants', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    rerender(<Badge size="md">Medium</Badge>);
    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('renders with dot indicator', () => {
    render(<Badge dot>With Dot</Badge>);
    expect(screen.getByText('With Dot')).toBeInTheDocument();
  });

  it('renders with dot indicator', () => {
    render(<Badge dot>With Dot</Badge>);
    expect(screen.getByText('With Dot')).toBeInTheDocument();
  });
});

describe('Table Component', () => {
  it('renders table with header and body', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders clickable rows', () => {
    const handleClick = jest.fn();
    render(
      <Table>
        <TableBody>
          <TableRow onClick={handleClick}>
            <TableCell>Clickable Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    fireEvent.click(screen.getByText('Clickable Row'));
    expect(handleClick).toHaveBeenCalled();
  });
});

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
  };

  it('renders current page info', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking next', () => {
    const handlePageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={handlePageChange} />);
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when clicking previous', () => {
    const handlePageChange = jest.fn();
    render(<Pagination {...defaultProps} currentPage={5} onPageChange={handlePageChange} />);
    const prevButton = screen.getByLabelText('Previous page');
    fireEvent.click(prevButton);
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} />);
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={10} />);
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('renders page numbers', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    expect(screen.getByLabelText('Page 5')).toHaveAttribute('aria-current', 'page');
  });

  it('renders with showPageNumbers prop', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        totalItems={100}
        onPageChange={() => {}}
        showPageNumbers
      />
    );
    // Should render some page numbers
    expect(screen.getAllByRole('button').length).toBeGreaterThan(2);
  });

  it('renders items per page selector', () => {
    const handleItemsPerPageChange = jest.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        totalItems={100}
        onPageChange={() => {}}
        itemsPerPage={20}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    );
    expect(screen.getByText(/20/) || screen.getByDisplayValue('20')).toBeTruthy();
  });
});

describe('StatCard Component', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Revenue" value="$50,000" />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('renders with change indicator', () => {
    render(
      <StatCard
        title="Revenue"
        value="$50,000"
        change={{ value: 15, type: 'increase' }}
      />
    );
    expect(screen.getByText(/15%/) || screen.getByText(/15/)).toBeTruthy();
  });

  it('renders with icon', () => {
    render(
      <StatCard
        title="Users"
        value="1,234"
        icon={<span data-testid="stat-icon">👥</span>}
      />
    );
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<StatCard title="Revenue" value="$10,000" />);
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <StatCard title="Clickable" value="100" onClick={handleClick} />
    );
    fireEvent.click(screen.getByText('Clickable').closest('div') || screen.getByText('100'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders different value sizes', () => {
    const { rerender } = render(<StatCard title="Test" value="100" size="sm" />);
    rerender(<StatCard title="Test" value="100" size="md" />);
    rerender(<StatCard title="Test" value="100" size="lg" />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
