/**
 * Optimized Data Fetching Hooks
 * SWR-like implementation with caching, deduplication, and revalidation
 * @module hooks/useOptimizedData
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { type Quote, type QuoteStatus, type QuoteFilters } from '@/types/quote';

// ============================================================================
// Cache Implementation
// ============================================================================

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
  isValidating: boolean;
};

class DataCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private subscribers = new Map<string, Set<() => void>>();

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
      isValidating: false,
    });
    this.notify(key);
  }

  setValidating(key: string, isValidating: boolean): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.isValidating = isValidating;
    }
  }

  isValidating(key: string): boolean {
    return this.cache.get(key)?.isValidating ?? false;
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

  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  private notify(key: string): void {
    this.subscribers.get(key)?.forEach((cb) => cb());
  }

  // Get cache stats for debugging
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
const globalCache = new DataCache();

// ============================================================================
// Dedupe Implementation
// ============================================================================

const pendingRequests = new Map<string, Promise<unknown>>();

async function dedupeRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = request().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// ============================================================================
// Base Hook
// ============================================================================

interface UseOptimizedDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  enabled?: boolean;
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Revalidate on mount (default: true) */
  revalidateOnMount?: boolean;
  /** Revalidate on window focus (default: true) */
  revalidateOnFocus?: boolean;
  /** Revalidate on network reconnect (default: true) */
  revalidateOnReconnect?: boolean;
  /** Polling interval in milliseconds (disabled if undefined) */
  refreshInterval?: number;
  /** Retry count on error (default: 3) */
  retryCount?: number;
  /** Retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Initial data */
  initialData?: T;
  /** Callbacks */
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseOptimizedDataReturn<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T, shouldRevalidate?: boolean) => Promise<void>;
}

