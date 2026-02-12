import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks';

describe('usePagination', () => {
  describe('basic pagination', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(10);
      expect(result.current.pageStart).toBe(0);
      expect(result.current.pageEnd).toBe(10);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it('should calculate correct total pages', () => {
      const testCases = [
        { totalItems: 100, itemsPerPage: 10, expected: 10 },
        { totalItems: 95, itemsPerPage: 10, expected: 10 },
        { totalItems: 100, itemsPerPage: 20, expected: 5 },
        { totalItems: 5, itemsPerPage: 10, expected: 1 },
        { totalItems: 0, itemsPerPage: 10, expected: 1 },
      ];

      testCases.forEach(({ totalItems, itemsPerPage, expected }) => {
        const { result } = renderHook(() =>
          usePagination({ totalItems, itemsPerPage })
        );
        expect(result.current.totalPages).toBe(expected);
      });
    });

    it('should handle custom initial page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      expect(result.current.currentPage).toBe(5);
      expect(result.current.pageStart).toBe(40);
      expect(result.current.pageEnd).toBe(50);
    });
  });

  describe('page navigation', () => {
    it('should go to next page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.hasPreviousPage).toBe(true);
    });

    it('should go to previous page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(4);
    });

    it('should go to specific page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToPage(7);
      });

      expect(result.current.currentPage).toBe(7);
    });

    it('should go to first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 8 })
      );

      act(() => {
        result.current.goToFirstPage();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it('should go to last page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToLastPage();
      });

      expect(result.current.currentPage).toBe(10);
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  describe('boundary conditions', () => {
    it('should not go beyond last page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToPage(100);
      });

      expect(result.current.currentPage).toBe(10);
      expect(result.current.hasNextPage).toBe(false);
    });

    it('should not go below first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      act(() => {
        result.current.goToPage(0);
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it('should not go below first page with goToPreviousPage', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it('should not go beyond last page with goToNextPage', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToLastPage();
      });

      expect(result.current.currentPage).toBe(10);

      act(() => {
        result.current.goToNextPage();
      });

      expect(result.current.currentPage).toBe(10);
    });

    it('should handle negative page numbers', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      act(() => {
        result.current.goToPage(-5);
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('page numbers array', () => {
    it('should generate correct page numbers with default maxPageButtons', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      expect(result.current.pageNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('should center page numbers around current page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      expect(result.current.pageNumbers).toEqual([3, 4, 5, 6, 7]);
    });

    it('should adjust when near end', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 9 })
      );

      expect(result.current.pageNumbers).toEqual([6, 7, 8, 9, 10]);
    });

    it('should handle custom maxPageButtons', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, maxPageButtons: 3 })
      );

      expect(result.current.pageNumbers).toEqual([1, 2, 3]);
    });

    it('should handle when totalPages is less than maxPageButtons', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 20, itemsPerPage: 10, maxPageButtons: 10 })
      );

      expect(result.current.pageNumbers).toEqual([1, 2]);
    });

    it('should handle single page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 5, itemsPerPage: 10 })
      );

      expect(result.current.pageNumbers).toEqual([1]);
    });
  });

  describe('page range calculations', () => {
    it('should calculate correct page range on first page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      expect(result.current.pageStart).toBe(0);
      expect(result.current.pageEnd).toBe(10);
    });

    it('should calculate correct page range on middle page', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10, initialPage: 5 })
      );

      expect(result.current.pageStart).toBe(40);
      expect(result.current.pageEnd).toBe(50);
    });

    it('should calculate correct page range on last page with remainder', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, itemsPerPage: 10 })
      );

      act(() => {
        result.current.goToLastPage();
      });

      expect(result.current.pageStart).toBe(90);
      expect(result.current.pageEnd).toBe(95);
    });

    it('should handle itemsPerPage larger than totalItems', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 5, itemsPerPage: 10 })
      );

      expect(result.current.pageStart).toBe(0);
      expect(result.current.pageEnd).toBe(5);
    });
  });

  describe('dynamic total items', () => {
    it('should adjust current page when totalItems decreases', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination({ totalItems, itemsPerPage: 10, initialPage: 10 }),
        { initialProps: { totalItems: 100 } }
      );

      expect(result.current.currentPage).toBe(10);

      rerender({ totalItems: 50 });

      expect(result.current.totalPages).toBe(5);
      expect(result.current.currentPage).toBe(5);
    });

    it('should handle totalItems becoming zero', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination({ totalItems, itemsPerPage: 10, initialPage: 5 }),
        { initialProps: { totalItems: 100 } }
      );

      rerender({ totalItems: 0 });

      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPage).toBe(1);
    });

    it('should not change page when totalItems increases', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination({ totalItems, itemsPerPage: 10, initialPage: 2 }),
        { initialProps: { totalItems: 50 } }
      );

      expect(result.current.currentPage).toBe(2);

      rerender({ totalItems: 100 });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.totalPages).toBe(10);
    });
  });

  describe('callback stability', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() =>
        usePagination({ totalItems: 100, itemsPerPage: 10 })
      );

      const firstGoToPage = result.current.goToPage;
      const firstGoToNextPage = result.current.goToNextPage;
      const firstGoToPreviousPage = result.current.goToPreviousPage;
      const firstGoToFirstPage = result.current.goToFirstPage;
      const firstGoToLastPage = result.current.goToLastPage;

      rerender();

      expect(result.current.goToPage).toBe(firstGoToPage);
      expect(result.current.goToNextPage).toBe(firstGoToNextPage);
      expect(result.current.goToPreviousPage).toBe(firstGoToPreviousPage);
      expect(result.current.goToFirstPage).toBe(firstGoToFirstPage);
      expect(result.current.goToLastPage).toBe(firstGoToLastPage);
    });
  });

  describe('edge cases', () => {
    it('should handle initialPage exceeding total pages', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 50, itemsPerPage: 10, initialPage: 100 })
      );

      expect(result.current.currentPage).toBe(5);
    });

    it('should handle itemsPerPage of 1', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 5, itemsPerPage: 1 })
      );

      expect(result.current.totalPages).toBe(5);
      expect(result.current.pageStart).toBe(0);
      expect(result.current.pageEnd).toBe(1);
    });

    it('should handle very large numbers', () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 1000000, itemsPerPage: 10 })
      );

      expect(result.current.totalPages).toBe(100000);
    });
  });
});
