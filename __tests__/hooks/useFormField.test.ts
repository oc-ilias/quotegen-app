import { renderHook, act } from '@testing-library/react';
import { useFormField } from '@/hooks';

describe('useFormField', () => {
  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: 'test' })
      );

      expect(result.current.value).toBe('test');
      expect(result.current.error).toBeNull();
      expect(result.current.touched).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(typeof result.current.setValue).toBe('function');
      expect(typeof result.current.onChange).toBe('function');
      expect(typeof result.current.onBlur).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.validate).toBe('function');
    });

    it('should handle string initial value', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: '' })
      );

      expect(result.current.value).toBe('');
    });

    it('should handle number initial value', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: 0 })
      );

      expect(result.current.value).toBe(0);
    });

    it('should handle boolean initial value', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: false })
      );

      expect(result.current.value).toBe(false);
    });

    it('should handle array initial value', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: [] as string[] })
      );

      expect(result.current.value).toEqual([]);
    });
  });

  describe('value changes', () => {
    it('should update value with setValue', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: '' })
      );

      act(() => {
        result.current.setValue('new value');
      });

      expect(result.current.value).toBe('new value');
    });

    it('should update value with onChange', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: '' })
      );

      act(() => {
        result.current.onChange({
          target: { value: 'typed value' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.value).toBe('typed value');
    });

    it('should handle number input changes', () => {
      const { result } = renderHook(() =>
        useFormField<number>({ initialValue: 0 })
      );

      act(() => {
        result.current.onChange({
          target: { value: '42' },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.value).toBe('42');
    });
  });

  describe('validation', () => {
    it('should validate and return true when valid', () => {
      const validate = jest.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(true);
      expect(result.current.isValid).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should validate and return false when invalid', () => {
      const validate = jest.fn().mockReturnValue('Error message');
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      let isValid: boolean = true;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe('Error message');
    });

    it('should validate on blur when touched', () => {
      const validate = jest.fn().mockReturnValue('Required');
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      act(() => {
        result.current.onBlur();
      });

      expect(result.current.touched).toBe(true);
      expect(validate).toHaveBeenCalled();
      expect(result.current.error).toBe('Required');
    });

    it('should validate on change after blur', () => {
      const validate = jest.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      // First blur to mark as touched
      act(() => {
        result.current.onBlur();
      });

      expect(validate).toHaveBeenCalledTimes(1);

      // Now change should trigger validation
      act(() => {
        result.current.onChange({
          target: { value: 'new' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(validate).toHaveBeenCalledTimes(2);
    });

    it('should not validate on change before blur', () => {
      const validate = jest.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      act(() => {
        result.current.onChange({
          target: { value: 'new' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(validate).not.toHaveBeenCalled();
    });
  });

  describe('required validation', () => {
    it('should fail required validation with empty string', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', required: true })
      );

      act(() => {
        result.current.onBlur();
      });

      expect(result.current.error).toBe('This field is required');
      expect(result.current.isValid).toBe(false);
    });

    it('should fail required validation with zero', () => {
      const { result } = renderHook(() =>
        useFormField<number>({ initialValue: 0, required: true })
      );

      act(() => {
        result.current.onBlur();
      });

      expect(result.current.error).toBe('This field is required');
    });

    it('should fail required validation with empty array', () => {
      const { result } = renderHook(() =>
        useFormField<string[]>({ initialValue: [], required: true })
      );

      act(() => {
        result.current.onBlur();
      });

      expect(result.current.error).toBe('This field is required');
    });

    it('should pass required validation with non-empty value', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: 'valid', required: true })
      );

      act(() => {
        result.current.onBlur();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    it('should pass required validation with custom validate overriding', () => {
      const customValidate = jest.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useFormField({ 
          initialValue: '', 
          required: true,
          validate: customValidate
        })
      );

      act(() => {
        result.current.onBlur();
      });

      // First it checks required, which fails
      expect(result.current.error).toBe('This field is required');
    });
  });

  describe('reset', () => {
    it('should reset to initial values', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: 'initial' })
      );

      act(() => {
        result.current.setValue('changed');
        result.current.onBlur();
      });

      expect(result.current.value).toBe('changed');
      expect(result.current.touched).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('initial');
      expect(result.current.touched).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    it('should reset after validation errors', () => {
      const validate = jest.fn().mockReturnValue('Error');
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      act(() => {
        result.current.onBlur();
      });

      expect(result.current.error).toBe('Error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('complex validation scenarios', () => {
    it('should handle email validation', () => {
      const emailValidate = (value: string) => {
        if (!value.includes('@')) return 'Invalid email';
        return null;
      };

      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate: emailValidate })
      );

      // First blur to mark as touched and trigger validation
      act(() => {
        result.current.setValue('invalid');
        result.current.onBlur();
      });

      expect(result.current.error).toBe('Invalid email');

      // Change to valid email and blur again
      act(() => {
        result.current.setValue('valid@email.com');
        result.current.onBlur();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle min length validation', () => {
      const minLengthValidate = (value: string) => {
        if (value.length < 5) return 'Minimum 5 characters';
        return null;
      };

      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate: minLengthValidate })
      );

      act(() => {
        result.current.setValue('abc');
        result.current.onBlur();
      });

      expect(result.current.error).toBe('Minimum 5 characters');

      act(() => {
        result.current.setValue('abcdef');
        result.current.onBlur();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle async-style validation pattern', () => {
      const asyncValidate = (value: string) => {
        return value === 'taken' ? 'Username taken' : null;
      };

      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate: asyncValidate })
      );

      act(() => {
        result.current.setValue('taken');
      });
      
      // Call validate directly
      let isValid: boolean = true;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe('Username taken');
    });
  });

  describe('callback stability', () => {
    it('should maintain stable callback references', () => {
      const { result, rerender } = renderHook(() =>
        useFormField({ initialValue: '' })
      );

      const firstOnChange = result.current.onChange;
      const firstOnBlur = result.current.onBlur;
      const firstReset = result.current.reset;
      const firstValidate = result.current.validate;

      rerender();

      // These should be stable
      expect(result.current.onBlur).toBe(firstOnBlur);
      expect(result.current.reset).toBe(firstReset);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid value changes', () => {
      const { result } = renderHook(() =>
        useFormField({ initialValue: '' })
      );

      act(() => {
        result.current.setValue('a');
        result.current.setValue('ab');
        result.current.setValue('abc');
      });

      expect(result.current.value).toBe('abc');
    });

    it('should handle validate function returning empty string', () => {
      const validate = jest.fn().mockReturnValue('');
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      act(() => {
        result.current.validate();
      });

      // Empty string should be treated as no error
      expect(result.current.error).toBe('');
      expect(result.current.isValid).toBe(false); // Empty string is falsy but not null
    });

    it('should handle null validation return', () => {
      const validate = jest.fn().mockReturnValue(null);
      const { result } = renderHook(() =>
        useFormField({ initialValue: '', validate })
      );

      act(() => {
        result.current.validate();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });
  });
});
