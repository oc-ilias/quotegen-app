/**
 * Customer Hooks
 * SWR-based hooks for customer data fetching and mutations
 * @module hooks/useCustomers
 */

'use client';

import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import type {
  Customer,
  CustomerWithStats,
  CustomerFilter,
  CustomerStats,
  CustomerActivity,
} from '@/types/quote';
import type { ApiResponse } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface CustomersListResponse {
  customers: CustomerWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CustomerResponse {
  customer: CustomerWithStats;
}

interface CustomerQuotesResponse {
  quotes: Array<{
    id: string;
    quoteNumber: string;
    title: string;
    status: string;
    total: number;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Fetcher
// ============================================================================

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'An error occurred');
  }
  const data: ApiResponse<unknown> = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'An error occurred');
  }
  return data.data;
};

// ============================================================================
// Query Builders
// ============================================================================

const buildQueryString = (filters: CustomerFilter & { page?: number; limit?: number }): string => {
  const params = new URLSearchParams();
  
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.searchQuery) params.set('search', filters.searchQuery);
  if (filters.status?.length) params.set('status', filters.status.join(','));
  if (filters.tags?.length) params.set('tags', filters.tags.join(','));
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom.toISOString());
  if (filters.dateTo) params.set('dateTo', filters.dateTo.toISOString());
  if (filters.minQuotes !== undefined) params.set('minQuotes', filters.minQuotes.toString());
  if (filters.maxQuotes !== undefined) params.set('maxQuotes', filters.maxQuotes.toString());
  if (filters.minRevenue !== undefined) params.set('minRevenue', filters.minRevenue.toString());
  if (filters.maxRevenue !== undefined) params.set('maxRevenue', filters.maxRevenue.toString());
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  
  return params.toString();
};

// ============================================================================
// List Hook
// ============================================================================

export function useCustomersList(
  filters: CustomerFilter & { page?: number; limit?: number } = {},
  options?: { refreshInterval?: number; revalidateOnFocus?: boolean }
) {
  const queryString = buildQueryString(filters);
  const key = `/api/customers${queryString ? `?${queryString}` : ''}`;
  
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR(
    key,
    fetcher,
    {
      refreshInterval: options?.refreshInterval ?? 0,
      revalidateOnFocus: options?.revalidateOnFocus ?? true,
      dedupingInterval: 2000,
    }
  );

  return {
    customers: (data as CustomersListResponse | undefined)?.customers ?? [],
    pagination: (data as CustomersListResponse | undefined)?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    isValidating,
    error,
    revalidate,
  };
}

// ============================================================================
// Single Customer Hook
// ============================================================================

export function useCustomer(id: string | null, options?: { refreshInterval?: number }) {
  const key = id ? `/api/customers/${id}` : null;
  
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR(
    key,
    fetcher,
    {
      refreshInterval: options?.refreshInterval ?? 0,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    customer: (data as CustomerResponse | undefined)?.customer ?? null,
    isLoading,
    isValidating,
    error,
    revalidate,
  };
}

// ============================================================================
// Customer Stats Hook
// ============================================================================

export function useCustomerStats(id: string | null) {
  const key = id ? `/api/customers/${id}/stats` : null;
  
  const { data, error, isLoading } = useSWR(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    stats: (data as { stats: CustomerStats } | undefined)?.stats ?? null,
    isLoading,
    error,
  };
}

// ============================================================================
// Customer Activity Hook
// ============================================================================

export function useCustomerActivity(
  id: string | null,
  options: { page?: number; limit?: number } = {}
) {
  const params = new URLSearchParams();
  if (options.page) params.set('page', options.page.toString());
  if (options.limit) params.set('limit', options.limit.toString());
  
  const key = id ? `/api/customers/${id}/activity?${params.toString()}` : null;
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const response = data as { activities: CustomerActivity[]; pagination: { page: number; limit: number; total: number; totalPages: number } } | undefined;

  return {
    activities: response?.activities ?? [],
    pagination: response?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading,
    error,
    revalidate,
  };
}

// ============================================================================
// Customer Quotes Hook
// ============================================================================

export function useCustomerQuotes(
  id: string | null,
  options: { page?: number; limit?: number } = {}
) {
  const params = new URLSearchParams();
  if (options.page) params.set('page', options.page.toString());
  if (options.limit) params.set('limit', options.limit.toString());
  
  const key = id ? `/api/customers/${id}/quotes?${params.toString()}` : null;
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    key,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const response = data as CustomerQuotesResponse | undefined;

  return {
    quotes: response?.quotes ?? [],
    pagination: response?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    revalidate,
  };
}

// ============================================================================
// Create Customer Mutation
// ============================================================================

interface CreateCustomerInput {
  email: string;
  companyName: string;
  contactName: string;
  phone?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
  tags?: string[];
  notes?: string;
  logoUrl?: string;
}

async function createCustomerFetcher(
  url: string,
  { arg }: { arg: CreateCustomerInput }
): Promise<Customer> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create customer');
  }

  const data: ApiResponse<Customer> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to create customer');
  }

  return data.data;
}

