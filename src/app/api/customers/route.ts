/**
 * Customers API Routes
 * GET /api/customers - List customers with filtering and pagination
 * POST /api/customers - Create a new customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { ApiResponse, Customer, CustomerWithStats, CustomerStats, CustomerActivity } from '@/types/quote';
import { CustomerStatus } from '@/types/quote';

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
// Validation Schema
// ============================================================================

const customerSchema = z.object({
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactName: z.string().min(1, 'Contact name is required').max(200),
  phone: z.string().optional(),
  billingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  taxId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

// ============================================================================
// GET Handler - List Customers
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
    const offset = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search');
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minQuotes = searchParams.get('minQuotes');
    const maxQuotes = searchParams.get('maxQuotes');
    const minRevenue = searchParams.get('minRevenue');
    const maxRevenue = searchParams.get('maxRevenue');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'dateAdded';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Build base query
    const supabaseClient = getSupabaseClient();
    let query = supabaseClient
      .from('customers')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (search) {
      query = query.or(`companyName.ilike.%${search}%,contactName.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (status?.length) {
      query = query.in('status', status);
    }
    
    if (tags?.length) {
      // Use overlap operator for array intersection
      query = query.overlaps('tags', tags);
    }
    
    if (dateFrom) {
      query = query.gte('createdAt', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('createdAt', dateTo);
    }
    
    // Apply sorting
    const sortColumnMap: Record<string, string> = {
      name: 'contactName',
      company: 'companyName',
      dateAdded: 'createdAt',
      totalQuotes: 'quotesCount',
      totalRevenue: 'totalRevenue',
      lastActivity: 'updatedAt',
    };
    
    const sortColumn = sortColumnMap[sortBy] || 'createdAt';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: customers, error, count } = await query as { data: any[] | null; error: any; count: number | null };
    
    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch customers',
        },
      }, { status: 500 });
    }
    
    // Get stats for each customer
    const customerIds = customers?.map((c: any) => c.id) || [];
    const { data: statsData } = await (getSupabaseClient()
      .from('quotes') as any)
      .select('customerId, status, total, createdAt')
      .in('customerId', customerIds);
    
    // Calculate stats for each customer
    const customersWithStats: CustomerWithStats[] = (customers || []).map((customer): CustomerWithStats => {
      const customerQuotes = (statsData as any[])?.filter((q: any) => q.customerId === (customer as any).id) || [];
      const acceptedQuotes = customerQuotes.filter(q => q.status === 'accepted');
      const declinedQuotes = customerQuotes.filter(q => q.status === 'declined');
      const pendingQuotes = customerQuotes.filter(q => ['draft', 'pending', 'sent'].includes(q.status));
      
      const totalRevenue = acceptedQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
      const avgQuoteValue = customerQuotes.length > 0 
        ? customerQuotes.reduce((sum, q) => sum + (q.total || 0), 0) / customerQuotes.length 
        : 0;
      
      const conversionRate = customerQuotes.length > 0
        ? (acceptedQuotes.length / customerQuotes.length) * 100
        : 0;
      
      const sortedQuotes = [...customerQuotes].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const stats: CustomerStats = {
        totalQuotes: customerQuotes.length,
        totalRevenue,
        avgQuoteValue,
        acceptedQuotes: acceptedQuotes.length,
        declinedQuotes: declinedQuotes.length,
        pendingQuotes: pendingQuotes.length,
        conversionRate,
        lastQuoteDate: sortedQuotes[0] ? new Date(sortedQuotes[0].createdAt) : undefined,
        firstQuoteDate: sortedQuotes[sortedQuotes.length - 1] ? new Date(sortedQuotes[sortedQuotes.length - 1].createdAt) : undefined,
      };
      
      return {
        ...customer,
        customerSince: new Date(customer.customerSince || customer.createdAt),
        createdAt: new Date(customer.createdAt),
        updatedAt: new Date(customer.updatedAt),
        stats,
        recentActivity: [], // Will be fetched separately if needed
        quotesCount: customerQuotes.length,
      };
    });
    
    // Filter by quote count and revenue if specified
    let filteredCustomers = customersWithStats;
    
    if (minQuotes) {
      filteredCustomers = filteredCustomers.filter(c => c.stats.totalQuotes >= parseInt(minQuotes, 10));
    }
    
    if (maxQuotes) {
      filteredCustomers = filteredCustomers.filter(c => c.stats.totalQuotes <= parseInt(maxQuotes, 10));
    }
    
    if (minRevenue) {
      filteredCustomers = filteredCustomers.filter(c => c.stats.totalRevenue >= parseFloat(minRevenue));
    }
    
    if (maxRevenue) {
      filteredCustomers = filteredCustomers.filter(c => c.stats.totalRevenue <= parseFloat(maxRevenue));
    }
    
    const totalPages = Math.ceil((count || 0) / limit);
    
    return NextResponse.json<ApiResponse<{
      customers: CustomerWithStats[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>({
      success: true,
      data: {
        customers: filteredCustomers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      },
    });
    
  } catch (error) {
    console.error('Unexpected error in GET /api/customers:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 });
  }
}

// ============================================================================
// POST Handler - Create Customer
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = customerSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid customer data',
          details: errors,
        },
      }, { status: 400 });
    }
    
    const data = validationResult.data;
    
    // Check for duplicate email
    const { data: existingCustomer } = await getSupabaseClient()
      .from('customers')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();
    
    if (existingCustomer) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'A customer with this email already exists',
        },
      }, { status: 409 });
    }
    
    // Create customer
    const now = new Date().toISOString();
    const { data: newCustomer, error } = await (getSupabaseClient()
      .from('customers') as any)
      .insert({
        ...data,
        status: CustomerStatus.ACTIVE,
        customerSince: now,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create customer',
        },
      }, { status: 500 });
    }
    
    // Log activity
    await (getSupabaseClient().from('customerActivity') as any).insert({
      customerId: newCustomer.id,
      type: 'customer_updated',
      description: 'Customer created',
      createdAt: now,
    });
    
    return NextResponse.json<ApiResponse<Customer>>({
      success: true,
      data: {
        ...newCustomer,
        customerSince: new Date(newCustomer.customerSince),
        createdAt: new Date(newCustomer.createdAt),
        updatedAt: new Date(newCustomer.updatedAt),
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Unexpected error in POST /api/customers:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 });
  }
}
