import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error";
import { PerformanceProvider } from "@/components/PerformanceProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { MonitoringProvider } from "@/components/monitoring/MonitoringProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "QuoteGen - B2B Quote Requests for Shopify",
  description: "Let your B2B customers request quotes in one click. Perfect for wholesale, industrial supplies, and custom orders.",
  keywords: ["shopify", "b2b", "quotes", "wholesale", "ecommerce"],
  authors: [{ name: "QuoteGen" }],
  creator: "QuoteGen",
  publisher: "QuoteGen",
  robots: "index, follow",
  openGraph: {
    title: "QuoteGen - B2B Quote Requests for Shopify",
    description: "Let your B2B customers request quotes in one click",
    type: "website",
    locale: "en_US",
    siteName: "QuoteGen",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuoteGen - B2B Quote Requests for Shopify",
    description: "Let your B2B customers request quotes in one click",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://api.resend.com" />
        <link rel="dns-prefetch" href="https://*.sentry.io" />
      </head>
      <body className={inter.className}>
        <MonitoringProvider>
          <ErrorBoundary componentName="RootLayout">
            <PerformanceProvider>
              {children}
            </PerformanceProvider>
          </ErrorBoundary>
        </MonitoringProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
