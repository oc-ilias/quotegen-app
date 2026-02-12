import React from 'react';
import './SkipNavigation.css';

/**
 * Props for the SkipNavigation component
 */
export interface SkipNavigationProps {
  /** The ID of the main content element to skip to */
  targetId?: string;
  /** Custom text for the skip link */
  linkText?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * SkipNavigation Component
 * 
 * Provides a "skip to main content" link for keyboard users.
 * Hidden visually but accessible to screen readers and keyboard navigation.
 * Becomes visible when focused.
 * 
 * WCAG 2.1 AA Compliance:
 * - 2.4.1 Bypass Blocks (Level A)
 * 
 * @example
 * ```tsx
 * // In your App or Layout component:
 * <SkipNavigation targetId="main-content" />
 * 
 * // Later in the page:
 * <main id="main-content">
 *   <!-- Main content here -->
 * </main>
 * ```
 */
export const SkipNavigation: React.FC<SkipNavigationProps> = ({
  targetId = 'main-content',
  linkText = 'Skip to main content',
  className = '',
}) => {
  /**
   * Handle click event to ensure smooth scrolling
   * and set focus to the target element
   */
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    const target = document.getElementById(targetId);
    
    if (target) {
      // Set tabindex to make element focusable
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      
      // Focus and scroll to the element
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Remove tabindex after blur (optional cleanup)
      const handleBlur = () => {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', handleBlur);
      };
      target.addEventListener('blur', handleBlur);
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className={`skip-navigation ${className}`.trim()}
      onClick={handleClick}
      data-testid="skip-navigation"
    >
      {linkText}
    </a>
  );
};

/**
 * Default export for convenient importing
 */
export default SkipNavigation;
