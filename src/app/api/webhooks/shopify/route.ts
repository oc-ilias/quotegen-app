// Shopify OAuth and webhook handlers
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Verify Shopify webhook signature
export function verifyShopifyWebhook(rawBody: string, hmacHeader: string): boolean {
  if (!SHOPIFY_API_SECRET) {
    console.error('SHOPIFY_API_SECRET not set');
    return false;
  }
  
  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(generatedHash),
    Buffer.from(hmacHeader)
  );
}

// Verify Shopify OAuth
export async function verifyShopifyAuth(shop: string, code: string) {
  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get access token');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Shopify auth error:', error);
    throw error;
  }
}

// Generate install URL
export function generateInstallUrl(shop: string): string {
  const scopes = 'read_products,write_products,read_orders,read_customers';
  const redirectUri = `${APP_URL}/api/auth/callback`;
  const nonce = crypto.randomBytes(16).toString('hex');
  
  return `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${nonce}`;
}

// POST /api/webhooks/shopify - Handle Shopify webhooks
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256') || '';
    const topic = request.headers.get('X-Shopify-Topic') || '';
    const shop = request.headers.get('X-Shopify-Shop-Domain') || '';
    
    // Verify webhook signature
    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const data = JSON.parse(rawBody);
    
    // Handle different webhook topics
    switch (topic) {
      case 'app/uninstalled':
        // Handle app uninstall
        console.log(`App uninstalled from ${shop}`);
        // TODO: Clean up shop data
        break;
        
      case 'products/create':
      case 'products/update':
        // Handle product changes
        console.log(`Product ${topic} in ${shop}:`, data.id);
        break;
        
      case 'orders/create':
        // Handle new orders
        console.log(`New order in ${shop}:`, data.id);
        break;
        
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// GET /api/auth - Start OAuth flow
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter required' }, { status: 400 });
  }
  
  // Validate shop format
  if (!shop.endsWith('.myshopify.com')) {
    return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
  }
  
  const installUrl = generateInstallUrl(shop);
  return NextResponse.redirect(installUrl);
}