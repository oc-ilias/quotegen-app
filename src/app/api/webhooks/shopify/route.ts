// Shopify webhook route handlers
import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook, generateInstallUrl } from '@/lib/shopify';

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
