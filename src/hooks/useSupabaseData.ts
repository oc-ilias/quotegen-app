/**
 * Enhanced Supabase Data Hooks
 * Comprehensive data fetching with caching, real-time updates, and mutations
 * @module hooks/useSupabaseData
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { 
  Quote, 
  Customer, 
  QuoteStatus, 
  QuoteFilters,
  QuoteWithCustomer,
  CustomerWithStats,
  CreateCustomerInput,
  UpdateCustomerInput,
  QuoteStats,
  Activity,
  LineItemInput,
  QuoteTerms,
  QuotePriority
} from '@/types/quote';

// Input types for creating and updating quotes
interface CreateQuoteInput {
  customerId: string;
  title: string;
  status?: QuoteStatus;
  priority?: QuotePriority;
  lineItems?: LineItemInput[];
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  total?: number;
  terms?: Partial<QuoteTerms>;
  expiresAt?: string;
  notes?: string;
}

interface UpdateQuoteInput extends Partial<Omit<CreateQuoteInput, 'customerId'>> {}

// ============================================================================
// Types
// ============================================================================

interface QueryOptions {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number | false;
  retryCount?: number;
  retryDelay?: number;
}

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface MutationState<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<void>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: TData | null;
  reset: () => void;
}

interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============================================================================
// Cache Implementation
// ============================================================================

class QueryCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  isStale(key: string, staleTime: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > staleTime;
  }
  
  invalidate(keyPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const globalCache = new QueryCache();

// ============================================================================
// Base Query Hook
// ============================================================================

function useSupabaseQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryState<T> {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = true,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(() => globalCache.get<T>(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    setIsError(false);
    setError(null);

    try {
      // Check cache first
      if (!globalCache.isStale(key, staleTime)) {
        const cached = globalCache.get<T>(key);
        if (cached) {
          setData(cached);
          setIsLoading(false);
          setIsFetching(false);
          return;
        }
      }

      const result = await queryFn();
      globalCache.set(key, result);
      setData(result);
      retryCountRef.current = 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsError(true);

      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => fetchData(), retryDelay * retryCountRef.current);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [key, queryFn, staleTime, retryCount, retryDelay]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (globalCache.isStale(key, staleTime)) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, key, staleTime, refetchOnWindowFocus]);

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: fetchData,
  };
}

// ============================================================================
// Quote Queries
// ============================================================================

export function useQuotes(
  filters?: QuoteFilters,
  options?: QueryOptions
): QueryState<QuoteWithCustomer[]> {
  const queryKey = useMemo(() => {
    const params = new URLSearchParams();
    if (filters?.searchQuery) params.set('search', filters.searchQuery);
    if (filters?.status?.length) params.set('status', filters.status.join(','));
    if (filters?.dateFrom) params.set('from', filters.dateFrom.toISOString());
    if (filters?.dateTo) params.set('to', filters.dateTo.toISOString());
    if (filters?.minValue) params.set('min', filters.minValue.toString());
    if (filters?.maxValue) params.set('max', filters.maxValue.toString());
    return `quotes:${params.toString()}`;
  }, [filters]);

  const queryFn = useCallback(async (): Promise<QuoteWithCustomer[]> => {
    let query = supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.searchQuery) {
      query = query.or(`
        quote_number.ilike.%${filters.searchQuery}%,
        title.ilike.%${filters.searchQuery}%,
        customer.company_name.ilike.%${filters.searchQuery}%,
        customer.contact_name.ilike.%${filters.searchQuery}%
      `);
    }

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    if (filters?.minValue) {
      query = query.gte('total', filters.minValue);
    }

    if (filters?.maxValue) {
      query = query.lte('total', filters.maxValue);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }, [filters]);

  return useSupabaseQuery(queryKey, queryFn, options);
}

export function usePaginatedQuotes(
  pagination: PaginationOptions = {},
  filters?: QuoteFilters,
  options?: QueryOptions
): QueryState<PaginatedResult<QuoteWithCustomer>> & {
  setPage: (page: number) => void;
} {
  const { page: initialPage = 1, pageSize = 20 } = pagination;
  const [page, setPage] = useState(initialPage);

  const queryKey = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    if (filters?.searchQuery) params.set('search', filters.searchQuery);
    if (filters?.status?.length) params.set('status', filters.status.join(','));
    return `quotes:paginated:${params.toString()}`;
  }, [page, pageSize, filters]);

  const queryFn = useCallback(async (): Promise<PaginatedResult<QuoteWithCustomer>> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        count
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters?.searchQuery) {
      query = query.or(`
        quote_number.ilike.%${filters.searchQuery}%,
        title.ilike.%${filters.searchQuery}%
      `);
    }

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data || [],
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }, [page, pageSize, filters]);

  const result = useSupabaseQuery(queryKey, queryFn, options);

  return {
    ...result,
    setPage,
  };
}

export function useQuote(
  quoteId: string | null,
  options?: QueryOptions
): QueryState<QuoteWithCustomer> {
  const queryKey = `quote:${quoteId}`;

  const queryFn = useCallback(async (): Promise<QuoteWithCustomer> => {
    if (!quoteId) throw new Error('Quote ID is required');

    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        line_items:quote_line_items(*)
      `)
      .eq('id', quoteId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Quote not found');
    return data;
  }, [quoteId]);

  return useSupabaseQuery(queryKey, queryFn, {
    ...options,
    staleTime: 2 * 60 * 1000, // 2 minutes for single quote
  });
}

export function useQuoteStats(
  period?: '7d' | '30d' | '90d' | '1y',
  options?: QueryOptions
): QueryState<QuoteStats> {
  const queryKey = `quotes:stats:${period || 'all'}`;

  const queryFn = useCallback(async (): Promise<QuoteStats> => {
    let query = supabase.from('quotes').select('*');

    if (period) {
      const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period];
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      query = query.gte('created_at', fromDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const quotes = data || [];
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
    const totalRevenue = quotes
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (q.total || 0), 0);
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    const avgQuoteValue = totalQuotes > 0 
      ? quotes.reduce((sum, q) => sum + (q.total || 0), 0) / totalQuotes 
      : 0;

    return {
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalRevenue,
      avgQuoteValue: Math.round(avgQuoteValue * 100) / 100,
      avgResponseTime: 0, // TODO: Calculate from status history
      periodChange: {
        totalQuotes: 0,
        conversionRate: 0,
        totalRevenue: 0,
        avgQuoteValue: 0,
      },
    };
  }, [period]);

  return useSupabaseQuery(queryKey, queryFn, options);
}

// ============================================================================
// Customer Queries
// ============================================================================

export function useCustomers(
  search?: string,
  options?: QueryOptions
): QueryState<Customer[]> {
  const queryKey = `customers:${search || 'all'}`;

  const queryFn = useCallback(async (): Promise<Customer[]> => {
    let query = supabase
      .from('customers')
      .select('*')
      .order('company_name', { ascending: true });

    if (search) {
      query = query.or(`
        company_name.ilike.%${search}%,
        contact_name.ilike.%${search}%,
        email.ilike.%${search}%
      `);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }, [search]);

  return useSupabaseQuery(queryKey, queryFn, options);
}

export function useCustomer(
  customerId: string | null,
  options?: QueryOptions
): QueryState<CustomerWithStats> {
  const queryKey = `customer:${customerId}`;

  const queryFn = useCallback(async (): Promise<CustomerWithStats> => {
    if (!customerId) throw new Error('Customer ID is required');

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError) throw customerError;
    if (!customer) throw new Error('Customer not found');

    // Fetch customer stats
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .eq('customer_id', customerId);

    if (quotesError) throw quotesError;

    const quoteList = quotes || [];
    const totalQuotes = quoteList.length;
    const acceptedQuotes = quoteList.filter(q => q.status === 'accepted').length;
    const declinedQuotes = quoteList.filter(q => q.status === 'rejected').length;
    const pendingQuotes = quoteList.filter(q => q.status === 'pending' || q.status === 'sent').length;
    const totalRevenue = quoteList
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (q.total || 0), 0);
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

    return {
      ...customer,
      stats: {
        totalQuotes,
        totalRevenue,
        avgQuoteValue: totalQuotes > 0 ? totalRevenue / acceptedQuotes : 0,
        acceptedQuotes,
        declinedQuotes,
        pendingQuotes,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
    };
  }, [customerId]);

  return useSupabaseQuery(queryKey, queryFn, options);
}

export function useCustomerQuotes(
  customerId: string | null,
  options?: QueryOptions
): QueryState<Quote[]> {
  const queryKey = `customer:${customerId}:quotes`;

  const queryFn = useCallback(async (): Promise<Quote[]> => {
    if (!customerId) throw new Error('Customer ID is required');

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, [customerId]);

  return useSupabaseQuery(queryKey, queryFn, options);
}

// ============================================================================
// Mutation Hooks
// ============================================================================

function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[];
  }
): MutationState<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setData(null);
  }, []);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      
      // Invalidate cache
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(pattern => {
          globalCache.invalidate(pattern);
        });
      }

      options?.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsError(true);
      options?.onError?.(error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  const mutate = useCallback(async (variables: TVariables): Promise<void> => {
    try {
      await mutateAsync(variables);
    } catch {
      // Error already handled
    }
  }, [mutateAsync]);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error,
    data,
    reset,
  };
}

// Quote Mutations
export function useCreateQuote(options?: {
  onSuccess?: (data: Quote) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<Quote, CreateQuoteInput>(
    async (input) => {
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create quote');
      return data;
    },
    {
      ...options,
      invalidateQueries: ['quotes'],
    }
  );
}

export function useUpdateQuote(options?: {
  onSuccess?: (data: Quote) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<Quote, { id: string } & UpdateQuoteInput>(
    async ({ id, ...input }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update quote');
      return data;
    },
    {
      ...options,
      invalidateQueries: ['quotes', `quote:`],
    }
  );
}

export function useDeleteQuote(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<void, string>(
    async (id) => {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    {
      ...options,
      invalidateQueries: ['quotes'],
    }
  );
}

export function useBulkDeleteQuotes(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<void, string[]>(
    async (ids) => {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    {
      ...options,
      invalidateQueries: ['quotes'],
    }
  );
}

export function useUpdateQuoteStatus(options?: {
  onSuccess?: (data: Quote) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<Quote, { id: string; status: QuoteStatus; notes?: string }>(
    async ({ id, status, notes }) => {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
        if (notes) updateData.rejection_reason = notes;
      }

      const { data, error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update quote status');
      return data;
    },
    {
      ...options,
      invalidateQueries: ['quotes', `quote:`],
    }
  );
}

// Customer Mutations
export function useCreateCustomer(options?: {
  onSuccess?: (data: Customer) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<Customer, CreateCustomerInput>(
    async (input) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create customer');
      return data;
    },
    {
      ...options,
      invalidateQueries: ['customers'],
    }
  );
}

export function useUpdateCustomer(options?: {
  onSuccess?: (data: Customer) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<Customer, { id: string } & UpdateCustomerInput>(
    async ({ id, ...input }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update customer');
      return data;
    },
    {
      ...options,
      invalidateQueries: ['customers', `customer:`],
    }
  );
}

export function useDeleteCustomer(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<void, string>(
    async (id) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    {
      ...options,
      invalidateQueries: ['customers', 'quotes'],
    }
  );
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export function useRealtimeQuotes(
  callback?: (payload: { event: string; quote: Quote }) => void
): { isConnected: boolean; error: Error | null } {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('quotes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        (payload) => {
          globalCache.invalidate('quotes');
          callback?.({
            event: payload.eventType,
            quote: payload.new as Quote,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR') {
          setError(new Error('Failed to connect to real-time updates'));
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [callback]);

  return { isConnected, error };
}

export function useRealtimeCustomers(
  callback?: (payload: { event: string; customer: Customer }) => void
): { isConnected: boolean; error: Error | null } {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('customers-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          globalCache.invalidate('customers');
          callback?.({
            event: payload.eventType,
            customer: payload.new as Customer,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR') {
          setError(new Error('Failed to connect to real-time updates'));
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [callback]);

  return { isConnected, error };
}

// ============================================================================
// Export
// ============================================================================

export {
  useSupabaseQuery,
  globalCache as queryCache,
};

export type {
  QueryOptions,
  QueryState,
  MutationState,
  PaginationOptions,
  PaginatedResult,
  CreateQuoteInput,
  UpdateQuoteInput,
};
