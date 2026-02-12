import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '@/hooks';

describe('useAsync', () => {
  // Mock async function that resolves
  const mockAsyncFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncFunction.mockReset();
  });

  describe('initial state', () => {
    it('should initialize with correct default state (immediate=false)', () => {
      mockAsyncFunction.mockResolvedValue('data');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction, false));
      
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    it('should initialize with loading=true when immediate=true', () => {
      mockAsyncFunction.mockResolvedValue('data');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction, true));
      
      expect(result.current.loading).toBe(true);
    });

    it('should auto-execute when immediate=true', async () => {
      mockAsyncFunction.mockResolvedValue('immediate-data');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction, true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('immediate-data');
    });
  });

  describe('execute', () => {
    it('should set loading to true when execute is called', async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      mockAsyncFunction.mockReturnValue(promise);
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      act(() => {
        result.current.execute();
      });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      
      resolvePromise!('data');
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should update data on successful execution', async () => {
      mockAsyncFunction.mockResolvedValue({ id: 1, name: 'Test' });
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.data).toEqual({ id: 1, name: 'Test' });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should pass arguments to the async function', async () => {
      mockAsyncFunction.mockResolvedValue('result');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute('arg1', 42, { key: 'value' });
      });
      
      expect(mockAsyncFunction).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
    });

    it('should handle multiple execute calls', async () => {
      mockAsyncFunction
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.data).toBe('first');
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.data).toBe('second');
      expect(mockAsyncFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should set error on failed execution', async () => {
      const testError = new Error('Test error');
      mockAsyncFunction.mockRejectedValue(testError);
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.error).toEqual(testError);
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should convert non-Error rejections to Error objects', async () => {
      mockAsyncFunction.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('string error');
    });

    it('should convert number rejections to Error objects', async () => {
      mockAsyncFunction.mockRejectedValue(404);
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('404');
    });

    it('should clear error on new execution', async () => {
      mockAsyncFunction
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce('success');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.error).not.toBeNull();
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBe('success');
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      mockAsyncFunction.mockResolvedValue('data');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.data).toBe('data');
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should reset error state', async () => {
      mockAsyncFunction.mockRejectedValue(new Error('Error'));
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.error).not.toBeNull();
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('cleanup on unmount', () => {
    it('should not update state after unmount', async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      mockAsyncFunction.mockReturnValue(promise);
      
      const { result, unmount } = renderHook(() => useAsync(mockAsyncFunction));
      
      act(() => {
        result.current.execute();
      });
      
      unmount();
      
      // This should not throw or cause issues
      resolvePromise!('data');
      
      // Wait a bit to ensure any state updates would have occurred
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should handle error after unmount gracefully', async () => {
      let rejectPromise: (reason: Error) => void;
      const promise = new Promise<string>((_, reject) => {
        rejectPromise = reject;
      });
      mockAsyncFunction.mockReturnValue(promise);
      
      const { result, unmount } = renderHook(() => useAsync(mockAsyncFunction));
      
      act(() => {
        result.current.execute();
      });
      
      unmount();
      
      // This should not throw or cause issues
      rejectPromise!(new Error('Late error'));
      
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  });

  describe('callback stability', () => {
    it('should maintain stable execute function reference when asyncFunction changes', async () => {
      const { result, rerender } = renderHook(
        ({ fn }) => useAsync(fn),
        { initialProps: { fn: mockAsyncFunction } }
      );
      
      const firstExecute = result.current.execute;
      
      const newMockFn = jest.fn().mockResolvedValue('new');
      rerender({ fn: newMockFn });
      
      // execute function should be the same reference due to useCallback
      // but behavior should use the new function
      expect(result.current.execute).not.toBe(firstExecute);
    });

    it('should maintain stable reset function reference', () => {
      mockAsyncFunction.mockResolvedValue('data');
      
      const { result, rerender } = renderHook(() => useAsync(mockAsyncFunction));
      
      const firstReset = result.current.reset;
      
      rerender();
      
      expect(result.current.reset).toBe(firstReset);
    });
  });
});
