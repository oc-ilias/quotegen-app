import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuoteGen - B2B Quote Requests for Shopify",
  description: "Let your B2B customers request quotes in one click. Perfect for wholesale, industrial supplies, and custom orders.",
  keywords: ["shopify", "b2b", "quotes", "wholesale", "ecommerce"],
  authors: [{ name: "QuoteGen" }],
  openGraph: {
    title: "QuoteGen - B2B Quote Requests for Shopify",
    description: "Let your B2B customers request quotes in one click",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}