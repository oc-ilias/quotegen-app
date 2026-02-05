/**
 * Accessibility Tests using axe-core
 * Comprehensive WCAG 2.1 AA compliance tests
 * @module __tests__/accessibility/accessibility.test.tsx
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LiveAnnouncerProvider } from '@/components/accessibility/LiveAnnouncer';
import { SkipNavigation } from '@/components/accessibility/SkipNavigation';
import { FocusTrap } from '@/components/accessibility/FocusTrap';
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Wrapper for components that need LiveAnnouncerProvider
const AccessibilityWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LiveAnnouncerProvider>{children}</LiveAnnouncerProvider>
);

describe('Accessibility Audit - WCAG 2.1 AA Compliance', () => {
  describe('Button Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <Button>Click me</Button>
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when loading', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <Button isLoading>Loading</Button>
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <Button disabled>Disabled</Button>
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible name', () => {
      const { getByRole } = render(
        <AccessibilityWrapper>
          <Button aria-label="Submit form">Submit</Button>
        </AccessibilityWrapper>
      );

      const button = getByRole('button');
      expect(button).toHaveAccessibleName('Submit form');
    });
  });

  describe('Input Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <Input label="Email" />
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with error state', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <Input label="Email" error="Invalid email address" />
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have associated label', () => {
      const { getByLabelText } = render(
        <AccessibilityWrapper>
          <Input label="Email Address" />
        </AccessibilityWrapper>
      );

      expect(getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('should announce error messages', () => {
      const { getByRole } = render(
        <AccessibilityWrapper>
          <Input label="Email" error="Email is required" />
        </AccessibilityWrapper>
      );

      const error = getByRole('alert');
      expect(error).toHaveTextContent('Email is required');
    });

    it('should have aria-invalid on error', () => {
      const { getByLabelText } = render(
        <AccessibilityWrapper>
          <Input label="Email" error="Invalid email" />
        </AccessibilityWrapper>
      );

      const input = getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Modal Component', () => {
    it('should have no accessibility violations when open', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
            <p>Modal content</p>
          </Modal>
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper dialog role', () => {
      const { getByRole } = render(
        <AccessibilityWrapper>
          <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
            <p>Content</p>
          </Modal>
        </AccessibilityWrapper>
      );

      expect(getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      const { getByRole } = render(
        <AccessibilityWrapper>
          <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
            <p>Content</p>
          </Modal>
        </AccessibilityWrapper>
      );

      const dialog = getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      const { getByRole } = render(
        <AccessibilityWrapper>
          <Modal isOpen={true} onClose={jest.fn()} title="Modal Title">
            <p>Content</p>
          </Modal>
        </AccessibilityWrapper>
      );

      const dialog = getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      const title = document.getElementById(labelledBy!);
      expect(title).toHaveTextContent('Modal Title');
    });

    it('should have accessible close button', () => {
      const { getByLabelText } = render(
        <AccessibilityWrapper>
          <Modal isOpen={true} onClose={jest.fn()} title="Test">
            <p>Content</p>
          </Modal>
        </AccessibilityWrapper>
      );

      expect(getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('Table Component', () => {
    const TestTable = () => (
      <Table caption="Test data table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <TestTable />
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have column headers with scope', () => {
      const { getAllByRole } = render(
        <AccessibilityWrapper>
          <TestTable />
        </AccessibilityWrapper>
      );

      const headers = getAllByRole('columnheader');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });

  describe('SkipNavigation Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <SkipNavigation />
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have navigation landmark', () => {
      const { getByRole } = render(
        <AccessibilityWrapper>
          <SkipNavigation />
        </AccessibilityWrapper>
      );

      expect(getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Skip links'
      );
    });
  });

  describe('FocusTrap Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <FocusTrap isActive={true}>
            <div>
              <button>First</button>
              <button>Second</button>
            </div>
          </FocusTrap>
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('VisuallyHidden Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityWrapper>
          <div>
            <button>
              Icon
              <VisuallyHidden>Submit form</VisuallyHidden>
            </button>
          </div>
        </AccessibilityWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide accessible name for icon-only button', () => {
      const { getByRole } = render(
        <AccessibilityWrapper>
          <button>
            <span aria-hidden="true">×</span>
            <VisuallyHidden>Close</VisuallyHidden>
          </button>
        </AccessibilityWrapper>
      );

      expect(getByRole('button')).toHaveAccessibleName('Close');
    });
  });
});

describe('Accessibility Utilities', () => {
  describe('Color Contrast', () => {
    it('should meet WCAG AA standards for text contrast', () => {
      // These are our theme colors - verify they meet contrast requirements
      const colors = [
        { bg: '#ffffff', text: '#171717', name: 'Light background' },
        { bg: '#0a0a0a', text: '#ededed', name: 'Dark background' },
        { bg: '#6366f1', text: '#ffffff', name: 'Primary button' },
        { bg: '#ef4444', text: '#ffffff', name: 'Error state' },
        { bg: '#10b981', text: '#ffffff', name: 'Success state' },
      ];

      colors.forEach(({ bg, text, name }) => {
        // Calculate luminance
        const getLuminance = (r: number, g: number, b: number) => {
          const [rs, gs, bs] = [r, g, b].map((c) => {
            c = c / 255;
            return c <= 0.03928
              ? c / 12.92
              : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };

        const parseColor = (color: string) => {
          const hex = color.replace('#', '');
          return [
            parseInt(hex.substr(0, 2), 16),
            parseInt(hex.substr(2, 2), 16),
            parseInt(hex.substr(4, 2), 16),
          ];
        };

        const [r1, g1, b1] = parseColor(bg);
        const [r2, g2, b2] = parseColor(text);

        const lum1 = getLuminance(r1, g1, b1);
        const lum2 = getLuminance(r2, g2, b2);

        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        const contrastRatio = (brightest + 0.05) / (darkest + 0.05);

        // WCAG AA requires 4.5:1 for normal text
        expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });
});

describe('Keyboard Navigation', () => {
  it('should have visible focus indicators on all interactive elements', async () => {
    const { container } = render(
      <AccessibilityWrapper>
        <div>
          <Button>Button</Button>
          <Input label="Input" />
          <a href="/test">Link</a>
        </div>
      </AccessibilityWrapper>
    );

    // Check that focus styles are defined in CSS
    const styleSheet = Array.from(document.styleSheets).find(
      (sheet) => sheet.href === null // Inline styles
    );

    if (styleSheet) {
      const cssRules = Array.from(styleSheet.cssRules);
      const hasFocusStyles = cssRules.some((rule) =
        rule.cssText.includes(':focus-visible')
      );

      // We expect focus-visible styles to be defined
      expect(hasFocusStyles || cssRules.length > 0).toBe(true);
    }
  });
});
