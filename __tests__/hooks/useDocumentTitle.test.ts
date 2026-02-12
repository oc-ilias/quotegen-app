import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '@/hooks';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = originalTitle;
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  describe('basic title setting', () => {
    it('should set document title on mount', () => {
      renderHook(() => useDocumentTitle('New Title'));

      expect(document.title).toBe('New Title');
    });

    it('should update document title when title prop changes', () => {
      const { rerender } = renderHook(
        ({ title }) => useDocumentTitle(title),
        { initialProps: { title: 'First Title' } }
      );

      expect(document.title).toBe('First Title');

      rerender({ title: 'Second Title' });

      expect(document.title).toBe('Second Title');
    });
  });

  describe('suffix option', () => {
    it('should append suffix when provided', () => {
      renderHook(() =>
        useDocumentTitle('Page', { suffix: ' | My App' })
      );

      expect(document.title).toBe('Page | My App');
    });

    it('should update when suffix changes', () => {
      const { rerender } = renderHook(
        ({ suffix }) => useDocumentTitle('Page', { suffix }),
        { initialProps: { suffix: ' | App' } }
      );

      expect(document.title).toBe('Page | App');

      rerender({ suffix: ' | My Application' });

      expect(document.title).toBe('Page | My Application');
    });

    it('should not append suffix when empty string', () => {
      renderHook(() =>
        useDocumentTitle('Page', { suffix: '' })
      );

      expect(document.title).toBe('Page');
    });

    it('should handle suffix with special characters', () => {
      renderHook(() =>
        useDocumentTitle('Page', { suffix: ' - β€$t Ãpp ©2024' })
      );

      expect(document.title).toBe('Page - β€$t Ãpp ©2024');
    });
  });

  describe('restoreOnUnmount option', () => {
    it('should restore original title on unmount by default', () => {
      document.title = 'Original Title';

      const { unmount } = renderHook(() => useDocumentTitle('New Title'));

      expect(document.title).toBe('New Title');

      unmount();

      expect(document.title).toBe('Original Title');
    });

    it('should not restore title when restoreOnUnmount is false', () => {
      document.title = 'Original Title';

      const { unmount } = renderHook(() =>
        useDocumentTitle('New Title', { restoreOnUnmount: false })
      );

      expect(document.title).toBe('New Title');

      unmount();

      expect(document.title).toBe('New Title');
    });

    it('should restore title with suffix on unmount', () => {
      document.title = 'Original';

      const { unmount } = renderHook(() =>
        useDocumentTitle('New', { suffix: ' | App' })
      );

      expect(document.title).toBe('New | App');

      unmount();

      expect(document.title).toBe('Original');
    });
  });

  describe('multiple hook instances', () => {
    it('should handle multiple components using the hook', () => {
      document.title = 'Initial';

      const { unmount: unmount1 } = renderHook(() => useDocumentTitle('First')
      );

      expect(document.title).toBe('First');

      const { unmount: unmount2 } = renderHook(() => useDocumentTitle('Second')
      );

      expect(document.title).toBe('Second');

      unmount2();

      // After unmounting second, it restores to what it was before second mounted
      // which was 'First' from the first hook
      expect(document.title).toBe('First');

      unmount1();

      expect(document.title).toBe('Initial');
    });
  });

  describe('title changes', () => {
    it('should handle multiple title changes', () => {
      const { rerender } = renderHook(
        ({ title }) => useDocumentTitle(title),
        { initialProps: { title: 'Title 1' } }
      );

      expect(document.title).toBe('Title 1');

      rerender({ title: 'Title 2' });
      expect(document.title).toBe('Title 2');

      rerender({ title: 'Title 3' });
      expect(document.title).toBe('Title 3');
    });

    it('should handle empty string title', () => {
      renderHook(() => useDocumentTitle(''));

      expect(document.title).toBe('');
    });

    it('should handle title with special characters', () => {
      const specialTitle = 'Título: "Special" \u003cCharacters\u003e & More';
      renderHook(() => useDocumentTitle(specialTitle));

      expect(document.title).toBe(specialTitle);
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      renderHook(() => useDocumentTitle(longTitle));

      expect(document.title).toBe(longTitle);
    });

    it('should handle unicode characters in title', () => {
      const unicodeTitle = '🚀 Rocket App • 日本語 • العربية';
      renderHook(() => useDocumentTitle(unicodeTitle));

      expect(document.title).toBe(unicodeTitle);
    });
  });

  describe('combined options', () => {
    it('should handle title with suffix and no restore', () => {
      document.title = 'Original';

      const { unmount } = renderHook(() =>
        useDocumentTitle('Page', { suffix: ' | App', restoreOnUnmount: false })
      );

      expect(document.title).toBe('Page | App');

      unmount();

      expect(document.title).toBe('Page | App');
    });

    it('should update both title and suffix dynamically', () => {
      const { rerender } = renderHook(
        ({ title, suffix }) => useDocumentTitle(title, { suffix }),
        { initialProps: { title: 'Home', suffix: ' | App' } }
      );

      expect(document.title).toBe('Home | App');

      rerender({ title: 'About', suffix: ' | My Application' });

      expect(document.title).toBe('About | My Application');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid title changes', () => {
      const { rerender } = renderHook(
        ({ title }) => useDocumentTitle(title),
        { initialProps: { title: '1' } }
      );

      rerender({ title: '2' });
      rerender({ title: '3' });
      rerender({ title: '4' });
      rerender({ title: '5' });

      expect(document.title).toBe('5');
    });

    it('should handle null-like title values', () => {
      const { rerender } = renderHook(
        ({ title }) => useDocumentTitle(title),
        { initialProps: { title: 'valid' } }
      );

      // @ts-ignore - testing edge case
      rerender({ title: null });

      expect(document.title).toBe('null');
    });

    it('should handle undefined title values', () => {
      const { rerender } = renderHook(
        ({ title }) => useDocumentTitle(title),
        { initialProps: { title: 'valid' } }
      );

      // @ts-ignore - testing edge case
      rerender({ title: undefined });

      expect(document.title).toBe('undefined');
    });

    it('should preserve original title across multiple mounts/unmounts', () => {
      const original = 'Original Title';
      document.title = original;

      const { unmount: unmount1 } = renderHook(() => useDocumentTitle('First'));
      unmount1();

      expect(document.title).toBe(original);

      const { unmount: unmount2 } = renderHook(() => useDocumentTitle('Second'));
      unmount2();

      expect(document.title).toBe(original);
    });
  });

  describe('SSR compatibility', () => {
    it('should work when document is available', () => {
      expect(() => {
        renderHook(() => useDocumentTitle('SSR Title'));
      }).not.toThrow();

      expect(document.title).toBe('SSR Title');
    });
  });
});
