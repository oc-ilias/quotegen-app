-- QuoteGen Database Schema
-- Run this in Supabase SQL editor

-- Quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_title TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    quantity INTEGER,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'declined')),
    admin_notes TEXT,
    quote_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_quotes_shop_id ON quotes(shop_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);

-- Settings table for each shop
CREATE TABLE shop_settings (
    shop_id TEXT PRIMARY KEY,
    button_text TEXT DEFAULT 'Request Quote',
    button_color TEXT DEFAULT '#008060',
    form_title TEXT DEFAULT 'Request a Quote',
    success_message TEXT DEFAULT 'Thank you! We will get back to you soon.',
    email_notifications BOOLEAN DEFAULT true,
    require_quantity BOOLEAN DEFAULT true,
    require_phone BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON shop_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Shops can only see their own quotes
CREATE POLICY shop_quotes_policy ON quotes
    FOR ALL
    USING (shop_id = current_setting('app.current_shop_id', true));

-- Policy: Shops can only see their own settings
CREATE POLICY shop_settings_policy ON shop_settings
    FOR ALL
    USING (shop_id = current_setting('app.current_shop_id', true));