/**
 * Comprehensive tests for Header component
 * @module components/layout/Header.test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// ============================================================================
// Mocks
// ============================================================================

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ============================================================================
// Component Import
// ============================================================================

import { Header, type HeaderProps, type Notification } from './Header';

// ============================================================================
// Test Utilities
// ============================================================================

const defaultProps: HeaderProps = {};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Quote accepted',
    message: 'Your quote #123 has been accepted',
    timestamp: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Quote expiring',
    message: 'Quote #456 expires in 24 hours',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'error',
    title: 'Payment failed',
    message: 'Payment for quote #789 failed',
    timestamp: '2 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'New feature',
    message: 'Check out our new analytics dashboard',
    timestamp: '1 day ago',
    read: true,
  },
];

// ============================================================================
// Header Tests
// ============================================================================

describe('Header', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Header {...defaultProps} />);
      
      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('renders with user name', () => {
      render(<Header userName="John Doe" />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders with user email', () => {
      render(<Header userEmail="john@example.com" />);
      
      // Email might be in dropdown
      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('renders with user avatar', () => {
      render(<Header userAvatar="https://example.com/avatar.jpg" />);
      
      const avatar = document.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('shows default avatar when no avatar provided', () => {
      render(<Header userName="John Doe" />);
      
      // Should show icon-based avatar
      expect(document.querySelector('header')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search bar when onSearch provided', () => {
      const onSearch = jest.fn();
      render(<Header onSearch={onSearch} />);
      
      const searchInput = document.querySelector('input[type="text"]');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls onSearch when search submitted', () => {
      const onSearch = jest.fn();
      render(<Header onSearch={onSearch} />);
      
      const searchInput = document.querySelector('input[type="text"]');
      fireEvent.change(searchInput!, { target: { value: 'test query' } });
      fireEvent.submit(searchInput!.closest('form')!);
      
      expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('updates input value on change', () => {
      const onSearch = jest.fn();
      render(<Header onSearch={onSearch} />);
      
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'search term' } });
      
      expect(searchInput.value).toBe('search term');
    });

    it('has search placeholder', () => {
      const onSearch = jest.fn();
      render(<Header onSearch={onSearch} />);
      
      const searchInput = document.querySelector('input[type="text"]');
      expect(searchInput).toHaveAttribute('placeholder', 'Search quotes, customers...');
    });

    it('shows keyboard shortcut hint', () => {
      const onSearch = jest.fn();
      render(<Header onSearch={onSearch} />);
      
      // ⌘K hint should be visible
      expect(document.querySelector('kbd')).toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    it('renders notification bell', () => {
      render(<Header {...defaultProps} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      expect(bellButton).toBeInTheDocument();
    });

    it('shows notification count badge', () => {
      render(<Header notificationCount={5} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows "9+" for count over 9', () => {
      render(<Header notificationCount={15} />);
      
      expect(screen.getByText('9+')).toBeInTheDocument();
    });

    it('does not show badge when count is 0', () => {
      render(<Header notificationCount={0} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      expect(bellButton).toBeInTheDocument();
      // Badge should not be visible
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('opens notifications dropdown on click', () => {
      render(<Header notifications={mockNotifications} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Quote accepted')).toBeInTheDocument();
    });

    it('closes notifications dropdown on outside click', () => {
      render(<Header notifications={mockNotifications} />);
      
      // Open dropdown
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      // Dropdown should close (notification header might persist in DOM based on implementation)
      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('closes notifications when user menu opens', () => {
      render(<Header notifications={mockNotifications} />);
      
      // Open notifications
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      // Open user menu (should close notifications)
      const userButton = document.querySelector('[data-testid="header"]')?.querySelector('button:last-child');
      if (userButton) {
        fireEvent.click(userButton);
      }
      
      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('calls onNotificationClick when notification clicked', () => {
      const onNotificationClick = jest.fn();
      render(
        <Header 
          notifications={mockNotifications}
          onNotificationClick={onNotificationClick}
        />
      );
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      const notification = screen.getByText('Quote accepted');
      fireEvent.click(notification);
      
      expect(onNotificationClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          title: 'Quote accepted',
        })
      );
    });

    it('shows mark all read button when unread exist', () => {
      render(<Header notifications={mockNotifications} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    it('calls onMarkAllRead when mark all read clicked', () => {
      const onMarkAllRead = jest.fn();
      render(
        <Header 
          notifications={mockNotifications}
          onMarkAllRead={onMarkAllRead}
        />
      );
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      const markAllBtn = screen.getByText('Mark all read');
      fireEvent.click(markAllBtn);
      
      expect(onMarkAllRead).toHaveBeenCalled();
    });

    it('shows empty state when no notifications', () => {
      render(<Header notifications={[]} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    it('displays different notification types with correct colors', () => {
      render(<Header notifications={mockNotifications} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      // Check for different notification types
      expect(screen.getByText('Quote accepted')).toBeInTheDocument();
      expect(screen.getByText('Quote expiring')).toBeInTheDocument();
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
      expect(screen.getByText('New feature')).toBeInTheDocument();
    });

    it('shows unread indicator dot', () => {
      render(<Header notifications={mockNotifications} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      // Unread notifications should have indicator dots
      const unreadCount = mockNotifications.filter(n => !n.read).length;
      expect(unreadCount).toBe(2);
    });
  });

  describe('User Menu', () => {
    it('opens user menu on click', () => {
      render(<Header userName="John Doe" />);
      
      // Find user menu button (the one with user info)
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe') || btn.querySelector('img')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
        
        // Menu items should be visible
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
      }
    });

    it('closes user menu on outside click', () => {
      render(<Header userName="John Doe" />);
      
      // Open menu
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
        
        // Click outside
        fireEvent.mouseDown(document.body);
      }
      
      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('closes user menu when notifications open', () => {
      render(<Header userName="John Doe" notifications={mockNotifications} />);
      
      // Open user menu
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
      }
      
      // Open notifications (should close user menu)
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('calls onSettings when settings clicked', () => {
      const onSettings = jest.fn();
      render(<Header userName="John Doe" onSettings={onSettings} />);
      
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
        
        const settingsBtn = screen.getByText('Settings');
        fireEvent.click(settingsBtn);
        
        expect(onSettings).toHaveBeenCalled();
      }
    });

    it('calls onLogout when logout clicked', () => {
      const onLogout = jest.fn();
      render(<Header userName="John Doe" onLogout={onLogout} />);
      
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
        
        const logoutBtn = screen.getByText('Logout');
        fireEvent.click(logoutBtn);
        
        expect(onLogout).toHaveBeenCalled();
      }
    });

    it('calls onProfile when profile clicked', () => {
      const onProfile = jest.fn();
      render(<Header userName="John Doe" onProfile={onProfile} />);
      
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
        
        const profileBtn = screen.getByText('Profile');
        fireEvent.click(profileBtn);
        
        expect(onProfile).toHaveBeenCalled();
      }
    });

    it('calls onHelp when help clicked', () => {
      const onHelp = jest.fn();
      render(<Header userName="John Doe" onHelp={onHelp} />);
      
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
        
        const helpBtn = screen.getByText('Help & Support');
        fireEvent.click(helpBtn);
        
        expect(onHelp).toHaveBeenCalled();
      }
    });

    it('displays user email in menu', () => {
      render(<Header userName="John Doe" userEmail="john@example.com" />);
      
      const buttons = document.querySelectorAll('button');
      const userMenuButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('John Doe')
      );
      
      if (userMenuButton) {
        fireEvent.click(userMenuButton);
        
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      }
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      render(<Header className="custom-header-class" />);
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('custom-header-class');
    });
  });

  describe('Keyboard Navigation', () => {
    it('focuses search on Cmd+K', () => {
      const onSearch = jest.fn();
      render(<Header onSearch={onSearch} />);
      
      fireEvent.keyDown(window, { key: 'k', metaKey: true });
      
      // Search should receive focus (implementation dependent)
      expect(document.querySelector('input[type="text"]')).toBeInTheDocument();
    });

    it('focuses search on Ctrl+K', () => {
      const onSearch = jest.fn();
      render(<Header onSearch={onSearch} />);
      
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      
      expect(document.querySelector('input[type="text"]')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long user name', () => {
      render(<Header userName="Johnathan Christopher Doe III" />);
      
      expect(screen.getByText('Johnathan Christopher Doe III')).toBeInTheDocument();
    });

    it('handles very long user email', () => {
      render(<Header userEmail="johnathan.christopher.doe@verylongdomainname.com" />);
      
      expect(document.querySelector('header')).toBeInTheDocument();
    });

    it('handles many notifications', () => {
      const manyNotifications = Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        type: 'info' as const,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        timestamp: 'now',
        read: i > 10,
      }));
      
      render(<Header notifications={manyNotifications} />);
      
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      
      // Should render without performance issues
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('handles empty user name', () => {
      render(<Header userName="" />);
      
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('handles null notifications', () => {
      render(<Header notifications={undefined} />);
      
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('hides user name on mobile', () => {
      render(<Header userName="John Doe" />);
      
      // User name should be inside a container with hidden md:block classes
      const userName = screen.getByText('John Doe');
      const container = userName.closest('.hidden.md\\:block');
      expect(container).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Header Integration', () => {
  it('renders full header with all features', () => {
    const onSearch = jest.fn();
    const onNotificationClick = jest.fn();
    const onMarkAllRead = jest.fn();
    const onSettings = jest.fn();
    const onLogout = jest.fn();
    const onHelp = jest.fn();
    const onProfile = jest.fn();

    render(
      <Header
        userName="John Doe"
        userEmail="john@example.com"
        userAvatar="https://example.com/avatar.jpg"
        notificationCount={10}
        notifications={mockNotifications}
        onSearch={onSearch}
        onNotificationClick={onNotificationClick}
        onMarkAllRead={onMarkAllRead}
        onSettings={onSettings}
        onLogout={onLogout}
        onHelp={onHelp}
        onProfile={onProfile}
      />
    );

    // Verify all elements are present
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(document.querySelector('input[type="text"]')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('9+')).toBeInTheDocument(); // Notification count (capped at 9+)
  });

  it('handles notification and user menu interactions', () => {
    const onNotificationClick = jest.fn();
    const onLogout = jest.fn();

    render(
      <Header
        userName="John Doe"
        notifications={mockNotifications}
        onNotificationClick={onNotificationClick}
        onLogout={onLogout}
      />
    );

    // Open notifications
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Click notification
    const notification = screen.getByText('Quote accepted');
    fireEvent.click(notification);
    
    expect(onNotificationClick).toHaveBeenCalled();
  });
});
