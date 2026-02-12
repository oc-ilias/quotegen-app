/**
 * Customer Quotes API Route
 * GET /api/customers/[id]/quotes - Get all quotes for a customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ApiResponse, Quote, QuoteStatus } from '@/types/quote';

// Initialize Supabase client lazily to avoid build-time errors
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not configured');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

// ============================================================================
// GET Handler - Get Customer Quotes
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'MISSING_ID',
          message: 'Customer ID is required',
        },
      }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
    const offset = (page - 1) * limit;
    
    // Filters
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minValue = searchParams.get('minValue');
    const maxValue = searchParams.get('maxValue');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Check if customer exists
    const { data: customerData, error: customerError } = await getSupabaseClient()
      .from('customers')
      .select('id, companyName, contactName')
      .eq('id', id)
      .single();
    
    if (customerError || !customerData) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found',
        },
      }, { status: 404 });
    }
    
    const customer = customerData as { id: string; companyName: string; contactName: string };
    
    // Build query
    let query = getSupabaseClient()
      .from('quotes')
      .select('*', { count: 'exact' })
      .eq('customerId', id);
    
    // Apply filters
    if (status?.length) {
      query = query.in('status', status);
    }
    
    if (dateFrom) {
      query = query.gte('createdAt', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('createdAt', dateTo);
    }
    
    if (minValue) {
      query = query.gte('total', parseFloat(minValue));
    }
    
    if (maxValue) {
      query = query.lte('total', parseFloat(maxValue));
    }
    
    // Apply sorting
    const sortColumnMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      total: 'total',
      status: 'status',
      title: 'title',
    };
    
    const sortColumn = sortColumnMap[sortBy] || 'createdAt';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: quotes, error, count } = await query;
    
    if (error) {
      console.error('Error fetching customer quotes:', error);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch customer quotes',
        },
      }, { status: 500 });
    }
    
    // Format quotes for response
    const formattedQuotes = ((quotes || []) as Array<{
      id: string;
      quoteNumber: string;
      title: string;
      status: string;
      total: number;
      createdAt: string;
      updatedAt: string;
    }>).map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      status: quote.status,
      total: quote.total,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    }));
    
    const totalPages = Math.ceil((count || 0) / limit);
    
    return NextResponse.json<ApiResponse<{
      customer: {
        id: string;
        companyName: string;
        contactName: string;
      };
      quotes: typeof formattedQuotes;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>({
      success: true,
      data: {
        customer: {
          id: customer.id,
          companyName: customer.companyName,
          contactName: customer.contactName,
        },
        quotes: formattedQuotes,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      },
    });
    
  } catch (error) {
    console.error('Unexpected error in GET /api/customers/[id]/quotes:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 });
  }
}
