/**
 * Tests for useCustomers Hook
 * @module __tests__/hooks/useCustomers.test
 */

import { renderHook, waitFor } from '@testing-library/react';
import useSWR from 'swr';
import {
  useCustomersList,
  useCustomer,
  useCustomerStats,
  useCustomerActivity,
  useCustomerQuotes,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useAddCustomerNote,
  useBulkUpdateCustomers,
  useBulkDeleteCustomers,
} from '@/hooks/useCustomers';

// Mock SWR
jest.mock('swr');
jest.mock('swr/mutation', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe('useCustomers Hooks', () => {
  const mockCustomer = {
    id: 'cust-1',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    email: 'john@acme.com',
    phone: '+1234567890',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    status: 'active',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCustomersList', () => {
    it('should fetch customers list', async () => {
      const mockData = {
        customers: [mockCustomer],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomersList());

      expect(result.current.customers).toEqual([mockCustomer]);
      expect(result.current.pagination.total).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading state', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomersList());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.customers).toEqual([]);
    });

    it('should handle error state', () => {
      const mockError = new Error('Failed to fetch');

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomersList());

      expect(result.current.error).toBe(mockError);
    });

    it('should apply filters correctly', () => {
      mockUseSWR.mockReturnValue({
        data: { customers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const filters = {
        searchQuery: 'acme',
        status: ['active'],
        tags: ['vip'],
        sortBy: 'companyName',
        sortOrder: 'asc' as const,
      };

      renderHook(() => useCustomersList(filters));

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('search=acme'),
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: true,
          dedupingInterval: 2000,
        })
      );
    });

    it('should handle pagination options', () => {
      mockUseSWR.mockReturnValue({
        data: { customers: [], pagination: { page: 2, limit: 20, total: 0, totalPages: 0 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useCustomersList({ page: 2, limit: 20 }));

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should support custom refresh interval', () => {
      mockUseSWR.mockReturnValue({
        data: { customers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() =>
        useCustomersList({}, { refreshInterval: 5000, revalidateOnFocus: false })
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({
          refreshInterval: 5000,
          revalidateOnFocus: false,
        })
      );
    });

    it('should handle date range filters', () => {
      mockUseSWR.mockReturnValue({
        data: { customers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      renderHook(() =>
        useCustomersList({
          dateFrom: fromDate,
          dateTo: toDate,
        })
      );

      const callArgs = mockUseSWR.mock.calls[0][0] as string;
      expect(callArgs).toContain('dateFrom');
      expect(callArgs).toContain('dateTo');
    });

    it('should handle revenue filters', () => {
      mockUseSWR.mockReturnValue({
        data: { customers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() =>
        useCustomersList({
          minRevenue: 1000,
          maxRevenue: 5000,
        })
      );

      const callArgs = mockUseSWR.mock.calls[0][0] as string;
      expect(callArgs).toContain('minRevenue=1000');
      expect(callArgs).toContain('maxRevenue=5000');
    });
  });

  describe('useCustomer', () => {
    it('should fetch single customer', () => {
      const mockCustomerWithStats = {
        ...mockCustomer,
        stats: {
          totalQuotes: 5,
          totalRevenue: 10000,
        },
      };

      mockUseSWR.mockReturnValue({
        data: { customer: mockCustomerWithStats },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomer('cust-1'));

      expect(result.current.customer).toEqual(mockCustomerWithStats);
    });

    it('should return null when id is null', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomer(null));

      expect(result.current.customer).toBeNull();
    });

    it('should handle loading state', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomer('cust-1'));

      expect(result.current.isLoading).toBe(true);
    });

    it('should use correct key for customer', () => {
      mockUseSWR.mockReturnValue({
        data: { customer: mockCustomer },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useCustomer('cust-1'));

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/customers/cust-1',
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: true,
          dedupingInterval: 2000,
        })
      );
    });
  });

  describe('useCustomerStats', () => {
    it('should fetch customer stats', () => {
      const mockStats = {
        totalQuotes: 10,
        totalRevenue: 50000,
        conversionRate: 75.5,
      };

      mockUseSWR.mockReturnValue({
        data: { stats: mockStats },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomerStats('cust-1'));

      expect(result.current.stats).toEqual(mockStats);
    });

    it('should return null stats when id is null', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomerStats(null));

      expect(result.current.stats).toBeNull();
    });

    it('should not revalidate on focus', () => {
      mockUseSWR.mockReturnValue({
        data: { stats: {} },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useCustomerStats('cust-1'));

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/customers/cust-1/stats',
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: false,
        })
      );
    });
  });

  describe('useCustomerActivity', () => {
    it('should fetch customer activity', () => {
      const mockActivities = [
        { id: 'act-1', type: 'note', content: 'Called customer', createdAt: '2024-01-01' },
        { id: 'act-2', type: 'quote', quoteId: 'qt-1', createdAt: '2024-01-02' },
      ];

      mockUseSWR.mockReturnValue({
        data: { activities: mockActivities, pagination: { page: 1, limit: 20, total: 2, totalPages: 1 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomerActivity('cust-1'));

      expect(result.current.activities).toEqual(mockActivities);
    });

    it('should handle pagination options', () => {
      mockUseSWR.mockReturnValue({
        data: { activities: [], pagination: { page: 2, limit: 10, total: 0, totalPages: 0 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      renderHook(() => useCustomerActivity('cust-1', { page: 2, limit: 10 }));

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe('useCustomerQuotes', () => {
    it('should fetch customer quotes', () => {
      const mockQuotes = [
        { id: 'qt-1', quoteNumber: 'QT-001', title: 'Quote 1', status: 'pending', total: 1000 },
        { id: 'qt-2', quoteNumber: 'QT-002', title: 'Quote 2', status: 'accepted', total: 2000 },
      ];

      mockUseSWR.mockReturnValue({
        data: { quotes: mockQuotes, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      const { result } = renderHook(() => useCustomerQuotes('cust-1'));

      expect(result.current.quotes).toEqual(mockQuotes);
    });
  });

  describe('useCreateCustomer', () => {
    it('should return create function and loading state', () => {
      const mockTrigger = jest.fn();
      const mockMutate = jest.fn();

      jest.mocked(require('swr')).mutate = mockMutate;
      jest.mocked(require('swr/mutation').default).mockReturnValue({
        trigger: mockTrigger,
        isMutating: false,
        error: undefined,
      });

      const { result } = renderHook(() => useCreateCustomer());

      expect(typeof result.current.createCustomer).toBe('function');
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('useUpdateCustomer', () => {
    it('should return update function and loading state', () => {
      const { result } = renderHook(() => useUpdateCustomer());

      expect(typeof result.current.updateCustomer).toBe('function');
      expect(typeof result.current.isUpdating).toBe('boolean');
    });
  });

  describe('useDeleteCustomer', () => {
    it('should return delete function and loading state', () => {
      const { result } = renderHook(() => useDeleteCustomer());

      expect(typeof result.current.deleteCustomer).toBe('function');
      expect(typeof result.current.isDeleting).toBe('boolean');
    });
  });

  describe('useAddCustomerNote', () => {
    it('should return addNote function and loading state', () => {
      const { result } = renderHook(() => useAddCustomerNote());

      expect(typeof result.current.addNote).toBe('function');
      expect(typeof result.current.isAdding).toBe('boolean');
    });
  });

  describe('useBulkUpdateCustomers', () => {
    it('should return bulkUpdate function and loading state', () => {
      const { result } = renderHook(() => useBulkUpdateCustomers());

      expect(typeof result.current.bulkUpdate).toBe('function');
      expect(typeof result.current.isUpdating).toBe('boolean');
    });
  });

  describe('useBulkDeleteCustomers', () => {
    it('should return bulkDelete function and loading state', () => {
      const { result } = renderHook(() => useBulkDeleteCustomers());

      expect(typeof result.current.bulkDelete).toBe('function');
      expect(typeof result.current.isDeleting).toBe('boolean');
    });
  });
});
