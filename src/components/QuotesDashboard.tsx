'use client';

import { useState, useEffect } from 'react';
import { Quote, getQuotes, updateQuoteStatus } from '@/lib/supabase';

interface QuotesDashboardProps {
  shopId: string;
}

export function QuotesDashboard({ shopId }: QuotesDashboardProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'quoted' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    loadQuotes();
  }, [shopId]);

  async function loadQuotes() {
    try {
      const data = await getQuotes(shopId);
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredQuotes = filter === 'all' 
    ? quotes 
    : quotes.filter(q => q.status === filter);

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    quoted: quotes.filter(q => q.status === 'quoted').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
  };

  async function handleStatusUpdate(quoteId: string, status: Quote['status']) {
    try {
      await updateQuoteStatus(quoteId, status);
      await loadQuotes();
      setSelectedQuote(null);
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading quotes...</div>;
  }

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Quotes</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.quoted}</div>
          <div className="text-sm text-gray-500">Quoted</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div className="text-sm text-gray-500">Accepted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'quoted', 'accepted', 'declined'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Quotes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No quotes found. They'll appear here when customers submit requests.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{quote.product_title}</div>
                    {quote.quantity && (
                      <div className="text-sm text-gray-500">Qty: {quote.quantity}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>{quote.customer_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{quote.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      quote.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                      quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Quote Request</h3>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Product</label>
                <div className="font-medium">{selectedQuote.product_title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <div>{selectedQuote.customer_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div>{selectedQuote.customer_email}</div>
                </div>
              </div>

              {selectedQuote.customer_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div>{selectedQuote.customer_phone}</div>
                </div>
              )}

              {selectedQuote.quantity && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <div>{selectedQuote.quantity}</div>
                </div>
              )}

              {selectedQuote.message && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <div className="bg-gray-50 p-3 rounded">{selectedQuote.message}</div>
                </div>
              )}

              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-500">Update Status</label>
                <div className="flex gap-2 mt-2">
                  {selectedQuote.status !== 'quoted' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedQuote.id, 'quoted')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Mark Quoted
                    </button>
                  )}
                  {selectedQuote.status !== 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedQuote.id, 'accepted')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark Accepted
                    </button>
                  )}
                  {selectedQuote.status !== 'declined' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedQuote.id, 'declined')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Mark Declined
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}