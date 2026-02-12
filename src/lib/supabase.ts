import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface Quote {
  id: string;
  shop_id: string;
  product_id: string;
  product_title: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  quantity?: number;
  message?: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  admin_notes?: string;
  quote_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface ShopSettings {
  shop_id: string;
  button_text: string;
  button_color: string;
  form_title: string;
  success_message: string;
  email_notifications: boolean;
  require_quantity: boolean;
  require_phone: boolean;
}

// API Functions
export async function createQuote(quote: {
  shop_id: string;
  product_id: string;
  product_title: string;
  customer_email: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  quantity?: number | null;
  message?: string | null;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
}) {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getQuotes(shopId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateQuoteStatus(
  quoteId: string, 
  status: Quote['status'], 
  adminNotes?: string,
  quoteAmount?: number
) {
  const { data, error } = await supabase
    .from('quotes')
    .update({ 
      status, 
      admin_notes: adminNotes,
      quote_amount: quoteAmount,
      updated_at: new Date().toISOString()
    })
    .eq('id', quoteId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getShopSettings(shopId: string) {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('*')
    .eq('shop_id', shopId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  // Return default settings if none exist
  if (!data) {
    return {
      shop_id: shopId,
      button_text: 'Request Quote',
      button_color: '#008060',
      form_title: 'Request a Quote',
      success_message: 'Thank you! We will get back to you soon.',
      email_notifications: true,
      require_quantity: true,
      require_phone: false,
    } as ShopSettings;
  }
  
  return data;
}

export async function updateShopSettings(settings: ShopSettings) {
  const { data, error } = await supabase
    .from('shop_settings')
    .upsert(settings)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}