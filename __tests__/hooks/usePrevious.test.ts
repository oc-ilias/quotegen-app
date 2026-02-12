import { renderHook } from '@testing-library/react';
import { usePrevious } from '@/hooks';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'));

    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });

    expect(result.current).toBe('first');
  });

  it('should track multiple updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);

    rerender({ value: 4 });
    expect(result.current).toBe(3);
  });

  it('should handle number values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 0 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 42 });

    expect(result.current).toBe(0);
  });

  it('should handle object values', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });

    expect(result.current).toBe(obj1);
  });

  it('should handle array values', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: arr1 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: arr2 });

    expect(result.current).toBe(arr1);
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: false } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: true });

    expect(result.current).toBe(false);
  });

  it('should handle null values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'not null' });

    expect(result.current).toBeNull();
  });

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: undefined } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'defined' });

    expect(result.current).toBeUndefined();
  });

  it('should not update when value stays the same (reference equality)', () => {
    const sameObject = { id: 1 };

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: sameObject } }
    );

    rerender({ value: sameObject });

    // Previous should still be undefined because value reference didn't change
    expect(result.current).toBeUndefined();
  });

  it('should update when value changes even with same content', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: { id: 1 } } }
    );

    const newObject = { id: 1 }; // Same content, different reference

    rerender({ value: newObject });

    // Should update because reference is different
    expect(result.current).toEqual({ id: 1 });
  });

  it('should handle rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    rerender({ value: 'c' });
    expect(result.current).toBe('b');

    rerender({ value: 'd' });
    expect(result.current).toBe('c');
  });

  it('should handle complex nested objects', () => {
    const nested1 = { 
      user: { 
        name: 'John', 
        address: { city: 'NYC' } 
      } 
    };
    const nested2 = { 
      user: { 
        name: 'Jane', 
        address: { city: 'LA' } 
      } 
    };

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: nested1 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: nested2 });

    expect(result.current).toBe(nested1);
  });

  it('should maintain reference stability for return value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    const firstPrevious = result.current;
    expect(firstPrevious).toBe('first');

    rerender({ value: 'third' });
    
    // Previous value should be the string 'second', not a new reference
    expect(result.current).toBe('second');
  });

  it('should handle string values correctly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: '' } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'hello' });
    expect(result.current).toBe('');

    rerender({ value: 'world' });
    expect(result.current).toBe('hello');
  });

  it('should handle zero correctly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 0 } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 1 });
    expect(result.current).toBe(0);
  });

  it('should handle false correctly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: false } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: true });
    expect(result.current).toBe(false);
  });

  it('should handle empty array to filled array', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: [] as number[] } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: [1, 2, 3] });
    expect(result.current).toEqual([]);
  });
});
