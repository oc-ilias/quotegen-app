import '@testing-library/jest-dom';

// ============================================================================
// Web API Polyfills for Next.js API Route Testing
// ============================================================================

// Mock Request/Response for Next.js API routes
class MockRequest {
  url: string;
  method: string;
  headers: Headers;
  body: any;

  constructor(input: string | Request, init?: RequestInit) {
    if (typeof input === 'string') {
      this.url = input;
    } else {
      this.url = input.url;
    }
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body || null;
  }

  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }

  text() {
    return Promise.resolve(String(this.body || ''));
  }
}

class MockResponse {
  status: number;
  statusText: string;
  headers: Headers;
  body: any;

  constructor(body?: any, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || '';
    this.headers = new Headers(init?.headers);
  }

  json() {
    return Promise.resolve(this.body);
  }

  text() {
    return Promise.resolve(String(this.body || ''));
  }

  // Static method for NextResponse.json compatibility
  static json(body: any, init?: ResponseInit) {
    return new MockResponse(body, init);
  }
}

// @ts-ignore
global.Request = MockRequest;
// @ts-ignore
global.Response = MockResponse;

// ============================================================================
// Next.js Server Mocks
// ============================================================================

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: any, init?: ResponseInit) => {
      return {
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: async () => body,
        text: async () => JSON.stringify(body),
      };
    }),
    redirect: jest.fn((url: string) => ({
      status: 307,
      headers: new Headers({ Location: url }),
    })),
    next: jest.fn(() => ({ status: 200 })),
  },
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    headers: Headers;
    nextUrl: URL;
    body: any;

    constructor(input: string | Request, init?: RequestInit) {
      if (typeof input === 'string') {
        this.url = input;
        this.nextUrl = new URL(input);
      } else {
        this.url = input.url;
        this.nextUrl = new URL(input.url);
      }
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body || null;
    }

    json() {
      return Promise.resolve(JSON.parse(this.body || '{}'));
    }

    text() {
      return Promise.resolve(String(this.body || ''));
    }
  },
}));

// ============================================================================
// Next.js Navigation Mocks (Router)
// ============================================================================

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => mockSearchParams,
  redirect: jest.fn((url: string) => {
    throw new Error(`Redirecting to ${url}`);
  }),
}));

// ============================================================================
// Environment Variables
// ============================================================================

// Set required environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// ============================================================================
// Window API Mocks
// ============================================================================

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// ============================================================================
// Framer Motion Mock (simplified for tests)
// ============================================================================

// Helper to filter out motion-specific props
const filterMotionProps = (props: any) => {
  const {
    initial, animate, exit, transition, whileHover, whileTap, whileFocus,
    whileInView, variants, style, ...rest
  } = props;
  return rest;
};

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <div {...filtered}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <button {...filtered}>{children}</button>;
    },
    span: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <span {...filtered}>{children}</span>;
    },
    nav: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <nav {...filtered}>{children}</nav>;
    },
    aside: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <aside {...filtered}>{children}</aside>;
    },
    main: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <main {...filtered}>{children}</main>;
    },
    header: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <header {...filtered}>{children}</header>;
    },
    section: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <section {...filtered}>{children}</section>;
    },
    article: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <article {...filtered}>{children}</article>;
    },
    ul: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <ul {...filtered}>{children}</ul>;
    },
    li: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <li {...filtered}>{children}</li>;
    },
    a: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <a {...filtered}>{children}</a>;
    },
    form: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <form {...filtered}>{children}</form>;
    },
    input: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <input {...filtered}>{children}</input>;
    },
    select: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <select {...filtered}>{children}</select>;
    },
    option: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <option {...filtered}>{children}</option>;
    },
    label: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <label {...filtered}>{children}</label>;
    },
    p: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <p {...filtered}>{children}</p>;
    },
    h1: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <h1 {...filtered}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <h2 {...filtered}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <h3 {...filtered}>{children}</h3>;
    },
    h4: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <h4 {...filtered}>{children}</h4>;
    },
    h5: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <h5 {...filtered}>{children}</h5>;
    },
    h6: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <h6 {...filtered}>{children}</h6>;
    },
    svg: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <svg {...filtered}>{children}</svg>;
    },
    path: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <path {...filtered}>{children}</path>;
    },
    circle: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <circle {...filtered}>{children}</circle>;
    },
    rect: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <rect {...filtered}>{children}</rect>;
    },
    line: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <line {...filtered}>{children}</line>;
    },
    polyline: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <polyline {...filtered}>{children}</polyline>;
    },
    polygon: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <polygon {...filtered}>{children}</polygon>;
    },
    g: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <g {...filtered}>{children}</g>;
    },
    defs: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <defs {...filtered}>{children}</defs>;
    },
    clipPath: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <clipPath {...filtered}>{children}</clipPath>;
    },
    mask: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <mask {...filtered}>{children}</mask>;
    },
    pattern: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <pattern {...filtered}>{children}</pattern>;
    },
    image: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <image {...filtered}>{children}</image>;
    },
    text: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <text {...filtered}>{children}</text>;
    },
    tspan: ({ children, ...props }: any) => {
      const filtered = filterMotionProps(props);
      return <tspan {...filtered}>{children}</tspan>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => false,
  useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
  useTransform: () => ({ get: () => 0 }),
  useSpring: () => ({ get: () => 0 }),
}));

