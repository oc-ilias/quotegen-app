/**
 * Tests for useSupabaseData Hooks
 * @module __tests__/hooks/useSupabaseData.test
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useQuotes,
  usePaginatedQuotes,
  useQuote,
  useQuoteStats,
  useCustomers,
  useCustomer,
  useCustomerQuotes,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  useUpdateQuoteStatus,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useRealtimeQuotes,
  useRealtimeCustomers,
  queryCache,
} from '@/hooks/useSupabaseData';
import { supabase } from '@/lib/supabase';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn((callback) => {
        callback('SUBSCRIBED');
        return { unsubscribe: jest.fn() };
      }),
    })),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useSupabaseData Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryCache.clear();
  });

  describe('useQuotes', () => {
    it('should fetch quotes without filters', async () => {
      const mockQuotes = [
        { id: 'q1', title: 'Quote 1', status: 'pending', customer: { id: 'c1', name: 'Customer 1' } },
        { id: 'q2', title: 'Quote 2', status: 'accepted', customer: { id: 'c2', name: 'Customer 2' } },
      ];

      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
      }));

      (supabase.from as jest.Mock) = mockFrom;

      const { result } = renderHook(() => useQuotes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFrom).toHaveBeenCalledWith('quotes');
    });

    it('should apply search filter', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));

      (supabase.from as jest.Mock) = mockFrom;

      const filters = { searchQuery: 'test' };
      renderHook(() => useQuotes(filters));

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalled();
      });
    });

    it('should apply status filter', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));

      (supabase.from as jest.Mock) = mockFrom;

      const filters = { status: ['pending', 'sent'] };
      renderHook(() => useQuotes(filters));

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalled();
      });
    });

    it('should handle error state', async () => {
      const mockError = new Error('Database error');

      (supabase.from as jest.Mock) = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      }));

      const { result } = renderHook(() => useQuotes());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('usePaginatedQuotes', () => {
    it('should handle pagination', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [{ id: 'q1', title: 'Quote 1' }],
          error: null,
          count: 100,
        }),
      }));

      (supabase.from as jest.Mock) = mockFrom;

      const { result } = renderHook(() =>
        usePaginatedQuotes({ page: 1, pageSize: 20 })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.data?.page).toBe(2);
    });

    it('should calculate pagination correctly', async () => {
      const mockQuotes = Array.from({ length: 50 }, (_, i) => ({
        id: `q${i}`,
        title: `Quote ${i}`,
      }));

      (supabase.from as jest.Mock) = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockQuotes.slice(0, 20),
          error: null,
          count: 50,
        }),
      }));

      const { result } = renderHook(() =>
        usePaginatedQuotes({ page: 1, pageSize: 20 })
      );

      await waitFor(() => {
        expect(result.current.data?.totalPages).toBe(3);
        expect(result.current.data?.hasNextPage).toBe(true);
        expect(result.current.data?.hasPrevPage).toBe(false);
      });
    });
  });

  describe('useQuote', () => {
    it('should fetch single quote', async () => {
      const mockQuote = {
        id: 'q1',
        title: 'Quote 1',
        customer: { id: 'c1', name: 'Customer 1' },
        line_items: [],
      };

      (supabase.from as jest.Mock) = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockQuote, error: null }),
      }));

      const { result } = renderHook(() => useQuote('q1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(supabase.from).toHaveBeenCalledWith('quotes');
    });

    it('should not fetch when quoteId is null', () => {
      (supabase.from as jest.Mock) = jest.fn();

      renderHook(() => useQuote(null));

      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should handle quote not found', async () => {
      (supabase.from as jest.Mock) = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const { result } = renderHook(() => useQuote('nonexistent'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useQuoteStats', () => {
    it('should calculate stats correctly', async () => {
      const mockQuotes = [
        { id: 'q1', status: 'pending', total: 100 },
        { id: 'q2', status: 'accepted', total: 200 },
        { id: 'q3', status: 'accepted', total: 300 },
        { id: 'q4', status: 'declined', total: 150 },
      ];

      (supabase.from as jest.Mock) = jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
      }));

      const { result } = renderHook(() => useQuoteStats());

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      const stats = result.current.data;
      expect(stats?.totalQuotes).toBe(4);
      expect(stats?.acceptedQuotes).toBe(2);
      expect(stats?.totalRevenue).toBe(500);
      expect(stats?.conversionRate).toBe(50);
    });

    it('should handle period filtering', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));

      (supabase.from as jest.Mock) = mockFrom;

      renderHook(() => useQuoteStats('7d'));

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('quotes');
      });
    });
  });

  describe('useCustomers', () => {
    it('should fetch customers', async () => {
      const mockCustomers = [
        { id: 'c1', company_name: 'Company A', email: 'a@example.com' },
        { id: 'c2', company_name: 'Company B', email: 'b@example.com' },
      ];

      (supabase.from as jest.Mock) = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCustomers, error: null }),
      }));

      const { result } = renderHook(() => useCustomers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(supabase.from).toHaveBeenCalledWith('customers');
    });

    it('should apply search filter', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }));

      (supabase.from as jest.Mock) = mockFrom;

      renderHook(() => useCustomers('acme'));

      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalled();
      });
    });
  });

  describe('useCustomer', () => {
    it('should fetch customer with stats', async () => {
      const mockCustomer = {
        id: 'c1',
        company_name: 'Company A',
        email: 'a@example.com',
      };

      const mockQuotes = [
        { id: 'q1', status: 'accepted', total: 100 },
        { id: 'q2', status: 'pending', total: 200 },
      ];

      (supabase.from as jest.Mock) = jest.fn().mockImplementation((table) => {
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockCustomer, error: null }),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useCustomer('c1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.stats).toBeDefined();
    });
  });

  describe('useCreateQuote', () => {
    it('should create quote successfully', async () => {
      const mockQuote = {
        id: 'q-new',
        title: 'New Quote',
        customer_id: 'c1',
        status: 'draft',
      };

      (supabase.from as jest.Mock) = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockQuote, error: null }),
      }));

      const onSuccess = jest.fn();
      const { result } = renderHook(() => useCreateQuote({ onSuccess }));

      await act(async () => {
        await result.current.mutateAsync({
          customerId: 'c1',
          title: 'New Quote',
        } as any);
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockQuote);
    });

    it('should handle creation error', async () => {
      const mockError = new Error('Creation failed');

      (supabase.from as jest.Mock) = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      }));

      const onError = jest.fn();
      const { result } = renderHook(() => useCreateQuote({ onError }));

      await act(async () => {
        try {
          await result.current.mutateAsync({
            customerId: 'c1',
            title: 'New Quote',
          } as any);
        } catch {
          // Expected error
        }
      });

      expect(onError).toHaveBeenCalled();
      expect(result.current.isError).toBe(true);
    });
  });

  describe('useUpdateQuote', () => {
    it('should update quote successfully', async () => {
      const mockQuote = {
        id: 'q1',
        title: 'Updated Quote',
        status: 'sent',
      };

      (supabase.from as jest.Mock) = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockQuote, error: null }),
      }));

      const onSuccess = jest.fn();
      const { result } = renderHook(() => useUpdateQuote({ onSuccess }));

      await act(async () => {
        await result.current.mutateAsync({
          id: 'q1',
          title: 'Updated Quote',
          status: 'sent',
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('useDeleteQuote', () => {
    it('should delete quote successfully', async () => {
      (supabase.from as jest.Mock) = jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }));

      const onSuccess = jest.fn();
      const { result } = renderHook(() => useDeleteQuote({ onSuccess }));

      await act(async () => {
        await result.current.mutateAsync('q1');
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('useUpdateQuoteStatus', () => {
    it('should update status to sent', async () => {
      const mockQuote = {
        id: 'q1',
        status: 'sent',
        sent_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock) = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockQuote, error: null }),
      }));

      const { result } = renderHook(() => useUpdateQuoteStatus());

      await act(async () => {
        await result.current.mutateAsync({ id: 'q1', status: 'sent' });
      });

      expect(result.current.data?.status).toBe('sent');
    });

    it('should update status to accepted', async () => {
      const mockQuote = {
        id: 'q1',
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock) = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockQuote, error: null }),
      }));

      const { result } = renderHook(() => useUpdateQuoteStatus());

      await act(async () => {
        await result.current.mutateAsync({ id: 'q1', status: 'accepted' });
      });

      expect(result.current.data?.status).toBe('accepted');
    });

    it('should update status to rejected with reason', async () => {
      const mockQuote = {
        id: 'q1',
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: 'Price too high',
      };

      (supabase.from as jest.Mock) = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockQuote, error: null }),
      }));

      const { result } = renderHook(() => useUpdateQuoteStatus());

      await act(async () => {
        await result.current.mutateAsync({
          id: 'q1',
          status: 'rejected',
          notes: 'Price too high',
        });
      });

      expect(result.current.data?.status).toBe('rejected');
    });
  });

  describe('useCreateCustomer', () => {
    it('should create customer successfully', async () => {
      const mockCustomer = {
        id: 'c-new',
        company_name: 'New Company',
        email: 'new@example.com',
      };

      (supabase.from as jest.Mock) = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCustomer, error: null }),
      }));

      const onSuccess = jest.fn();
      const { result } = renderHook(() => useCreateCustomer({ onSuccess }));

      await act(async () => {
        await result.current.mutateAsync({
          companyName: 'New Company',
          email: 'new@example.com',
        } as any);
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('useDeleteCustomer', () => {
    it('should delete customer successfully', async () => {
      (supabase.from as jest.Mock) = jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }));

      const onSuccess = jest.fn();
      const { result } = renderHook(() => useDeleteCustomer({ onSuccess }));

      await act(async () => {
        await result.current.mutateAsync('c1');
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('useRealtimeQuotes', () => {
    it('should subscribe to real-time updates', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useRealtimeQuotes(mockCallback));

      expect(result.current.isConnected).toBe(true);
    });

    it('should handle subscription errors', () => {
      const mockSubscribe = jest.fn((callback) => {
        callback('CHANNEL_ERROR');
        return { unsubscribe: jest.fn() };
      });

      (supabase.channel as jest.Mock) = jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: mockSubscribe,
      }));

      const { result } = renderHook(() => useRealtimeQuotes());

      expect(result.current.error).toBeTruthy();
    });

    it('should handle real-time events', () => {
      let eventHandler: Function | null = null;

      (supabase.channel as jest.Mock) = jest.fn(() => ({
        on: jest.fn((_, __, handler) => {
          eventHandler = handler;
          return { on: jest.fn().mockReturnThis(), subscribe: jest.fn() };
        }),
        subscribe: jest.fn(),
      }));

      const mockCallback = jest.fn();
      renderHook(() => useRealtimeQuotes(mockCallback));

      if (eventHandler) {
        eventHandler({
          eventType: 'INSERT',
          new: { id: 'q1', title: 'New Quote' },
        });
      }

      expect(mockCallback).toHaveBeenCalledWith({
        event: 'INSERT',
        quote: { id: 'q1', title: 'New Quote' },
      });
    });
  });

  describe('useRealtimeCustomers', () => {
    it('should subscribe to customer real-time updates', () => {
      const { result } = renderHook(() => useRealtimeCustomers());

      expect(result.current.isConnected).toBe(true);
    });
  });

  describe('query cache', () => {
    it('should cache and retrieve data', () => {
      const testData = { id: 1, name: 'Test' };
      queryCache.set('test-key', testData);

      const retrieved = queryCache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should detect stale cache', () => {
      queryCache.set('stale-key', { data: true });

      // Should not be stale immediately
      expect(queryCache.isStale('stale-key', 5000)).toBe(false);

      // Should be stale with very short timeout
      expect(queryCache.isStale('stale-key', 0)).toBe(true);
    });

    it('should invalidate by pattern', () => {
      queryCache.set('quotes:1', { id: 1 });
      queryCache.set('quotes:2', { id: 2 });
      queryCache.set('customers:1', { id: 1 });

      queryCache.invalidate('quotes');

      expect(queryCache.get('quotes:1')).toBeNull();
      expect(queryCache.get('quotes:2')).toBeNull();
      expect(queryCache.get('customers:1')).toEqual({ id: 1 });
    });

    it('should clear all cache', () => {
      queryCache.set('key1', { data: 1 });
      queryCache.set('key2', { data: 2 });

      queryCache.clear();

      expect(queryCache.get('key1')).toBeNull();
      expect(queryCache.get('key2')).toBeNull();
    });
  });
});