export function useOptimizedData<T>({
  key,
  fetcher,
  enabled = true,
  ttl = 5 * 60 * 1000, // 5 minutes
  revalidateOnMount = true,
  revalidateOnFocus = true,
  revalidateOnReconnect = true,
  refreshInterval,
  retryCount = 3,
  retryDelay = 1000,
  initialData,
  onSuccess,
  onError,
}: UseOptimizedDataOptions<T>): UseOptimizedDataReturn<T> {
  const [data, setData] = useState<T | undefined>(() => {
    const cached = globalCache.get<T>(key);
    return cached ?? initialData;
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const retryCountRef = useRef(0);

  const isValidating = globalCache.isValidating(key);

  // Fetch function with retry logic
  const fetchData = useCallback(
    async function fetchDataFn(isBackground = false): Promise<void> {
      if (!enabled) return;

      const cached = globalCache.get<T>(key);
      
      // If we have cached data and it's not a background fetch, don't show loading
      if (!cached && !isBackground) {
        setIsLoading(true);
      }

      globalCache.setValidating(key, true);
      setError(null);

      try {
        const result = await dedupeRequest(key, fetcher);
        globalCache.set(key, result, ttl);
        setData(result);
        setError(null);
        retryCountRef.current = 0;
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => {
            fetchDataFn(isBackground);
          }, retryDelay * retryCountRef.current);
          return;
        }

        setError(error);
        onError?.(error);
        
        // If we have stale data, keep it
        if (!data) {
          setIsLoading(false);
        }
      } finally {
        globalCache.setValidating(key, false);
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    },
    [key, fetcher, enabled, ttl, retryCount, retryDelay, data, onSuccess, onError]
  );

  // Subscribe to cache updates
  useEffect(() => {
    return globalCache.subscribe(key, () => {
      const cached = globalCache.get<T>(key);
      if (cached !== undefined) {
        setData(cached);
      }
    });
  }, [key]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    const cached = globalCache.get<T>(key);
    
    if (revalidateOnMount || !cached) {
      fetchData(!cached); // Background fetch if we have cached data
    }
  }, [key, enabled, revalidateOnMount, fetchData]);

  // Window focus revalidation
  useEffect(() => {
    if (!revalidateOnFocus || !enabled) return;

    const handleFocus = () => {
      const cached = globalCache.get<T>(key);
      if (!cached || Date.now() - (globalCache as any).cache?.get(key)?.timestamp > ttl / 2) {
        fetchData(true); // Background fetch
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [key, enabled, revalidateOnFocus, ttl, fetchData]);

  // Network reconnect revalidation
  useEffect(() => {
    if (!revalidateOnReconnect || !enabled) return;

    const handleOnline = () => {
      fetchData(true); // Background fetch
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [key, enabled, revalidateOnReconnect, fetchData]);

  // Polling
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const intervalId = setInterval(() => {
      fetchData(true); // Background fetch
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [key, enabled, refreshInterval, fetchData]);

  // Manual mutate function
  const mutate = useCallback(
    async (newData?: T, shouldRevalidate = true): Promise<void> => {
      if (newData !== undefined) {
        globalCache.set(key, newData, ttl);
        setData(newData);
      }
      
      if (shouldRevalidate) {
        await fetchData(true);
      }
    },
    [key, ttl, fetchData]
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

// ============================================================================
// Paginated Data Hook
// ============================================================================

interface UsePaginatedDataOptions<T> extends Omit<UseOptimizedDataOptions<T[]>, 'key'> {
  baseKey: string;
  page: number;
  limit: number;
}

interface UsePaginatedDataReturn<T> extends UseOptimizedDataReturn<T[]> {
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
}

export function usePaginatedData<T>({
  baseKey,
  page,
  limit,
  fetcher,
  ...options
}: UsePaginatedDataOptions<T>): UsePaginatedDataReturn<T> {
  const key = `${baseKey}:page=${page}:limit=${limit}`;
  const [total, setTotal] = useState(0);

  const wrappedFetcher = useCallback(async (): Promise<T[]> => {
    const result = await fetcher();
    // Assume fetcher returns { data: T[], total: number }
    if (result && typeof result === 'object' && 'total' in result) {
      setTotal((result as { total: number }).total);
      return (result as { data: T[] }).data;
    }
    return result as T[];
  }, [fetcher]);

  const { data, error, isLoading, isValidating, mutate } = useOptimizedData<T[]>({
    key,
    fetcher: wrappedFetcher,
    ...options,
  });

  const pagination = useMemo(
    () => ({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }),
    [page, limit, total]
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    pagination,
    setPage: () => {}, // Placeholder - controlled by parent
    setLimit: () => {}, // Placeholder - controlled by parent
  };
}

// ============================================================================
// Optimized Quotes Hook
// ============================================================================

interface UseOptimizedQuotesOptions {
  shopId: string;
  status?: QuoteStatus[];
  page?: number;
  limit?: number;
  searchQuery?: string;
  enabled?: boolean;
}

export function useOptimizedQuotes({
  shopId,
  status,
  page = 1,
  limit = 20,
  searchQuery,
  enabled = true,
}: UseOptimizedQuotesOptions) {
  const filters = useMemo(
    () => ({
      status,
      searchQuery,
    }),
    [status, searchQuery]
  );

  const key = useMemo(
    () => `quotes:${shopId}:${JSON.stringify(filters)}:page=${page}:limit=${limit}`,
    [shopId, filters, page, limit]
  );

  const fetcher = useCallback(async () => {
    let query = supabase
      .from('quotes')
      .select('*', { count: 'exact' })
      .eq('shop_id', shopId);

    if (status?.length) {
      query = query.in('status', status);
    }

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%`
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      data: (data || []) as Quote[],
      total: count || 0,
    };
  }, [shopId, status, searchQuery, page, limit]);

  const { data, error, isLoading, isValidating, mutate } = useOptimizedData<{
    data: Quote[];
    total: number;
  }>({
    key,
    fetcher,
    enabled: enabled && !!shopId,
    ttl: 2 * 60 * 1000, // 2 minutes for quotes
  });

  return {
    quotes: data?.data || [],
    total: data?.total || 0,
    error,
    isLoading,
    isValidating,
    mutate,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil((data?.total || 0) / limit),
      hasNext: page * limit < (data?.total || 0),
      hasPrev: page > 1,
    },
  };
}

// ============================================================================
// Optimized Quote Stats Hook
// ============================================================================

interface UseOptimizedQuoteStatsOptions {
  shopId: string;
  dateFrom?: Date;
  dateTo?: Date;
  enabled?: boolean;
}

interface QuoteStats {
  total: number;
  pending: number;
  quoted: number;
  accepted: number;
  declined: number;
  conversionRate: number;
  avgQuoteValue: number;
  totalRevenue: number;
}

export function useOptimizedQuoteStats({
  shopId,
  dateFrom,
  dateTo,
  enabled = true,
}: UseOptimizedQuoteStatsOptions) {
  const key = useMemo(
    () =>
      `quote-stats:${shopId}:${dateFrom?.toISOString() || 'all'}:${dateTo?.toISOString() || 'all'}`,
    [shopId, dateFrom, dateTo]
  );

  const fetcher = useCallback(async (): Promise<QuoteStats> => {
    let query = supabase.from('quotes').select('*').eq('shop_id', shopId);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString());
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo.toISOString());
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const quotes = (data || []) as Quote[];
    const total = quotes.length;
    const pending = quotes.filter((q) => q.status === 'pending').length;
    const quoted = quotes.filter((q) => q.status === 'quoted').length;
    const accepted = quotes.filter((q) => q.status === 'accepted').length;
    const declined = quotes.filter((q) => q.status === 'declined').length;

    const totalRevenue = quotes
      .filter((q) => q.status === 'accepted')
      .reduce((sum, q) => sum + (q.total || 0), 0);

    const avgQuoteValue = total > 0 
      ? quotes.reduce((sum, q) => sum + (q.total || 0), 0) / total 
      : 0;

    return {
      total,
      pending,
      quoted,
      accepted,
      declined,
      conversionRate: total > 0 ? (accepted / total) * 100 : 0,
      avgQuoteValue,
      totalRevenue,
    };
  }, [shopId, dateFrom, dateTo]);

  return useOptimizedData<QuoteStats>({
    key,
    fetcher,
    enabled: enabled && !!shopId,
    ttl: 5 * 60 * 1000, // 5 minutes for stats
  });
}

// ============================================================================
// Mutation Hook
// ============================================================================

interface UseOptimizedMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  invalidateKeys?: string[];
  invalidatePatterns?: RegExp[];
}

interface UseOptimizedMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  data: TData | null;
  reset: () => void;
}

export function useOptimizedMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  invalidateKeys = [],
  invalidatePatterns = [],
}: UseOptimizedMutationOptions<TData, TVariables>): UseOptimizedMutationReturn<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        
        // Invalidate cache
        invalidateKeys.forEach((key) => globalCache.invalidate(key));
        invalidatePatterns.forEach((pattern) => globalCache.invalidatePattern(pattern));
        
        onSuccess?.(result, variables);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error, variables);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, invalidateKeys, invalidatePatterns]
  );

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        await mutateAsync(variables);
      } catch {
        // Error already handled in mutateAsync
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
    data,
    reset,
  };
}

// ============================================================================
// Export Cache for External Use
// ============================================================================

export { globalCache };

// Export cache inspection for debugging
export function getCacheStats(): { size: number; keys: string[] } {
  return globalCache.getStats();
}

export function invalidateCache(key: string): void {
  globalCache.invalidate(key);
}

export function invalidateCachePattern(pattern: RegExp): void {
  globalCache.invalidatePattern(pattern);
}

export default {
  useOptimizedData,
  usePaginatedData,
  useOptimizedQuotes,
  useOptimizedQuoteStats,
  useOptimizedMutation,
  getCacheStats,
  invalidateCache,
  invalidateCachePattern,
};