// ============================================================================
// Supabase Mock - FIXED CHAIN
// ============================================================================

// Helper to create a mock Supabase query builder with proper chaining
const createMockQueryBuilder = (returnValue: any = { data: null, error: null }) => {
  const mockQueryBuilder: any = {
    select: jest.fn(() => mockQueryBuilder),
    insert: jest.fn(() => mockQueryBuilder),
    update: jest.fn(() => mockQueryBuilder),
    delete: jest.fn(() => mockQueryBuilder),
    upsert: jest.fn(() => mockQueryBuilder),
    eq: jest.fn(() => mockQueryBuilder),
    neq: jest.fn(() => mockQueryBuilder),
    gt: jest.fn(() => mockQueryBuilder),
    gte: jest.fn(() => mockQueryBuilder),
    lt: jest.fn(() => mockQueryBuilder),
    lte: jest.fn(() => mockQueryBuilder),
    like: jest.fn(() => mockQueryBuilder),
    ilike: jest.fn(() => mockQueryBuilder),
    is: jest.fn(() => mockQueryBuilder),
    in: jest.fn(() => mockQueryBuilder),
    contains: jest.fn(() => mockQueryBuilder),
    containedBy: jest.fn(() => mockQueryBuilder),
    overlaps: jest.fn(() => mockQueryBuilder),
    order: jest.fn(() => mockQueryBuilder),
    limit: jest.fn(() => mockQueryBuilder),
    range: jest.fn(() => mockQueryBuilder),
    single: jest.fn().mockResolvedValue(returnValue),
    maybeSingle: jest.fn().mockResolvedValue(returnValue),
    // For terminating methods that return data
    then: jest.fn((callback) => Promise.resolve(returnValue).then(callback)),
  };
  return mockQueryBuilder;
};

// Mock for single insert (returns array)
const createMockInsertBuilder = (returnValue: any = { data: null, error: null }) => {
  const builder = createMockQueryBuilder(returnValue);
  // Insert returns the data differently
  builder.then = jest.fn((callback) => Promise.resolve(returnValue).then(callback));
  return builder;
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      const defaultReturn = { data: null, error: null };
      
      // Return different mock builders based on expected usage
      return {
        select: jest.fn((columns?: string) => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue(defaultReturn),
            maybeSingle: jest.fn().mockResolvedValue(defaultReturn),
            order: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue(defaultReturn),
            })),
          })),
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue(defaultReturn),
          })),
          single: jest.fn().mockResolvedValue(defaultReturn),
          maybeSingle: jest.fn().mockResolvedValue(defaultReturn),
        })),
        insert: jest.fn((data: any) => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] : data, error: null }),
          })),
          then: jest.fn((callback) => Promise.resolve({ data, error: null }).then(callback)),
        })),
        update: jest.fn((data: any) => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data, error: null }),
            })),
            single: jest.fn().mockResolvedValue({ data, error: null }),
            then: jest.fn((callback) => Promise.resolve({ data, error: null }).then(callback)),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
        eq: jest.fn(() => createMockQueryBuilder()),
      };
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithOAuth: jest.fn().mockResolvedValue({ data: null, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// ============================================================================
// Console Suppression
// ============================================================================

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    if (/Error: Not implemented: navigation/.test(args[0]?.message || args[0])) {
      return;
    }
    if (/React does not recognize/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('React does not recognize')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ============================================================================
// Global Test Utilities
// ============================================================================

// Helper to reset all mocks between tests
global.beforeEach(() => {
  jest.clearAllMocks();
});
