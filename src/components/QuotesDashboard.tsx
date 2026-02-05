'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Quote } from '@/types/quote';
import { useOptimizedQuotes, useOptimizedQuoteStats, useOptimizedMutation } from '@/hooks/useOptimizedData';
import { supabase } from '@/lib/supabase';
import { VirtualList } from '@/components/VirtualList';
import { LoadingSpinner } from '@/components/ErrorBoundary';

interface QuotesDashboardProps {
  shopId: string;
}

// Memoized stat card component
const StatCard = memo(function StatCard({
  title,
  value,
  color,
  loading,
}: {
  title: string;
  value: number | string;
  color: 'gray' | 'yellow' | 'blue' | 'green';
  loading?: boolean;
}) {
  const colorClasses = {
    gray: 'bg-white text-gray-900',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className={`p-4 rounded-lg shadow ${colorClasses[color]}`}>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
});

// Memoized quote row component
const QuoteRow = memo(function QuoteRow({
  quote,
  onView,
}: {
  quote: Quote;
  onView: (quote: Quote) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{quote.product_title || quote.title}</div>
        {quote.quantity && (
          <div className="text-sm text-gray-500">Qty: {quote.quantity}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-900">{quote.customer_name || 'N/A'}</div>
        <div className="text-sm text-gray-500">{quote.customer_email}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(quote.created_at || quote.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[quote.status] || 'bg-gray-100'}`}>
          {quote.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onView(quote)}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          View
        </button>
      </td>
    </tr>
  );
});

// Quote detail modal - lazy loaded
const QuoteDetailModal = memo(function QuoteDetailModal({
  quote,
  onClose,
  onStatusUpdate,
  isUpdating,
}: {
  quote: Quote;
  onClose: () => void;
  onStatusUpdate: (status: Quote['status']) => void;
  isUpdating: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b sticky top-0 bg-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Quote Request</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Product</label>
            <div className="font-medium text-gray-900">{quote.product_title || quote.title}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer</label>
              <div className="text-gray-900">{quote.customer_name || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="text-gray-900">{quote.customer_email}</div>
            </div>
          </div>

          {quote.customer_phone && (
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <div>{quote.customer_phone}</div>
            </div>
          )}

          {quote.quantity && (
            <div>
              <label className="text-sm font-medium text-gray-500">Quantity</label>
              <div>{quote.quantity}</div>
            </div>
          )}

          {quote.message && (
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <div className="bg-gray-50 p-3 rounded-lg text-gray-700">{quote.message}</div>
            </div>
          )}

          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-gray-500">Update Status</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {quote.status !== 'quoted' && (
                <button
                  onClick={() => onStatusUpdate('quoted')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Mark Quoted'}
                </button>
              )}
              {quote.status !== 'accepted' && (
                <button
                  onClick={() => onStatusUpdate('accepted')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Mark Accepted'}
                </button>
              )}
              {quote.status !== 'declined' && (
                <button
                  onClick={() => onStatusUpdate('declined')}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Mark Declined'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export function QuotesDashboard({ shopId }: QuotesDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'quoted' | 'accepted' | 'declined'>('all');
  const [page, setPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const limit = 20;

  // Convert filter to status array
  const statusFilter = useMemo(() => {
    if (filter === 'all') return undefined;
    return [filter];
  }, [filter]);

  // Fetch quotes with optimized hook
  const {
    quotes,
    total,
    isLoading,
    isValidating,
    pagination,
    mutate,
  } = useOptimizedQuotes({
    shopId,
    status: statusFilter as any,
    page,
    limit,
  });

  // Fetch stats with optimized hook
  const {
    data: stats,
    isLoading: statsLoading,
  } = useOptimizedQuoteStats({
    shopId,
  });

  // Status update mutation
  const { mutate: updateStatus, isLoading: isUpdating } = useOptimizedMutation<Quote, { quoteId: string; status: Quote['status'] }>({
    mutationFn: async ({ quoteId, status }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;
      return data as Quote;
    },
    invalidatePatterns: [/^quotes:/, /^quote-stats:/],
    onSuccess: () => {
      setSelectedQuote(null);
    },
  });

  // Handle status update
  const handleStatusUpdate = useCallback(
    (status: Quote['status']) => {
      if (!selectedQuote) return;
      updateStatus({ quoteId: selectedQuote.id, status });
    },
    [selectedQuote, updateStatus]
  );

  // Handle view quote
  const handleViewQuote = useCallback((quote: Quote) => {
    setSelectedQuote(quote);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedQuote(null);
  }, []);

  // Handle filter change with page reset
  const handleFilterChange = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (pagination.hasNext) setPage((p) => p + 1);
  }, [pagination.hasNext]);

  const handlePrevPage = useCallback(() => {
    if (pagination.hasPrev) setPage((p) => p - 1);
  }, [pagination.hasPrev]);

  // Stats display values
  const statValues = useMemo(
    () => ({
      total: stats?.total || 0,
      pending: stats?.pending || 0,
      quoted: stats?.quoted || 0,
      accepted: stats?.accepted || 0,
    }),
    [stats]
  );

  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Quotes"
          value={statValues.total}
          color="gray"
          loading={statsLoading}
        />
        <StatCard
          title="Pending"
          value={statValues.pending}
          color="yellow"
          loading={statsLoading}
        />
        <StatCard
          title="Quoted"
          value={statValues.quoted}
          color="blue"
          loading={statsLoading}
        />
        <StatCard
          title="Accepted"
          value={statValues.accepted}
          color="green"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'quoted', 'accepted', 'declined'] as const).map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && quotes.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No quotes found. They'll appear here when customers submit requests.</p>
        </div>
      )}

      {/* Quotes Table */}
      {!isLoading && quotes.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <QuoteRow
                      key={quote.id}
                      quote={quote}
                      onView={handleViewQuote}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} quotes
              {isValidating && <span className="ml-2 text-blue-500">• Updating...</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNext}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}

export default QuotesDashboard;
