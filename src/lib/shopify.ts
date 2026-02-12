// Shopify OAuth and webhook utility functions
import crypto from 'crypto';

// Helper functions to get env vars at runtime (for testability)
const getShopifyApiKey = () => process.env.SHOPIFY_API_KEY;
const getShopifyApiSecret = () => process.env.SHOPIFY_API_SECRET;
const getAppUrl = () => process.env.NEXT_PUBLIC_APP_URL;

/**
 * Verify Shopify webhook signature
 * @param rawBody - Raw request body
 * @param hmacHeader - HMAC signature from header
 * @returns Whether the signature is valid
 */
export function verifyShopifyWebhook(rawBody: string, hmacHeader: string): boolean {
  const SHOPIFY_API_SECRET = getShopifyApiSecret();
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

/**
 * Verify Shopify OAuth and get access token
 * @param shop - Shop domain
 * @param code - OAuth authorization code
 * @returns Access token response
 */
export async function verifyShopifyAuth(shop: string, code: string): Promise<{
  access_token: string;
  scope: string;
}> {
  const SHOPIFY_API_KEY = getShopifyApiKey();
  const SHOPIFY_API_SECRET = getShopifyApiSecret();

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

/**
 * Generate Shopify app install URL
 * @param shop - Shop domain
 * @returns Install URL for OAuth flow
 */
export function generateInstallUrl(shop: string): string {
  const SHOPIFY_API_KEY = getShopifyApiKey();
  const APP_URL = getAppUrl();
  const scopes = 'read_products,write_products,read_orders,read_customers';
  const redirectUri = `${APP_URL}/api/auth/callback`;
  const nonce = crypto.randomBytes(16).toString('hex');

  return `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${nonce}`;
}

/**
 * Validate Shopify shop domain format
 * @param shop - Shop domain to validate
 * @returns Whether the domain is valid
 */
export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/.test(shop);
}

/**
 * Generate Shopify GraphQL Admin API URL
 * @param shop - Shop domain
 * @returns GraphQL endpoint URL
 */
export function getShopifyGraphqlUrl(shop: string): string {
  return `https://${shop}/admin/api/2024-01/graphql.json`;
}

/**
 * Create Shopify REST Admin API URL
 * @param shop - Shop domain
 * @param endpoint - API endpoint path
 * @returns Full API URL
 */
export function getShopifyRestUrl(shop: string, endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `https://${shop}/admin/api/2024-01/${cleanEndpoint}`;
}
