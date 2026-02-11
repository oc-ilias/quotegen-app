import { Suspense, lazy } from 'react';
import { QuoteButton } from '@/components/QuoteButton';
import { SettingsForm } from '@/components/SettingsForm';
import { LoadingFallback, CardLoadingFallback } from '@/components/lazy';

// Lazy load heavy dashboard component
const QuotesDashboard = lazy(() => 
  import('@/components/QuotesDashboard').then(mod => ({ default: mod.QuotesDashboard }))
);

// This would come from Shopify authentication in production
const MOCK_SHOP_ID = 'demo-shop-123';
const MOCK_SETTINGS = {
  button_text: 'Request Quote',
  button_color: '#008060',
  form_title: 'Request a Quote',
  success_message: 'Thank you! We will get back to you soon.',
  require_quantity: true,
  require_phone: false,
};

// Loading skeleton for dashboard
function DashboardSkeleton() {
  return (
    <div className="p-6">
      <CardLoadingFallback count={4} />
      <div className="mt-8 flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📋</div>
            <h1 className="text-xl font-bold">QuoteGen</h1>
          </div>
          <div className="text-sm text-gray-500">
            Demo Mode
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Preview Section */}
        <section className="mb-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Button Preview</h2>
          <div className="border rounded-lg p-8 bg-gray-50">
            <div className="max-w-sm mx-auto text-center">
              <div className="text-lg font-semibold mb-2">Industrial Widget 5000</div>
              <div className="text-gray-500 mb-4">Contact us for pricing</div>
              <QuoteButton
                productId="demo-product"
                productTitle="Industrial Widget 5000"
                shopId={MOCK_SHOP_ID}
                settings={MOCK_SETTINGS}
              />
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="mb-12 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Quote Requests</h2>
          </div>
          <Suspense fallback={<DashboardSkeleton />}>
            <QuotesDashboard shopId={MOCK_SHOP_ID} />
          </Suspense>
        </section>

        {/* Settings Section */}
        <section className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Settings</h2>
          </div>
          <SettingsForm shopId={MOCK_SHOP_ID} />
        </section>
      </main>

      {/* Installation Instructions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Installation Instructions</h3>
          
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Install QuoteGen from the Shopify App Store</li>
            <li>Grant the app permissions to access your products</li>
            <li>Configure your button settings above</li>
            <li>The quote button will automatically appear on selected products</li>
            <li>Manage all quote requests in the dashboard above</li>
          </ol>

          <div className="mt-4 p-4 bg-white rounded text-sm font-mono overflow-x-auto">
            {'{% comment %} Quote Button Code {% endcomment %}'}
            <br />
            {'<div id="quotegen-button"></div>'}
            <br />
            {'<script src="https://your-app-url.com/widget.js"></script>'}
          </div>
        </div>
      </section>
    </div>
  );
}
