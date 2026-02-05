/**
 * Enhanced Supabase API Integration Hooks
 * Comprehensive data fetching with caching, error handling, and real-time updates
 * @module hooks/useSupabaseData
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  type Quote, 
  type Customer, 
  type QuoteStatus, 
  type QuoteFilters,
  type ApiResponse,
  type QuoteStats 
} from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface UseDataOptions<T> {
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

interface UsePaginatedDataReturn<T> extends UseDataReturn<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
}

interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: TData | null;
  reset: () => void;
}

// ============================================================================
// Cache Management
// ============================================================================

class QueryCache {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private subscribers: Map<string, Set<() => void>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.notify(key);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.notify(key);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.invalidate(key);
      }
    }
  }

  isStale(key: string, staleTime: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > staleTime;
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);
    return () => this.subscribers.get(key)?.delete(callback);
  }

  private notify(key: string): void {
    this.subscribers.get(key)?.forEach(cb => cb());
  }
}

export const queryCache = new QueryCache();

// ============================================================================
// Base Hook
// ============================================================================

function useSupabaseQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: UseDataOptions<T> = {}
): UseDataReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    refetchOnWindowFocus = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(() => queryCache.get<T>(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isMounted.current) return;

    // Check cache first
    const cached = queryCache.get<T>(key);
    if (cached && !queryCache.isStale(key, staleTime) && !isBackground) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    if (!isBackground) setIsLoading(true);
    setIsFetching(true);
    setIsError(false);
    setError(null);

    try {
      const result = await queryFn();
      if (isMounted.current) {
        queryCache.set(key, result);
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setIsError(true);
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [key, queryFn, staleTime, onSuccess, onError]);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    queryCache.invalidate(key);
    refetch();
  }, [key, refetch]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refetchInterval, enabled, fetchData]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;
    
    const handleFocus = () => {
      if (queryCache.isStale(key, staleTime)) {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, key, staleTime, fetchData]);

  // Subscribe to cache updates
  useEffect(() => {
    return queryCache.subscribe(key, () => {
      const cached = queryCache.get<T>(key);
      if (cached) setData(cached);
    });
  }, [key]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    invalidate,
  };
}

// ============================================================================
// Quotes Hooks
// ============================================================================

export function useQuotes(
  filters?: QuoteFilters,
  options?: UseDataOptions<Quote[]>
): UseDataReturn<Quote[]> {
  const queryFn = useCallback(async () => {
    let query = supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    if (filters?.minValue !== undefined) {
      query = query.gte('total', filters.minValue);
    }

    if (filters?.maxValue !== undefined) {
      query = query.lte('total', filters.maxValue);
    }

    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,quote_number.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return (data || []) as Quote[];
  }, [filters]);

  const cacheKey = useMemo(() => {
    const filterKey = filters ? JSON.stringify(filters) : 'all';
    return `quotes:${filterKey}`;
  }, [filters]);

  return useSupabaseQuery(cacheKey, queryFn, options);
}

export function usePaginatedQuotes(
  filters?: QuoteFilters,
  initialPage = 1,
  initialLimit = 20,
  options?: UseDataOptions<Quote[]>
): UsePaginatedDataReturn<Quote> {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const queryFn = useCallback(async () => {
    let query = supabase
      .from('quotes')
      .select('*', { count: 'exact' });

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    if (filters?.minValue !== undefined) {
      query = query.gte('total', filters.minValue);
    }

    if (filters?.maxValue !== undefined) {
      query = query.lte('total', filters.maxValue);
    }

    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,quote_number.ilike.%${filters.searchQuery}%`);
    }

    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { 
        ascending: filters.sortOrder === 'asc' 
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);
    
    return {
      data: (data || []) as Quote[],
      total: count || 0,
    };
  }, [filters, page, limit]);

  const cacheKey = useMemo(() => {
    const filterKey = filters ? JSON.stringify(filters) : 'all';
    return `quotes:paginated:${filterKey}:${page}:${limit}`;
  }, [filters, page, limit]);

  const { data, ...rest } = useSupabaseQuery(cacheKey, queryFn, options);

  const pagination = useMemo(() => {
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }, [data, page, limit]);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) setPage(p => p + 1);
  }, [pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) setPage(p => p - 1);
  }, [pagination.hasPrev]);

  return {
    data: data?.data || null,
    ...rest,
    pagination,
    setPage,
    setLimit,
    nextPage,
    prevPage,
  };
}

export function useQuote(quoteId: string, options?: UseDataOptions<Quote>): UseDataReturn<Quote> {
  const queryFn = useCallback(async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (error) throw new Error(error.message);
    return data as Quote;
  }, [quoteId]);

  return useSupabaseQuery(`quote:${quoteId}`, queryFn, {
    enabled: !!quoteId,
    ...options,
  });
}

export function useQuoteStats(
  dateRange?: { from: Date; to: Date },
  options?: UseDataOptions<QuoteStats>
): UseDataReturn<QuoteStats> {
  const queryFn = useCallback(async () => {
    let query = supabase.from('quotes').select('*');

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const quotes = (data || []) as Quote[];
    
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
      conversionRate,
      totalRevenue,
      avgQuoteValue,
      avgResponseTime: 48, // Mock - would calculate from actual data
      periodChange: {
        totalQuotes: 12,
        conversionRate: 5.2,
        totalRevenue: 15000,
        avgQuoteValue: 500,
      },
    } as QuoteStats;
  }, [dateRange]);

  const cacheKey = dateRange 
    ? `stats:${dateRange.from.toISOString()}:${dateRange.to.toISOString()}`
    : 'stats:all';

  return useSupabaseQuery(cacheKey, queryFn, options);
}

// ============================================================================
// Customers Hooks
// ============================================================================

export function useCustomers(
  searchQuery?: string,
  options?: UseDataOptions<Customer[]>
): UseDataReturn<Customer[]> {
  const queryFn = useCallback(async () => {
    let query = supabase
      .from('customers')
      .select('*')
      .order('company_name', { ascending: true });

    if (searchQuery) {
      query = query.or(`company_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return (data || []) as Customer[];
  }, [searchQuery]);

  const cacheKey = searchQuery ? `customers:search:${searchQuery}` : 'customers:all';

  return useSupabaseQuery(cacheKey, queryFn, options);
}

export function useCustomer(customerId: string, options?: UseDataOptions<Customer>): UseDataReturn<Customer> {
  const queryFn = useCallback(async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) throw new Error(error.message);
    return data as Customer;
  }, [customerId]);

  return useSupabaseQuery(`customer:${customerId}`, queryFn, {
    enabled: !!customerId,
    ...options,
  });
}

export function useCustomerQuotes(customerId: string, options?: UseDataOptions<Quote[]>): UseDataReturn<Quote[]> {
  const queryFn = useCallback(async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Quote[];
  }, [customerId]);

  return useSupabaseQuery(`customer:${customerId}:quotes`, queryFn, {
    enabled: !!customerId,
    ...options,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TVariables>
): UseMutationReturn<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      options?.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setIsError(true);
      setError(error);
      options?.onError?.(error, variables);
      throw error;
    } finally {
      setIsLoading(false);
      options?.onSettled?.(data, error, variables);
    }
  }, [mutationFn, options]);

  const mutate = useCallback((variables: TVariables) => {
    mutateAsync(variables).catch(() => {
      // Error handled by onError callback
    });
  }, [mutateAsync]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setData(null);
  }, []);

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

export function useCreateQuote(options?: UseMutationOptions<Quote, Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>) {
  return useSupabaseMutation(
    async (quoteData) => {
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          ...quoteData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Invalidate quotes cache
      queryCache.invalidatePattern(/^quotes:/);
      
      return data as Quote;
    },
    options
  );
}

export function useUpdateQuote(options?: UseMutationOptions<Quote, { id: string; data: Partial<Quote> }>) {
  return useSupabaseMutation(
    async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('quotes')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Invalidate caches
      queryCache.invalidate(`quote:${id}`);
      queryCache.invalidatePattern(/^quotes:/);
      
      return result as Quote;
    },
    options
  );
}

export function useDeleteQuote(options?: UseMutationOptions<void, string>) {
  return useSupabaseMutation(
    async (id) => {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      // Invalidate caches
      queryCache.invalidate(`quote:${id}`);
      queryCache.invalidatePattern(/^quotes:/);
    },
    options
  );
}

export function useBulkDeleteQuotes(options?: UseMutationOptions<void, string[]>) {
  return useSupabaseMutation(
    async (ids) => {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .in('id', ids);

      if (error) throw new Error(error.message);
      
      // Invalidate caches
      ids.forEach(id => queryCache.invalidate(`quote:${id}`));
      queryCache.invalidatePattern(/^quotes:/);
    },
    options
  );
}

export function useUpdateQuoteStatus(options?: UseMutationOptions<Quote, { id: string; status: QuoteStatus }>) {
  return useSupabaseMutation(
    async ({ id, status }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
          ...(status === 'sent' ? { sent_at: new Date().toISOString() } : {}),
          ...(status === 'viewed' ? { viewed_at: new Date().toISOString() } : {}),
          ...(status === 'rejected' ? { rejected_at: new Date().toISOString() } : {}),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      // Invalidate caches
      queryCache.invalidate(`quote:${id}`);
      queryCache.invalidatePattern(/^quotes:/);
      
      return data as Quote;
    },
    options
  );
}

export function useCreateCustomer(options?: UseMutationOptions<Customer, Omit<Customer, 'id' | 'customerSince'>>) {
  return useSupabaseMutation(
    async (customerData) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          customer_since: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      queryCache.invalidatePattern(/^customers:/);
      
      return data as Customer;
    },
    options
  );
}

export function useUpdateCustomer(options?: UseMutationOptions<Customer, { id: string; data: Partial<Customer> }>) {
  return useSupabaseMutation(
    async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      queryCache.invalidate(`customer:${id}`);
      queryCache.invalidatePattern(/^customers:/);
      
      return result as Customer;
    },
    options
  );
}

export function useDeleteCustomer(options?: UseMutationOptions<void, string>) {
  return useSupabaseMutation(
    async (id) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      queryCache.invalidate(`customer:${id}`);
      queryCache.invalidatePattern(/^customers:/);
    },
    options
  );
}

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export function useRealtimeTable<T extends { id: string }>(
  tableName: string,
  options?: {
    filter?: string;
    onInsert?: (payload: T) => void;
    onUpdate?: (payload: T) => void;
    onDelete?: (payload: { id: string }) => void;
  }
) {
  useEffect(() => {
    const subscription = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: options?.filter,
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              options?.onInsert?.(payload.new as T);
              break;
            case 'UPDATE':
              options?.onUpdate?.(payload.new as T);
              break;
            case 'DELETE':
              options?.onDelete?.(payload.old as { id: string });
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, options]);
}

export function useRealtimeQuotesSubscription(
  onChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', data: Quote) => void
) {
  useRealtimeTable<Quote>('quotes', {
    onInsert: (quote) => onChange?.('INSERT', quote),
    onUpdate: (quote) => onChange?.('UPDATE', quote),
    onDelete: (quote) => onChange?.('DELETE', quote as Quote),
  });
}

// ============================================================================
// Optimistic Updates
// ============================================================================

export function useOptimisticUpdate<T>(
  key: string,
  updateFn: (current: T | null, update: Partial<T>) => T
) {
  const applyOptimisticUpdate = useCallback((update: Partial<T>) => {
    const current = queryCache.get<T>(key);
    const optimistic = updateFn(current, update);
    queryCache.set(`${key}:optimistic`, optimistic);
    return () => {
      queryCache.invalidate(`${key}:optimistic`);
    };
  }, [key, updateFn]);

  return { applyOptimisticUpdate };
}

// ============================================================================
// Export
// ============================================================================

export default {
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
  useBulkDeleteQuotes,
  useUpdateQuoteStatus,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useRealtimeTable,
  useRealtimeQuotesSubscription,
  queryCache,
};
