/**
 * Customer Detail API Routes
 * GET /api/customers/[id] - Get customer details
 * PATCH /api/customers/[id] - Update customer
 * DELETE /api/customers/[id] - Delete customer
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

const updateCustomerSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  companyName: z.string().min(1, 'Company name is required').max(200).optional(),
  contactName: z.string().min(1, 'Contact name is required').max(200).optional(),
  phone: z.string().optional().or(z.literal('')),
  billingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional().or(z.literal(null)),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional().or(z.literal(null)),
  taxId: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

// ============================================================================
// GET Handler - Get Customer Details
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
    
    // Fetch customer
    const { data: customer, error } = await getSupabaseClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json<ApiResponse<never>>({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Customer not found',
          },
        }, { status: 404 });
      }
      
      console.error('Error fetching customer:', error);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch customer',
        },
      }, { status: 500 });
    }
    
    // Fetch customer quotes for stats
    const { data: quotesData } = await getSupabaseClient()
      .from('quotes')
      .select('id, status, total, createdAt')
      .eq('customerId', id)
      .order('createdAt', { ascending: false });
    
    // Type assertion for quotes
    const quotes = (quotesData || []) as Array<{ id: string; status: string; total: number; createdAt: string }>;
    
    // Calculate stats
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
    const declinedQuotes = quotes.filter(q => q.status === 'declined');
    const pendingQuotes = quotes.filter(q => ['draft', 'pending', 'sent'].includes(q.status));
    
    const totalRevenue = acceptedQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
    const avgQuoteValue = quotes.length > 0 
      ? quotes.reduce((sum, q) => sum + (q.total || 0), 0) / quotes.length 
      : 0;
    
    const conversionRate = quotes.length > 0
      ? (acceptedQuotes.length / quotes.length) * 100
      : 0;
    
    const stats: CustomerStats = {
      totalQuotes: quotes?.length || 0,
      totalRevenue,
      avgQuoteValue,
      acceptedQuotes: acceptedQuotes.length,
      declinedQuotes: declinedQuotes.length,
      pendingQuotes: pendingQuotes.length,
      conversionRate,
      lastQuoteDate: quotes[0] ? new Date(quotes[0].createdAt) : undefined,
      firstQuoteDate: quotes[quotes.length - 1] ? new Date(quotes[quotes.length - 1].createdAt) : undefined,
    };
    
    // Fetch recent activity
    const { data: activities } = await getSupabaseClient()
      .from('customerActivity')
      .select('*')
      .eq('customerId', id)
      .order('createdAt', { ascending: false })
      .limit(20);
    
    const recentActivity: CustomerActivity[] = (activities || []).map((activity: any) => ({
      ...activity,
      createdAt: new Date(activity.createdAt),
    }));
    
    const customerWithStats: CustomerWithStats = {
      ...(customer as any),
      customerSince: new Date((customer as any).customerSince || (customer as any).createdAt),
      createdAt: new Date((customer as any).createdAt),
      updatedAt: new Date((customer as any).updatedAt),
      stats,
      recentActivity,
      quotesCount: quotes?.length || 0,
    };
    
    return NextResponse.json<ApiResponse<{ customer: CustomerWithStats }>>({
      success: true,
      data: { customer: customerWithStats },
    });
    
  } catch (error) {
    console.error('Unexpected error in GET /api/customers/[id]:', error);
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
// PATCH Handler - Update Customer
// ============================================================================

export async function PATCH(
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
    
    const body = await request.json();
    
    // Validate input
    const validationResult = updateCustomerSchema.safeParse(body);
    
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
    
    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await getSupabaseClient()
      .from('customers')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingCustomer) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found',
        },
      }, { status: 404 });
    }
    
    // Check for duplicate email if updating email
    if (data.email) {
      const { data: duplicateCustomer } = await getSupabaseClient()
        .from('customers')
        .select('id')
        .eq('email', data.email)
        .neq('id', id)
        .maybeSingle();
      
      if (duplicateCustomer) {
        return NextResponse.json<ApiResponse<never>>({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'A customer with this email already exists',
          },
        }, { status: 409 });
      }
    }
    
    // Update customer
    const updateData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // Remove null values for optional fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === null) delete updateData[key];
    });
    
    const { data: updatedCustomer, error } = await (getSupabaseClient()
      .from('customers') as any)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating customer:', error);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update customer',
        },
      }, { status: 500 });
    }
    
    // Log activity
    await (getSupabaseClient().from('customerActivity') as any).insert({
      customerId: id,
      type: 'customer_updated',
      description: 'Customer information updated',
      metadata: { updatedFields: Object.keys(data) },
      createdAt: new Date().toISOString(),
    });
    
    return NextResponse.json<ApiResponse<Customer>>({
      success: true,
      data: {
        ...updatedCustomer,
        customerSince: new Date(updatedCustomer.customerSince),
        createdAt: new Date(updatedCustomer.createdAt),
        updatedAt: new Date(updatedCustomer.updatedAt),
      },
    });
    
  } catch (error) {
    console.error('Unexpected error in PATCH /api/customers/[id]:', error);
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
// DELETE Handler - Delete Customer
// ============================================================================

export async function DELETE(
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
    
    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await getSupabaseClient()
      .from('customers')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingCustomer) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found',
        },
      }, { status: 404 });
    }
    
    // Check if customer has quotes
    const { data: quotes, error: quotesError } = await getSupabaseClient()
      .from('quotes')
      .select('id')
      .eq('customerId', id)
      .limit(1);
    
    if (quotesError) {
      console.error('Error checking customer quotes:', quotesError);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'CHECK_ERROR',
          message: 'Failed to check customer quotes',
        },
      }, { status: 500 });
    }
    
    if (quotes && quotes.length > 0) {
      // Soft delete - archive the customer instead
      const { error: archiveError } = await (getSupabaseClient()
        .from('customers') as any)
        .update({ 
          status: CustomerStatus.ARCHIVED,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (archiveError) {
        console.error('Error archiving customer:', archiveError);
        return NextResponse.json<ApiResponse<never>>({
          success: false,
          error: {
            code: 'ARCHIVE_ERROR',
            message: 'Failed to archive customer',
          },
        }, { status: 500 });
      }
      
      return NextResponse.json<ApiResponse<{ archived: boolean; message: string }>>({
        success: true,
        data: { archived: true, message: 'Customer has existing quotes and was archived instead of deleted' },
      });
    }
    
    // Hard delete - no quotes exist
    const { error: deleteError } = await getSupabaseClient()
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting customer:', deleteError);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete customer',
        },
      }, { status: 500 });
    }
    
    return NextResponse.json<ApiResponse<{ deleted: boolean }>>({
      success: true,
      data: { deleted: true },
    });
    
  } catch (error) {
    console.error('Unexpected error in DELETE /api/customers/[id]:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 });
  }
}
