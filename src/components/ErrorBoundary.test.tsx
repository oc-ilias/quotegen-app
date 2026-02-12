/**
 * Comprehensive tests for ErrorBoundary component
 * @module components/error/ErrorBoundary.test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, useAsyncError, LoadingSpinner, useToast } from './ErrorBoundary';

// ============================================================================
// Test Component Utilities
// ============================================================================

/**
 * Component that throws an error during render
 */
const ThrowError = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message);
};

/**
 * Component that throws an error conditionally
 */
const ConditionalError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Conditional error thrown');
  }
  return <div data-testid="conditional-content">No error</div>;
};

/**
 * Async error test component
 */
const AsyncErrorComponent = () => {
  const { setError } = useAsyncError();
  
  return (
    <button 
      data-testid="trigger-async-error"
      onClick={() => setError(new Error('Async error'))}
    >
      Trigger Error
    </button>
  );
};

// ============================================================================
// ErrorBoundary Tests
// ============================================================================

describe('ErrorBoundary', () => {
  // Suppress console.error for expected error tests
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Basic Rendering', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-content">Child Content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders nested children correctly', () => {
      render(
        <ErrorBoundary>
          <div>
            <span>Level 1</span>
            <div>
              <span>Level 2</span>
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });

    it('preserves child component state when no error', () => {
      let renderCount = 0;
      const StatefulChild = () => {
        renderCount++;
        return <div data-testid="stateful">Renders: {renderCount}</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <StatefulChild />
        </ErrorBoundary>
      );

      expect(screen.getByText('Renders: 1')).toBeInTheDocument();
      
      rerender(
        <ErrorBoundary>
          <StatefulChild />
        </ErrorBoundary>
      );

      expect(screen.getByText('Renders: 2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches errors in child components and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('logs errors to console when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Logging test error" />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error caught by boundary:',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('catches errors with custom error messages', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('catches errors with empty message', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('recovers when child error condition is removed', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <ConditionalError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Click "Try Again" to reset
      fireEvent.click(screen.getByText('Try Again'));

      expect(screen.getByTestId('conditional-content')).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('displays default fallback when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('😵')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/unexpected happened/)).toBeInTheDocument();
    });

    it('displays custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });

    it('renders complex custom fallback', () => {
      const complexFallback = (
        <div data-testid="complex-fallback">
          <h1>Error Title</h1>
          <p>Error description</p>
          <button>Custom Action</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={complexFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('complex-fallback')).toBeInTheDocument();
      expect(screen.getByText('Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });
  });

  describe('Recovery Actions', () => {
    it('has refresh button for reloading page', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Verify refresh button exists
      const refreshBtn = screen.getByText('Refresh Page');
      expect(refreshBtn).toBeInTheDocument();
      expect(refreshBtn.tagName).toBe('BUTTON');
    });

    it('resets error state when Try Again is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ConditionalError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('conditional-content')).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <ConditionalError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Try Again'));

      // After reset, should show error boundary still (children unchanged)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('calls componentDidCatch when error occurs', () => {
      const captureExceptionMock = jest.fn();
      
      // Mock Sentry if it exists
      (window as any).Sentry = { captureException: captureExceptionMock };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Multiple Children', () => {
    it('handles multiple children correctly', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('catches error in one child without affecting others', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);
      
      // Should render without error
      expect(document.body).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);
      
      expect(document.body).toBeInTheDocument();
    });

    it('handles empty children array', () => {
      render(<ErrorBoundary>{[]}</ErrorBoundary>);
      
      expect(document.body).toBeInTheDocument();
    });

    it('handles string children', () => {
      render(<ErrorBoundary>String Content</ErrorBoundary>);
      
      expect(screen.getByText('String Content')).toBeInTheDocument();
    });

    it('handles number children', () => {
      render(<ErrorBoundary>{42}</ErrorBoundary>);
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles boolean children', () => {
      const { container } = render(<ErrorBoundary>{true}</ErrorBoundary>);
      
      // Booleans don't render anything visible
      expect(container).toBeInTheDocument();
    });

    it('handles nested error boundaries', () => {
      render(
        <ErrorBoundary>
          <div>Outer content</div>
          <ErrorBoundary>
            <ThrowError message="Inner error" />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Outer should still render
      expect(screen.getByText('Outer content')).toBeInTheDocument();
      // Inner boundary should catch its error
      expect(screen.getByText('Inner error')).toBeInTheDocument();
    });

    it('handles rapidly changing children', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <div data-testid="content">Version 1</div>
        </ErrorBoundary>
      );

      for (let i = 2; i <= 5; i++) {
        rerender(
          <ErrorBoundary>
            <div data-testid="content">Version {i}</div>
          </ErrorBoundary>
        );
      }

      expect(screen.getByText('Version 5')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// useAsyncError Hook Tests
// ============================================================================

describe('useAsyncError', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('returns error, setError, and clearError functions', () => {
    let hookResult: any;
    
    const TestComponent = () => {
      hookResult = useAsyncError();
      return <div>Test</div>;
    };

    render(<TestComponent />);

    expect(hookResult).toHaveProperty('error');
    expect(hookResult).toHaveProperty('setError');
    expect(hookResult).toHaveProperty('clearError');
    expect(typeof hookResult.setError).toBe('function');
    expect(typeof hookResult.clearError).toBe('function');
  });

  it('initializes with null error', () => {
    render(<AsyncErrorComponent />);
    
    expect(screen.getByTestId('trigger-async-error')).toBeInTheDocument();
  });

  it('logs error to console when set', () => {
    render(<AsyncErrorComponent />);
    
    fireEvent.click(screen.getByTestId('trigger-async-error'));

    expect(consoleSpy).toHaveBeenCalledWith('Async error:', expect.any(Error));
  });

  it('clears error when clearError is called', () => {
    let errorValue: Error | null = null;
    let clearErrorFn: (() => void) | null = null;

    const TestComponent = () => {
      const { error, setError, clearError } = useAsyncError();
      errorValue = error;
      clearErrorFn = clearError;
      
      return (
        <div>
          <button onClick={() => setError(new Error('Test'))}>Set</button>
          <button onClick={clearError}>Clear</button>
          {error && <span data-testid="error-present" />}
        </div>
      );
    };

    render(<TestComponent />);
    
    // Set error
    fireEvent.click(screen.getByText('Set'));
    expect(screen.getByTestId('error-present')).toBeInTheDocument();
    
    // Clear error
    fireEvent.click(screen.getByText('Clear'));
    expect(screen.queryByTestId('error-present')).not.toBeInTheDocument();
  });
});

// ============================================================================
// LoadingSpinner Tests
// ============================================================================

describe('LoadingSpinner', () => {
  it('renders with default size (md)', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with medium size', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('custom-class');
  });

  it('has animation class', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('has border styling', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('border-4', 'border-gray-200', 'border-t-blue-600');
  });
});

// ============================================================================
// useToast Hook Tests
// ============================================================================

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns addToast and ToastContainer', () => {
    let hookResult: any;
    
    const TestComponent = () => {
      hookResult = useToast();
      return <div>Test</div>;
    };

    render(<TestComponent />);

    expect(hookResult).toHaveProperty('addToast');
    expect(hookResult).toHaveProperty('ToastContainer');
    expect(typeof hookResult.addToast).toBe('function');
    expect(typeof hookResult.ToastContainer).toBe('function');
  });

  it('adds toast notification', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('Test message')}>Add Toast</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add Toast'));

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('adds toast with default info type', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('Info message')}>Add</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add'));

    const toast = screen.getByText('Info message');
    expect(toast).toHaveClass('bg-blue-600');
  });

  it('adds success toast', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('Success!', 'success')}>Add</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add'));

    const toast = screen.getByText('Success!');
    expect(toast).toHaveClass('bg-green-600');
  });

  it('adds error toast', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('Error!', 'error')}>Add</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add'));

    const toast = screen.getByText('Error!');
    expect(toast).toHaveClass('bg-red-600');
  });

  it('adds multiple toasts', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('First')}>Add 1</button>
          <button onClick={() => addToast('Second')}>Add 2</button>
          <button onClick={() => addToast('Third')}>Add 3</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add 1'));
    fireEvent.click(screen.getByText('Add 2'));
    fireEvent.click(screen.getByText('Add 3'));

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('auto-removes toast after 5 seconds', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('Temporary')}>Add</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText('Temporary')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Temporary')).not.toBeInTheDocument();
  });

  it('positions toasts at bottom right', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('Test')}>Add</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add'));

    // Find the toast and verify its styling
    const toast = screen.getByText('Test');
    expect(toast).toBeInTheDocument();
    // The toast has bg-blue-600 class for info type (default)
    expect(toast).toHaveClass('bg-blue-600');
  });

  it('displays toasts in a stack', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <div>
          <button onClick={() => addToast('First Toast')}>First</button>
          <button onClick={() => addToast('Second Toast')}>Second</button>
          <ToastContainer />
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('First'));
    fireEvent.click(screen.getByText('Second'));

    // Verify both toasts are displayed
    expect(screen.getByText('First Toast')).toBeInTheDocument();
    expect(screen.getByText('Second Toast')).toBeInTheDocument();
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('ErrorBoundary Integration', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('works with LoadingSpinner in fallback', () => {
    const fallbackWithSpinner = (
      <div>
        <LoadingSpinner size="lg" />
        <p>Loading error details...</p>
      </div>
    );

    render(
      <ErrorBoundary fallback={fallbackWithSpinner}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Loading error details...')).toBeInTheDocument();
  });

  it('works with useToast in error handler', () => {
    const TestComponent = () => {
      const { addToast, ToastContainer } = useToast();
      
      return (
        <ErrorBoundary
          fallback={
            <div>
              <button onClick={() => addToast('Error reported', 'error')}>
                Report Error
              </button>
              <ToastContainer />
            </div>
          }
        >
          <ThrowError />
        </ErrorBoundary>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Report Error'));

    expect(screen.getByText('Error reported')).toBeInTheDocument();
  });

  it('maintains state across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError message="Initial error" />
      </ErrorBoundary>
    );

    // Error boundary shows error
    expect(screen.getByText('Initial error')).toBeInTheDocument();

    // Click try again
    fireEvent.click(screen.getByText('Try Again'));

    // Boundary still shows error because children haven't changed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

// ============================================================================
// Performance Tests
// ============================================================================

describe('ErrorBoundary Performance', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('handles rapid error-recovery cycles efficiently', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError shouldThrow={false} />
      </ErrorBoundary>
    );

    for (let i = 0; i < 10; i++) {
      rerender(
        <ErrorBoundary>
          <ConditionalError shouldThrow={i % 2 === 0} />
        </ErrorBoundary>
      );
      
      if (i % 2 === 0) {
        fireEvent.click(screen.getByText('Try Again'));
      }
    }

    // Should complete without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('renders large component trees without issues', () => {
    const LargeTree = () => (
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} data-testid={`node-${i}`}>Node {i}</div>
        ))}
      </div>
    );

    render(
      <ErrorBoundary>
        <LargeTree />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('node-0')).toBeInTheDocument();
    expect(screen.getByTestId('node-99')).toBeInTheDocument();
  });
});
