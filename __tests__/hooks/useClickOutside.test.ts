import { renderHook, act } from '@testing-library/react';
import { useClickOutside } from '@/hooks';

describe('useClickOutside', () => {
  let mockOnClickOutside: jest.Mock;

  beforeEach(() => {
    mockOnClickOutside = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    document.body.innerHTML = '';
  });

  describe('ref handling', () => {
    it('should return a ref object', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      expect(result.current).toHaveProperty('current');
    });

    it('should initialize ref with null', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      expect(result.current.current).toBeNull();
    });
  });

  describe('click outside detection', () => {
    it('should call onClickOutside when clicking outside the element', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      // Create container element
      const container = document.createElement('div');
      container.setAttribute('data-testid', 'container');
      document.body.appendChild(container);

      // Assign ref
      result.current.current = container;

      // Simulate click outside
      act(() => {
        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);
        const clickEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        });
        outsideElement.dispatchEvent(clickEvent);
      });

      expect(mockOnClickOutside).toHaveBeenCalledTimes(1);
    });

    it('should not call onClickOutside when clicking inside the element', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      // Create container element
      const container = document.createElement('div');
      container.setAttribute('data-testid', 'container');
      document.body.appendChild(container);

      // Create child element
      const childElement = document.createElement('button');
      container.appendChild(childElement);

      // Assign ref
      result.current.current = container;

      // Simulate click inside (on child)
      act(() => {
        const clickEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        });
        childElement.dispatchEvent(clickEvent);
      });

      expect(mockOnClickOutside).not.toHaveBeenCalled();
    });

    it('should not call onClickOutside when clicking on the element itself', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      // Create container element
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Assign ref
      result.current.current = container;

      // Simulate click on the element itself
      act(() => {
        const clickEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        });
        container.dispatchEvent(clickEvent);
      });

      expect(mockOnClickOutside).not.toHaveBeenCalled();
    });

    it('should not call onClickOutside when ref is null', () => {
      renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      // Simulate click without setting ref
      act(() => {
        const clickEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        });
        document.body.dispatchEvent(clickEvent);
      });

      expect(mockOnClickOutside).not.toHaveBeenCalled();
    });
  });

  describe('touch events', () => {
    it('should call onClickOutside on touchstart outside element', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      const container = document.createElement('div');
      document.body.appendChild(container);
      result.current.current = container;

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      act(() => {
        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [{ clientX: 0, clientY: 0 }] as unknown as TouchList,
        });
        outsideElement.dispatchEvent(touchEvent);
      });

      expect(mockOnClickOutside).toHaveBeenCalledTimes(1);
    });

    it('should not call onClickOutside on touchstart inside element', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      const container = document.createElement('div');
      document.body.appendChild(container);
      result.current.current = container;

      const childElement = document.createElement('button');
      container.appendChild(childElement);

      act(() => {
        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          touches: [{ clientX: 0, clientY: 0 }] as unknown as TouchList,
        });
        childElement.dispatchEvent(touchEvent);
      });

      expect(mockOnClickOutside).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('callback updates', () => {
    it('should use the latest callback', () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      const { result, rerender } = renderHook(
        ({ callback }) => useClickOutside<HTMLDivElement>(callback),
        { initialProps: { callback: firstCallback } }
      );

      const container = document.createElement('div');
      document.body.appendChild(container);
      result.current.current = container;

      // Update callback
      rerender({ callback: secondCallback });

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      act(() => {
        const clickEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        });
        outsideElement.dispatchEvent(clickEvent);
      });

      // Both callbacks might be called due to closure, but at least the new one should be
      expect(secondCallback).toHaveBeenCalled();
    });
  });

  describe('nested elements', () => {
    it('should handle deeply nested elements', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      // Create nested structure
      const container = document.createElement('div');
      const level1 = document.createElement('div');
      const level2 = document.createElement('div');
      const level3 = document.createElement('button');

      level2.appendChild(level3);
      level1.appendChild(level2);
      container.appendChild(level1);
      document.body.appendChild(container);

      result.current.current = container;

      // Click on deepest child
      act(() => {
        const clickEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        });
        level3.dispatchEvent(clickEvent);
      });

      expect(mockOnClickOutside).not.toHaveBeenCalled();
    });
  });

  describe('multiple clicks', () => {
    it('should call onClickOutside for each click outside', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      const container = document.createElement('div');
      document.body.appendChild(container);
      result.current.current = container;

      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      // Click outside multiple times
      for (let i = 0; i < 3; i++) {
        act(() => {
          const clickEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
          });
          outsideElement.dispatchEvent(clickEvent);
        });
      }

      expect(mockOnClickOutside).toHaveBeenCalledTimes(3);
    });
  });

  describe('event bubbling', () => {
    it('should handle events that bubble up', () => {
      const { result } = renderHook(() => useClickOutside<HTMLDivElement>(mockOnClickOutside));

      const container = document.createElement('div');
      document.body.appendChild(container);
      result.current.current = container;

      const outsideElement = document.createElement('div');
      const deepChild = document.createElement('span');
      outsideElement.appendChild(deepChild);
      document.body.appendChild(outsideElement);

      // Click on deep child of outside element
      act(() => {
        const clickEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        });
        deepChild.dispatchEvent(clickEvent);
      });

      expect(mockOnClickOutside).toHaveBeenCalledTimes(1);
    });
  });
});
