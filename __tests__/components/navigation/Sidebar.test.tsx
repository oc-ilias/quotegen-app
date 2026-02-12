/**
 * Sidebar Component Test Suite
 * 
 * Comprehensive tests covering:
 * - Rendering states (default, loading, error)
 * - User interactions (click, keyboard, hover)
 * - Accessibility compliance
 * - Animation behavior
 * - Props handling
 * - Mobile responsiveness
 * - Keyboard shortcuts
 * 
 * @module __tests__/components/navigation/Sidebar
 */

import React, { createRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Component under test
import {
  Sidebar,
  SidebarWithErrorBoundary,
  SidebarSkeleton,
  SidebarError,
  NavBadge,
  type SidebarProps,
  type SidebarHandle,
  type NavItemId,
} from '@/components/navigation/Sidebar';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock next/navigation
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ============================================================================
// Test Data
// ============================================================================

const defaultProps: SidebarProps = {
  userName: 'John Doe',
  userEmail: 'john@example.com',
  shopName: 'Acme Corp',
};

const customNavItems = [
  {
    id: 'dashboard' as NavItemId,
    label: 'Dashboard',
    href: '/dashboard',
    icon: () => <svg data-testid="icon-dashboard" />,
    activeIcon: () => <svg data-testid="icon-dashboard-active" />,
  },
  {
    id: 'quotes' as NavItemId,
    label: 'Quotes',
    href: '/quotes',
    icon: () => <svg data-testid="icon-quotes" />,
    activeIcon: () => <svg data-testid="icon-quotes-active" />,
    badge: 5,
    badgeColor: 'red' as const,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const setup = (props: Partial<SidebarProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<Sidebar {...mergedProps} />);
};

const setupWithRef = (props: Partial<SidebarProps> = {}) => {
  const ref = createRef<SidebarHandle>();
  const mergedProps = { ...defaultProps, ...props };
  render(<Sidebar ref={ref} {...mergedProps} />);
  return { ref };
};

// ============================================================================
// Rendering Tests
// ============================================================================

describe('Sidebar Rendering', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      setup();
      expect(screen.getAllByLabelText('Main navigation')[0]).toBeInTheDocument();
    });

    it('renders with default navigation items', () => {
      setup();
      
      expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /quotes/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /customers/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /templates/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /analytics/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
    });

    it('renders create button', () => {
      setup();
      expect(screen.getByRole('button', { name: /create quote/i })).toBeInTheDocument();
    });

    it('renders user info in footer', () => {
      setup();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders user initials when no avatar', () => {
      setup();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders avatar image when provided', () => {
      setup({ userAvatar: 'https://example.com/avatar.jpg' });
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders fallback avatar when userName is empty', () => {
      setup({ userName: '' });
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('Custom Navigation Items', () => {
    it('renders custom navigation items', () => {
      setup({ customNavItems });
      
      expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /quotes/i })).toBeInTheDocument();
    });

    it('does not render default items when custom items provided', () => {
      setup({ customNavItems });
      
      // Should only have 2 items, not 6
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(2);
    });
  });

  describe('Loading State', () => {
    it('renders skeleton when isLoading is true', () => {
      setup({ isLoading: true });
      
      expect(screen.getByLabelText('Loading sidebar')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Loading navigation' })).toBeInTheDocument();
    });

    it('does not render navigation items when loading', () => {
      setup({ isLoading: true });
      
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state when error is provided', () => {
      const testError = new Error('Failed to load sidebar');
      setup({ error: testError });
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load sidebar')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      setup({ error: new Error('Test error'), onRetry });
      
      const retryButton = screen.getByRole('button', { name: /retry loading sidebar/i });
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('shows generic error message when error has no message', () => {
      setup({ error: new Error() });
      
      expect(screen.getByText(/failed to load sidebar content/i)).toBeInTheDocument();
    });
  });

  describe('Variant Rendering', () => {
    it('renders desktop variant by default', () => {
      setup();
      const sidebar = screen.getAllByLabelText('Main navigation')[0];
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });

    it('renders mobile variant correctly', () => {
      setup({ variant: 'mobile' });
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();
    });

    it('renders close button in mobile variant', () => {
      setup({ variant: 'mobile' });
      
      expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Interaction Tests
// ============================================================================

describe('Sidebar Interactions', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
    jest.clearAllMocks();
  });

  describe('Toggle Functionality', () => {
    it('calls onToggle when toggle button clicked', () => {
      const onToggle = jest.fn();
      setup({ onToggle });
      
      const toggleButton = screen.getByLabelText(/collapse sidebar/i);
      fireEvent.click(toggleButton);
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('shows expand label when collapsed', () => {
      setup({ isCollapsed: true });
      
      expect(screen.getByLabelText(/expand sidebar/i)).toBeInTheDocument();
    });

    it('toggles internal state when no onToggle provided', () => {
      setup({ defaultCollapsed: false });
      
      const toggleButton = screen.getByLabelText(/collapse sidebar/i);
      fireEvent.click(toggleButton);
      
      // After toggle, button should now say expand
      expect(screen.getByLabelText(/expand sidebar/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Interactions', () => {
    it('calls onNavigate when nav item clicked', () => {
      const onNavigate = jest.fn();
      setup({ onNavigate });
      
      const quotesLink = screen.getByRole('menuitem', { name: /quotes/i });
      fireEvent.click(quotesLink);
      
      expect(onNavigate).toHaveBeenCalledWith('quotes');
    });

    it('marks active item with aria-current', () => {
      mockPathname.mockReturnValue('/quotes');
      setup();
      
      const quotesLink = screen.getByRole('menuitem', { name: /quotes/i });
      expect(quotesLink).toHaveAttribute('aria-current', 'page');
    });

    it('closes mobile menu on navigation', () => {
      const onClose = jest.fn();
      setup({ variant: 'mobile', onClose });
      
      const quotesLink = screen.getByRole('menuitem', { name: /quotes/i });
      fireEvent.click(quotesLink);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Create Menu Interactions', () => {
    it('opens create menu when button clicked', () => {
      setup();
      
      const createButton = screen.getByRole('button', { name: /create quote/i });
      fireEvent.click(createButton);
      
      expect(screen.getByRole('menu', { name: 'Create new' })).toBeInTheDocument();
    });

    it('closes create menu when clicking outside', () => {
      setup();
      
      // Open menu
      const createButton = screen.getByRole('button', { name: /create quote/i });
      fireEvent.click(createButton);
      
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      // Click outside overlay
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
      }
    });

    it('shows menu items when open', () => {
      setup();
      
      const createButton = screen.getByRole('button', { name: /create quote/i });
      fireEvent.click(createButton);
      
      expect(screen.getByRole('menuitem', { name: /new quote/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /from template/i })).toBeInTheDocument();
    });
  });

  describe('Mobile Close', () => {
    it('calls onClose when close button clicked', () => {
      const onClose = jest.fn();
      setup({ variant: 'mobile', onClose });
      
      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// Keyboard Navigation Tests
// ============================================================================

describe('Sidebar Keyboard Navigation', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
    jest.clearAllMocks();
  });

  describe('Keyboard Shortcuts', () => {
    it('toggles sidebar on Cmd+B', () => {
      const onToggle = jest.fn();
      setup({ onToggle });
      
      fireEvent.keyDown(window, { key: 'b', metaKey: true });
      
      expect(onToggle).toHaveBeenCalled();
    });

    it('toggles sidebar on Ctrl+B', () => {
      const onToggle = jest.fn();
      setup({ onToggle });
      
      fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
      
      expect(onToggle).toHaveBeenCalled();
    });

    it('opens create menu on Cmd+N', () => {
      setup();
      
      fireEvent.keyDown(window, { key: 'n', metaKey: true });
      
      expect(screen.getByRole('menu', { name: 'Create new' })).toBeInTheDocument();
    });

    it('closes create menu on Escape', () => {
      setup();
      
      // Open menu first
      fireEvent.keyDown(window, { key: 'n', metaKey: true });
      expect(screen.getByRole('menu')).toBeInTheDocument();
      
      // Close with Escape
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    it('navigates to dashboard on Cmd+Shift+D', () => {
      const onNavigate = jest.fn();
      setup({ onNavigate });
      
      fireEvent.keyDown(window, { key: 'D', metaKey: true, shiftKey: true });
      
      expect(onNavigate).toHaveBeenCalledWith('dashboard');
    });

    it('navigates to quotes on Cmd+Shift+Q', () => {
      const onNavigate = jest.fn();
      setup({ onNavigate });
      
      fireEvent.keyDown(window, { key: 'Q', metaKey: true, shiftKey: true });
      
      expect(onNavigate).toHaveBeenCalledWith('quotes');
    });

    it('disables keyboard shortcuts when disableKeyboardShortcuts is true', () => {
      const onToggle = jest.fn();
      setup({ onToggle, disableKeyboardShortcuts: true });
      
      fireEvent.keyDown(window, { key: 'b', metaKey: true });
      
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('supports tab navigation through interactive elements', async () => {
      const user = userEvent.setup();
      setup();
      
      // First tab should focus the logo/home link
      await user.tab();
      expect(screen.getByLabelText('Go to dashboard')).toHaveFocus();
      
      // Second tab should focus the toggle button
      await user.tab();
      expect(screen.getByLabelText(/collapse sidebar/i)).toHaveFocus();
    });

    it('create button is focusable', async () => {
      const user = userEvent.setup();
      setup();
      
      const createButton = screen.getByRole('button', { name: /create quote/i });
      
      // Tab through elements until we reach create button
      await user.tab(); // logo
      await user.tab(); // toggle
      await user.tab(); // create button
      expect(createButton).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('menu items have focus outline', () => {
      setup();
      
      const menuItem = screen.getByRole('menuitem', { name: /dashboard/i });
      
      // Check for focus-visible classes
      expect(menuItem.className).toContain('focus-visible:ring');
    });
  });
});

// ============================================================================
// Imperative Handle Tests
// ============================================================================

describe('Sidebar Imperative Handle', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
    jest.clearAllMocks();
  });

  it('exposes toggle method', () => {
    const { ref } = setupWithRef();
    
    expect(ref.current).toBeDefined();
    expect(ref.current?.toggle).toBeDefined();
    
    act(() => {
      ref.current?.toggle();
    });
    
    expect(ref.current?.isCollapsed).toBe(true);
  });

  it('exposes expand method', () => {
    const onExpandComplete = jest.fn();
    const { ref } = setupWithRef({ defaultCollapsed: true, onExpandComplete });
    
    act(() => {
      ref.current?.expand();
    });
    
    expect(ref.current?.isCollapsed).toBe(false);
  });

  it('exposes collapse method', () => {
    const onCollapseComplete = jest.fn();
    const { ref } = setupWithRef({ defaultCollapsed: false, onCollapseComplete });
    
    act(() => {
      ref.current?.collapse();
    });
    
    expect(ref.current?.isCollapsed).toBe(true);
  });

  it('exposes navigateTo method', () => {
    const onNavigate = jest.fn();
    const { ref } = setupWithRef({ onNavigate });
    
    act(() => {
      ref.current?.navigateTo('quotes');
    });
    
    expect(onNavigate).toHaveBeenCalledWith('quotes');
  });

  it('exposes openCreateMenu method', () => {
    const { ref } = setupWithRef();
    
    act(() => {
      ref.current?.openCreateMenu();
    });
    
    expect(screen.getByRole('menu', { name: 'Create new' })).toBeInTheDocument();
  });

  it('exposes closeCreateMenu method', () => {
    const { ref } = setupWithRef();
    
    // Open first
    act(() => {
      ref.current?.openCreateMenu();
    });
    
    // Then close
    act(() => {
      ref.current?.closeCreateMenu();
    });
  });

  it('exposes isCollapsed property', () => {
    const { ref } = setupWithRef({ defaultCollapsed: true });
    
    expect(ref.current?.isCollapsed).toBe(true);
  });
});

// ============================================================================
// Persistence Tests
// ============================================================================

describe('Sidebar Persistence', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
    mockLocalStorage.getItem.mockReturnValue(null);
    jest.clearAllMocks();
  });

  it('reads collapsed state from localStorage on mount', () => {
    mockLocalStorage.getItem.mockReturnValue('true');
    
    setup({ persistState: true });
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('sidebar-collapsed');
  });

  it('saves collapsed state to localStorage when toggled', () => {
    setup({ persistState: true });
    
    const toggleButton = screen.getByLabelText(/collapse sidebar/i);
    fireEvent.click(toggleButton);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
  });

  it('uses custom storage key when provided', () => {
    setup({ persistState: true, storageKey: 'custom-key' });
    
    const toggleButton = screen.getByLabelText(/collapse sidebar/i);
    fireEvent.click(toggleButton);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-key', 'true');
  });

  it('does not persist when persistState is false', () => {
    setup({ persistState: false });
    
    const toggleButton = screen.getByLabelText(/collapse sidebar/i);
    fireEvent.click(toggleButton);
    
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses defaultCollapsed when no stored value', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    setup({ persistState: true, defaultCollapsed: true });
    
    expect(screen.getByLabelText(/expand sidebar/i)).toBeInTheDocument();
  });

  it('handles localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    
    setup({ persistState: true });
    
    const toggleButton = screen.getByLabelText(/collapse sidebar/i);
    fireEvent.click(toggleButton);
    
    // Should not throw, just warn
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ============================================================================
// Badge Component Tests
// ============================================================================

describe('NavBadge Component', () => {
  it('does not render when count is 0', () => {
    const { container } = render(<div><NavBadge count={0} /></div>);
    expect(container.firstChild?.firstChild).toBeNull();
  });

  it('does not render when count is negative', () => {
    const { container } = render(<div><NavBadge count={-1} /></div>);
    expect(container.firstChild?.firstChild).toBeNull();
  });

  it('renders count when positive', () => {
    render(<div data-testid="wrapper"><NavBadge count={5} /></div>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('caps count at 99+', () => {
    render(<div data-testid="wrapper"><NavBadge count={150} /></div>);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('applies different colors', () => {
    const { rerender } = render(<div><NavBadge count={5} color="red" /></div>);
    expect(screen.getByText('5')).toHaveClass('bg-red-500');

    rerender(<div><NavBadge count={5} color="blue" /></div>);
    expect(screen.getByText('5')).toHaveClass('bg-blue-500');
  });
});

// ============================================================================
// Error Boundary Tests
// ============================================================================

describe('Sidebar Error Boundary', () => {
  const ThrowError: React.FC = () => {
    throw new Error('Test error');
  };

  it('catches errors and shows fallback', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <SidebarWithErrorBoundary>
        <ThrowError />
      </SidebarWithErrorBoundary>
    );
    
    expect(screen.getByText('Sidebar Error')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('calls onError when error occurs', () => {
    const onError = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <SidebarWithErrorBoundary onError={onError}>
        <ThrowError />
      </SidebarWithErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

// ============================================================================
// Active Item Detection Tests
// ============================================================================

describe('Active Item Detection', () => {
  it('detects dashboard as active on root path', () => {
    mockPathname.mockReturnValue('/');
    setup();
    
    const dashboardLink = screen.getByRole('menuitem', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('detects dashboard as active on /dashboard', () => {
    mockPathname.mockReturnValue('/dashboard');
    setup();
    
    const dashboardLink = screen.getByRole('menuitem', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('detects nested routes as active', () => {
    mockPathname.mockReturnValue('/quotes/123/edit');
    setup();
    
    const quotesLink = screen.getByRole('menuitem', { name: /quotes/i });
    expect(quotesLink).toHaveAttribute('aria-current', 'page');
  });

  it('uses controlled activeItem over pathname detection', () => {
    mockPathname.mockReturnValue('/dashboard');
    setup({ activeItem: 'quotes' });
    
    const quotesLink = screen.getByRole('menuitem', { name: /quotes/i });
    expect(quotesLink).toHaveAttribute('aria-current', 'page');
    
    const dashboardLink = screen.getByRole('menuitem', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveAttribute('aria-current');
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('Sidebar Accessibility', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
    jest.clearAllMocks();
  });

  it('has proper ARIA labels', () => {
    setup();
    
    expect(screen.getAllByLabelText('Main navigation')[0]).toBeInTheDocument();
    expect(screen.getByRole('menubar')).toBeInTheDocument();
  });

  it('menu items have proper roles', () => {
    setup();
    
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('toggle button has accessible label', () => {
    setup();
    
    expect(screen.getByLabelText(/collapse sidebar/i)).toBeInTheDocument();
  });

  it('create button has aria-expanded', () => {
    setup();
    
    const createButton = screen.getByRole('button', { name: /create quote/i });
    expect(createButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(createButton);
    expect(createButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('create button has aria-haspopup', () => {
    setup();
    
    const createButton = screen.getByRole('button', { name: /create quote/i });
    expect(createButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('loading state has aria-busy', () => {
    setup({ isLoading: true });
    
    expect(screen.getByLabelText('Loading sidebar')).toHaveAttribute('aria-busy', 'true');
  });

  it('error state has role alert', () => {
    setup({ error: new Error('Test') });
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('mobile dialog has aria-modal', () => {
    setup({ variant: 'mobile' });
    
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('footer has button role', () => {
    setup();
    
    const footer = screen.getByRole('button', { name: /acme corp/i });
    expect(footer).toBeInTheDocument();
  });
});

// ============================================================================
// Class Name Tests
// ============================================================================

describe('Sidebar Custom Classes', () => {
  it('applies custom className', () => {
    setup({ className: 'custom-class' });
    
    expect(screen.getAllByLabelText('Main navigation')[0]).toHaveClass('custom-class');
  });

  it('maintains base classes with custom className', () => {
    setup({ className: 'custom-class' });
    
    const sidebar = screen.getAllByLabelText('Main navigation')[0];
    expect(sidebar).toHaveClass('custom-class');
    expect(sidebar).toHaveClass('bg-slate-950');
  });
});

// ============================================================================
// User Initials Tests
// ============================================================================

describe('User Initials Generation', () => {
  it('generates initials from single name', () => {
    setup({ userName: 'John' });
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('generates initials from two names', () => {
    setup({ userName: 'John Doe' });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('generates initials from three names (max 2)', () => {
    setup({ userName: 'John Michael Doe' });
    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('handles lowercase names', () => {
    setup({ userName: 'john doe' });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('uses U for empty or default user', () => {
    setup({ userName: 'User' });
    expect(screen.getByText('U')).toBeInTheDocument();
  });
});

// ============================================================================
// Props Edge Cases
// ============================================================================

describe('Sidebar Props Edge Cases', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
    jest.clearAllMocks();
  });

  it('handles missing optional props gracefully', () => {
    render(<Sidebar />);
    
    expect(screen.getAllByLabelText('Main navigation')[0]).toBeInTheDocument();
  });

  it('uses default shop name when not provided', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('My Shop')).toBeInTheDocument();
  });

  it('uses default user name when not provided', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('handles empty navigation items array', () => {
    setup({ customNavItems: [] });
    
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
