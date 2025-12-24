# Architecture Documentation

This document provides a detailed overview of the Fixads Dashboard architecture.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Feature Modules](#feature-modules)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Authentication](#authentication)
- [Routing](#routing)
- [Testing Strategy](#testing-strategy)

## Overview

Fixads Dashboard is a Next.js 16 application using the App Router pattern. It follows a feature-based architecture where code is organized by business domain rather than technical layer.

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Routes    │  │  Features   │  │    Shared       │ │
│  │   (app/)    │  │ (features/) │  │   (shared/)     │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│         └────────────────┼───────────────────┘          │
│                          │                              │
│                 ┌────────▼────────┐                     │
│                 │   UI Library    │                     │
│                 │  (components/)  │                     │
│                 └────────┬────────┘                     │
│                          │                              │
├──────────────────────────┼──────────────────────────────┤
│                 ┌────────▼────────┐                     │
│                 │   API Layer     │                     │
│                 │   (ky client)   │                     │
│                 └────────┬────────┘                     │
└──────────────────────────┼──────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │  Backend API    │
                  │  (fixads-api)   │
                  └─────────────────┘
```

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | UI library with React Compiler |
| TypeScript | 5.x | Type safety |

### Styling & UI

| Technology | Purpose |
|------------|---------|
| Tailwind CSS 4 | Utility-first CSS |
| Radix UI | Headless UI primitives |
| shadcn/ui | Component library |
| Lucide React | Icons |
| Recharts | Data visualization |

### State & Data

| Technology | Purpose |
|------------|---------|
| TanStack Query 5 | Server state management |
| Zustand 5 | Client state management |
| React Hook Form | Form handling |
| Zod 4 | Schema validation |

### HTTP & API

| Technology | Purpose |
|------------|---------|
| ky | HTTP client |
| MSW | API mocking for tests |

### Development

| Technology | Purpose |
|------------|---------|
| Biome | Linting & formatting |
| Vitest | Unit testing |
| Playwright | E2E testing |
| React Testing Library | Component testing |

## Project Structure

```
fixads-dashboard/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── (dashboard)/         # Protected route group
│   │   │   ├── accounts/
│   │   │   ├── campaigns/
│   │   │   ├── optimizer/
│   │   │   └── ...
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── charts/              # Chart components
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── features/                # Feature modules
│   │   ├── accounts/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── change-history/
│   │   ├── conversions/
│   │   ├── experimentation/
│   │   ├── optimizer/
│   │   ├── recommendations/
│   │   └── search-terms/
│   │
│   ├── shared/                  # Shared code
│   │   ├── api/                 # HTTP client
│   │   ├── hooks/               # Common hooks
│   │   ├── lib/                 # Utilities
│   │   ├── providers/           # React providers
│   │   └── types/               # Global types
│   │
│   └── hooks/                   # Global hooks
│
├── tests/                       # Test files
│   ├── features/
│   ├── shared/
│   ├── e2e/
│   └── utils/
│
├── public/                      # Static assets
└── docs/                        # Documentation
```

## Feature Modules

Each feature is a self-contained module with its own:

```
features/[feature-name]/
├── api/                    # API client functions
│   └── [feature]-api.ts
├── components/             # React components
│   ├── [component].tsx
│   └── index.ts
├── hooks/                  # React Query hooks
│   ├── use-[feature].ts
│   └── index.ts
├── stores/                 # Zustand stores (optional)
│   └── [feature]-store.ts
├── types/                  # TypeScript types
│   └── index.ts
├── schemas/                # Zod schemas (optional)
│   └── [feature]-schemas.ts
└── index.ts               # Public exports
```

### Feature Module Guidelines

1. **Single Responsibility** - Each feature handles one business domain
2. **Encapsulation** - Internal implementation is private
3. **Clear API** - Export only what's needed via `index.ts`
4. **No Cross-Feature Imports** - Features should not import from each other directly

### Example: Campaigns Feature

```typescript
// features/campaigns/index.ts
export { CampaignList, CampaignCard } from "./components";
export { useCampaigns, useCampaign, useCampaignMetrics } from "./hooks";
export type { Campaign, CampaignStatus, CampaignFilters } from "./types";
```

## State Management

### Server State (TanStack Query)

Used for all data fetched from the API:

```typescript
// Query keys centralized in shared/lib/constants.ts
export const QUERY_KEYS = {
  CAMPAIGNS: {
    all: ["campaigns"] as const,
    list: (accountId: string) => [...QUERY_KEYS.CAMPAIGNS.all, accountId] as const,
    detail: (id: string) => [...QUERY_KEYS.CAMPAIGNS.all, id] as const,
  },
};

// Hook implementation
export function useCampaigns(accountId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGNS.list(accountId),
    queryFn: () => campaignsApi.getCampaigns(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Client State (Zustand)

Used for authentication and global UI state:

```typescript
// features/auth/stores/auth-store.ts
interface AuthState {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: TokenPair) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" }
  )
);
```

### Form State (React Hook Form + Zod)

```typescript
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  budget: z.number().positive("Budget must be positive"),
});

type FormData = z.infer<typeof schema>;

function CampaignForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* form fields */}
      </form>
    </Form>
  );
}
```

## API Layer

### HTTP Client Architecture

```
┌─────────────────────────────────────────┐
│              ky Client                  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │      Circuit Breaker            │   │
│  │  (failure detection/recovery)   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │      Request Interceptor        │   │
│  │  (JWT injection)                │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │      Response Interceptor       │   │
│  │  (token refresh on 401)         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Circuit Breaker

Prevents cascading failures when the API is unavailable:

```typescript
// shared/lib/circuit-breaker.ts
class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private lastFailureTime?: number;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.shouldAttemptReset()) {
        this.state = "HALF_OPEN";
      } else {
        throw new CircuitBreakerOpenError();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### Token Refresh

Mutex-based token refresh to handle concurrent requests:

```typescript
// shared/api/client.ts
let refreshPromise: Promise<TokenPair> | null = null;

async function refreshTokens(): Promise<TokenPair> {
  if (refreshPromise) {
    return refreshPromise; // Return existing promise for concurrent requests
  }

  refreshPromise = authApi.refreshToken(currentTokens.refresh_token);

  try {
    const newTokens = await refreshPromise;
    authStore.setTokens(newTokens);
    return newTokens;
  } finally {
    refreshPromise = null;
  }
}
```

## Authentication

### OAuth Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│  Google  │────▶│ Callback │────▶│ Backend  │
│  Page    │     │  OAuth   │     │  Page    │     │ Exchange │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
                                                        ▼
                                                  ┌──────────┐
                                                  │   JWT    │
                                                  │  Tokens  │
                                                  └────┬─────┘
                                                        │
                                                        ▼
                                                  ┌──────────┐
                                                  │ Dashboard│
                                                  └──────────┘
```

### Token Storage

Tokens are stored in Zustand with localStorage persistence:

```typescript
// Access token: Short-lived, used for API requests
// Refresh token: Long-lived, used to get new access tokens

interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
```

### Route Protection

Dashboard routes are protected by `AuthGuard`:

```typescript
// components/auth/auth-guard.tsx
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingSkeleton />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

## Routing

### Route Groups

```
app/
├── (auth)/                 # Public routes
│   ├── login/
│   │   └── page.tsx
│   └── callback/
│       └── page.tsx
│
├── (dashboard)/           # Protected routes
│   ├── layout.tsx         # Includes AuthGuard
│   ├── page.tsx           # Dashboard home
│   ├── accounts/
│   ├── campaigns/
│   │   ├── page.tsx       # Campaign list
│   │   └── [campaignId]/
│   │       └── page.tsx   # Campaign detail
│   └── ...
│
└── layout.tsx             # Root layout with providers
```

### Dynamic Routes

Campaign detail page with dynamic `campaignId`:

```typescript
// app/(dashboard)/campaigns/[campaignId]/page.tsx
interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignPage({ params }: PageProps) {
  const { campaignId } = await params;
  return <CampaignDetail id={campaignId} />;
}
```

## Testing Strategy

### Test Pyramid

```
        ┌───────┐
        │  E2E  │  ← Few, critical user journeys
        ├───────┤
        │ Integ │  ← Component + API integration
        ├───────┤
        │ Unit  │  ← Many, fast, isolated
        └───────┘
```

### Unit Tests

Focus on hooks, utilities, and type helpers:

```typescript
// tests/features/campaigns/hooks/use-campaigns.test.tsx
describe("useCampaigns", () => {
  it("fetches campaigns for account", async () => {
    server.use(
      http.get("*/campaigns", () =>
        HttpResponse.json({ campaigns: mockCampaigns })
      )
    );

    const { result } = renderHook(
      () => useCampaigns("account-1"),
      { wrapper: TestWrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });
});
```

### E2E Tests

Test critical user flows:

```typescript
// tests/e2e/auth.spec.ts
test("user can login and view dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.click("button:has-text('Sign in with Google')");
  // ... OAuth flow mocked
  await expect(page).toHaveURL("/");
  await expect(page.locator("h1")).toContainText("Dashboard");
});
```

### MSW Handlers

```typescript
// tests/utils/mocks/handlers.ts
export const handlers = [
  http.get("*/campaigns", () => {
    return HttpResponse.json({ campaigns: [] });
  }),

  http.post("*/auth/login", () => {
    return HttpResponse.json({
      user: mockUser,
      tokens: mockTokens,
    });
  }),
];
```

---

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