export function useCreateCustomer() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/customers',
    createCustomerFetcher
  );

  const createCustomer = async (input: CreateCustomerInput) => {
    const result = await trigger(input);
    // Revalidate the customers list
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/customers'), undefined, {
      revalidate: true,
    });
    return result;
  };

  return {
    createCustomer,
    isCreating: isMutating,
    error,
  };
}

// ============================================================================
// Update Customer Mutation
// ============================================================================

interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  status?: 'active' | 'inactive' | 'archived';
}

async function updateCustomerFetcher(
  url: string,
  { arg }: { arg: { id: string; data: UpdateCustomerInput } }
): Promise<Customer> {
  const response = await fetch(`${url}/${arg.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update customer');
  }

  const data: ApiResponse<Customer> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to update customer');
  }

  return data.data;
}

export function useUpdateCustomer() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/customers',
    updateCustomerFetcher
  );

  const updateCustomer = async (id: string, input: UpdateCustomerInput) => {
    const result = await trigger({ id, data: input });
    // Revalidate the customer and list
    await mutate(`/api/customers/${id}`, undefined, { revalidate: true });
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/customers'), undefined, {
      revalidate: true,
    });
    return result;
  };

  return {
    updateCustomer,
    isUpdating: isMutating,
    error,
  };
}

// ============================================================================
// Delete Customer Mutation
// ============================================================================

async function deleteCustomerFetcher(
  url: string,
  { arg }: { arg: { id: string } }
): Promise<void> {
  const response = await fetch(`${url}/${arg.id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete customer');
  }
}

export function useDeleteCustomer() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/customers',
    deleteCustomerFetcher
  );

  const deleteCustomer = async (id: string) => {
    await trigger({ id });
    // Revalidate the customers list
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/customers'), undefined, {
      revalidate: true,
    });
  };

  return {
    deleteCustomer,
    isDeleting: isMutating,
    error,
  };
}

// ============================================================================
// Add Customer Note Mutation
// ============================================================================

interface AddNoteInput {
  content: string;
}

async function addNoteFetcher(
  url: string,
  { arg }: { arg: { customerId: string; data: AddNoteInput } }
): Promise<CustomerActivity> {
  const response = await fetch(`${url}/${arg.customerId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to add note');
  }

  const data: ApiResponse<CustomerActivity> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to add note');
  }

  return data.data;
}

export function useAddCustomerNote() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/customers',
    addNoteFetcher
  );

  const addNote = async (customerId: string, content: string) => {
    const result = await trigger({ customerId, data: { content } });
    // Revalidate customer activity
    await mutate(`/api/customers/${customerId}/activity`, undefined, { revalidate: true });
    return result;
  };

  return {
    addNote,
    isAdding: isMutating,
    error,
  };
}

// ============================================================================
// Bulk Operations
// ============================================================================

interface BulkUpdateInput {
  ids: string[];
  data: UpdateCustomerInput;
}

async function bulkUpdateFetcher(
  url: string,
  { arg }: { arg: BulkUpdateInput }
): Promise<void> {
  const response = await fetch(`${url}/bulk`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update customers');
  }
}

export function useBulkUpdateCustomers() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/customers',
    bulkUpdateFetcher
  );

  const bulkUpdate = async (ids: string[], data: UpdateCustomerInput) => {
    await trigger({ ids, data });
    // Revalidate all customer lists
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/customers'), undefined, {
      revalidate: true,
    });
  };

  return {
    bulkUpdate,
    isUpdating: isMutating,
    error,
  };
}

async function bulkDeleteFetcher(
  url: string,
  { arg }: { arg: { ids: string[] } }
): Promise<void> {
  const response = await fetch(`${url}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete customers');
  }
}

export function useBulkDeleteCustomers() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/customers',
    bulkDeleteFetcher
  );

  const bulkDelete = async (ids: string[]) => {
    await trigger({ ids });
    // Revalidate all customer lists
    await mutate((key) => typeof key === 'string' && key.startsWith('/api/customers'), undefined, {
      revalidate: true,
    });
  };

  return {
    bulkDelete,
    isDeleting: isMutating,
    error,
  };
}
