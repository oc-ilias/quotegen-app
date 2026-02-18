import type { Metadata, Viewport } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

// Optimize font loading with display swap to prevent FOIT (Flash of Invisible Text)
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  adjustFontFallback: true, // Use optimized fallback font
});

export const metadata: Metadata = {
  title: "QuoteGen - B2B Quote Requests for Shopify",
  description: "Let your B2B customers request quotes in one click. Perfect for wholesale, industrial supplies, and custom orders.",
  keywords: ["shopify", "b2b", "quotes", "wholesale", "ecommerce"],
  authors: [{ name: "QuoteGen" }],
  metadataBase: new URL('https://quotegen.app'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "QuoteGen - B2B Quote Requests for Shopify",
    description: "Let your B2B customers request quotes in one click",
    type: "website",
    locale: 'en_US',
    siteName: 'QuoteGen',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuoteGen - B2B Quote Requests for Shopify',
    description: 'Streamline your B2B sales process with instant quote requests',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QuoteGen',
  },
  applicationName: 'QuoteGen',
  formatDetection: {
    telephone: false,
  },
};

// Separate viewport export for Next.js 14+
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to critical origins for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preconnect to Supabase for API calls */}
        <link rel="preconnect" href="https://*.supabase.co" crossOrigin="anonymous" />
        
        {/* DNS prefetch for non-critical resources */}
        <link rel="dns-prefetch" href="https://api.resend.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
