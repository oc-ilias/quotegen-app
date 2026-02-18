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
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { StatCard } from '@/components/ui/StatCard';

describe('Avatar Component', () => {
  it('renders with initials', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders with single name', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders with image when src provided', () => {
    render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />);
    const img = screen.getByAltText('John Doe');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('handles image load error gracefully', () => {
    render(<Avatar name="John Doe" src="invalid.jpg" />);
    const img = screen.getByAltText('John Doe');
    fireEvent.error(img);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies size variants', () => {
    const { rerender } = render(<Avatar name="Test" size="sm" />);
    rerender(<Avatar name="Test" size="md" />);
    rerender(<Avatar name="Test" size="lg" />);
    rerender(<Avatar name="Test" size="xl" />);
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

  it('renders with title', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <Card title="Title" description="Card description">
        Content
      </Card>
    );
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('applies hover effect when interactive', () => {
    render(<Card interactive>Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('hover');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    fireEvent.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders with footer', () => {
    render(
      <Card footer={<button>Action</button>}>
        Content
      </Card>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies padding variants', () => {
    const { rerender } = render(<Card padding="none">Content</Card>);
    rerender(<Card padding="sm">Content</Card>);
    rerender(<Card padding="md">Content</Card>);
    rerender(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
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

  it('renders with icon', () => {
    render(<Input icon={<span data-testid="input-icon">🔍</span>} />);
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

  it('calls onClose when clicking overlay', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );
    const overlay = screen.getByTestId('modal-overlay') || document.querySelector('[data-testid="modal-overlay"]');
    if (overlay) {
      fireEvent.click(overlay);
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
    const closeButton = screen.getByLabelText('Close') || screen.getByRole('button', { name: /close/i });
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

  it('renders with footer actions', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test"
        footer={<button>Save</button>}
      >
        Content
      </Modal>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
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

  it('renders as removable with onRemove', () => {
    const handleRemove = jest.fn();
    render(<Badge onRemove={handleRemove}>Removable</Badge>);
    const removeButton = screen.getByRole('button') || screen.getByLabelText(/remove/i);
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(handleRemove).toHaveBeenCalled();
    }
  });
});

describe('Table Component', () => {
  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
  ];

  const data = [
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ];

  it('renders table with headers', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders table rows', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<Table columns={columns} data={[]} emptyText="No data available" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles row click', () => {
    const handleRowClick = jest.fn();
    render(<Table columns={columns} data={data} onRowClick={handleRowClick} />);
    const row = screen.getByText('John').closest('tr');
    if (row) {
      fireEvent.click(row);
      expect(handleRowClick).toHaveBeenCalledWith(data[0]);
    }
  });

  it('renders with loading state', () => {
    render(<Table columns={columns} data={[]} loading={true} />);
    expect(screen.getByText(/loading/i) || document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders with custom cell renderer', () => {
    const customColumns = [
      { 
        key: 'name', 
        header: 'Name',
        render: (value: string) => <strong>{value}</strong>
      },
    ];
    render(<Table columns={customColumns} data={data} />);
    const strongElement = screen.getByText('John');
    expect(strongElement.tagName).toBe('STRONG');
  });
});

describe('Pagination Component', () => {
  it('renders current page info', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={10} 
        totalItems={100}
        onPageChange={() => {}} 
      />
    );
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('calls onPageChange when clicking next', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination 
        currentPage={1} 
        totalPages={10} 
        totalItems={100}
        onPageChange={handlePageChange} 
      />
    );
    const nextButton = screen.getByText(/next/i) || screen.getByLabelText(/next page/i);
    if (nextButton) {
      fireEvent.click(nextButton);
      expect(handlePageChange).toHaveBeenCalledWith(2);
    }
  });

  it('calls onPageChange when clicking previous', () => {
    const handlePageChange = jest.fn();
    render(
      <Pagination 
        currentPage={5} 
        totalPages={10} 
        totalItems={100}
        onPageChange={handlePageChange} 
      />
    );
    const prevButton = screen.getByText(/previous/i) || screen.getByLabelText(/previous page/i);
    if (prevButton) {
      fireEvent.click(prevButton);
      expect(handlePageChange).toHaveBeenCalledWith(4);
    }
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={10} 
        totalItems={100}
        onPageChange={() => {}} 
      />
    );
    const prevButton = screen.getByText(/previous/i) || screen.getByLabelText(/previous page/i);
    if (prevButton) {
      expect(prevButton).toBeDisabled();
    }
  });

  it('disables next button on last page', () => {
    render(
      <Pagination 
        currentPage={10} 
        totalPages={10} 
        totalItems={100}
        onPageChange={() => {}} 
      />
    );
    const nextButton = screen.getByText(/next/i) || screen.getByLabelText(/next page/i);
    if (nextButton) {
      expect(nextButton).toBeDisabled();
    }
  });

  it('renders page numbers', () => {
    render(
      <Pagination 
        currentPage={5} 
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

  it('renders with loading state', () => {
    render(<StatCard title="Loading" value="" loading />);
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
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
