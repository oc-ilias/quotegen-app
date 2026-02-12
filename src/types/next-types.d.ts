/**
 * Type declarations for Next.js internal modules
 * Fixes build errors for missing type declarations
 */

// Main Next.js modules
declare module 'next/types.js' {
  export * from 'next/types';
}

declare module 'next/server.js' {
  export * from 'next/server';
}

declare module 'next/server' {
  import { NextRequest, NextResponse } from 'next';
  export { NextRequest, NextResponse };
  
  export type ResolvingMetadata = {
    icons: any;
    manifest: any;
    openGraph: any;
    twitter: any;
    appleWebApp: any;
    alternates: any;
    formatDetection: any;
    itunes: any;
    facebook: any;
    bookmarks: any;
    verification: any;
    themeColor: any;
    colorScheme: any;
    viewport: any;
    creator: any;
    publisher: any;
    robots: any;
    archives: any;
    assets: any;
    category: any;
    classification: any;
    other: any;
    metadataBase: any;
    title: any;
    description: any;
    keywords: any;
    authors: any;
    generator: any;
    applicationName: any;
    referrer: any;
  };
  
  export type ResolvingViewport = {
    width: any;
    height: any;
    initialScale: any;
    minimumScale: any;
    maximumScale: any;
    userScalable: any;
    viewportFit: any;
    interactiveWidget: any;
    themeColor: any;
    colorScheme: any;
  };
}

declare module 'next' {
  import { ReactElement, ReactNode } from 'react';
  import { NextPage as NextPageType } from 'next/types';
  
  export type NextPage<P = {}, IP = P> = NextPageType<P, IP>;
  
  export type GetStaticProps<T = any> = (context: any) => Promise<{ props: T }> | { props: T };
  export type GetServerSideProps<T = any> = (context: any) => Promise<{ props: T }> | { props: T };
  
  export interface AppProps {
    Component: NextPage;
    pageProps: any;
    router: any;
  }
}

// Extend Next.js config types
declare module 'next/dist/server/next.js' {
  const NextServer: any;
  export default NextServer;
}
