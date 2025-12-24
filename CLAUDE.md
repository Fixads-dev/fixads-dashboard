# CLAUDE.md

> AI Assistant Instructions for Fixads Dashboard

This file provides guidance to Claude Code and other AI assistants when working with this repository.

## Quick Reference

```bash
# Development
pnpm dev              # Start dev server (Turbopack) → http://localhost:3000
pnpm build            # Production build
pnpm start            # Production server

# Quality
pnpm lint             # Biome check
pnpm lint:fix         # Auto-fix
pnpm type-check       # TypeScript

# Testing
pnpm test             # Vitest watch mode
pnpm test run         # Single run
pnpm test:coverage    # With coverage (70% threshold)
pnpm test:e2e         # Playwright E2E

# Pre-commit
pnpm pre-commit       # lint + type-check + tests
```

## Project Overview

**Fixads Dashboard** is a Next.js 16 application for managing Google Ads campaigns with AI-powered optimization.

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Framework (App Router) |
| React | 19.x | UI (with React Compiler) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| TanStack Query | 5.x | Server state |
| Zustand | 5.x | Client state |
| Biome | 2.x | Lint/format |
| Vitest | 4.x | Unit testing |

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public: login, callback
│   ├── (dashboard)/       # Protected: all dashboard pages
│   └── api/               # API routes
├── components/ui/          # shadcn/ui components
├── features/              # Feature modules (see below)
└── shared/                # Shared utilities
    ├── api/               # HTTP client (ky + circuit breaker)
    ├── hooks/             # useDebounce, useLocalStorage, etc.
    ├── lib/               # constants, format utils
    └── providers/         # React context providers
```

### Feature Modules

Each feature is self-contained under `src/features/`:

```
features/[name]/
├── api/           # API client functions
├── components/    # React components
├── hooks/         # React Query hooks
├── stores/        # Zustand stores (if needed)
├── types/         # TypeScript types
├── schemas/       # Zod validation (if needed)
└── index.ts       # Public exports
```

**Available Features:**
- `accounts` - Google Ads account management
- `admin` - Admin panel and user management
- `auth` - Google OAuth, JWT tokens, auth store
- `campaigns` - PMax campaign viewing with GAQL
- `change-history` - Audit logs
- `conversions` - Conversion tracking
- `experimentation` - Multi-Armed Bandit testing
- `optimizer` - Text & Smart optimizers
- `recommendations` - Google Ads recommendations
- `search-terms` - Search term analysis

### Key Patterns

**API Layer:**
```typescript
// Always use apiMethods from shared/api
import { apiMethods } from "@/shared/api";

export const featureApi = {
  getData: (id: string) => apiMethods.get<Response>(`endpoint/${id}`),
};
```

**React Query Hooks:**
```typescript
// Use centralized query keys from shared/lib/constants
import { QUERY_KEYS } from "@/shared/lib/constants";

export function useFeature(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.FEATURE.detail(id),
    queryFn: () => featureApi.getData(id),
    enabled: !!id,
  });
}
```

**Type Exports:**
```typescript
// features/[name]/index.ts
export { Component } from "./components";
export { useHook } from "./hooks";
export type { Type } from "./types";
```

## Auth Flow

```
Login → Google OAuth → Callback → Backend (code exchange) → JWT tokens → Dashboard
```

- Tokens stored in Zustand with localStorage persistence
- `AuthGuard` protects dashboard routes
- 401 responses trigger automatic token refresh
- Use `getAuthStore()` for non-hook access in API interceptors

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080    # Backend API
NEXT_PUBLIC_APP_URL=http://localhost:3000    # Frontend (OAuth)
NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER=true      # Feature flag
```

## Code Style

**Biome Configuration:**
- Double quotes, semicolons
- 2-space indent, 100 char width
- `import type` for type-only imports
- Unused imports/variables are errors

**Naming Conventions:**
- Components: `PascalCase` (`CampaignCard.tsx`)
- Hooks: `camelCase` with `use` prefix (`use-campaigns.ts`)
- Types: `PascalCase` (`Campaign`, `CampaignFilters`)
- Files: `kebab-case` (`campaign-card.tsx`)

## Testing

**Test Location:** Mirror source structure under `tests/`

```
tests/
├── features/[name]/
│   ├── hooks/         # Hook tests (*.test.tsx)
│   ├── types/         # Type helper tests (*.test.ts)
│   └── schemas/       # Schema tests (*.test.ts)
├── shared/
│   ├── api/           # API client tests
│   ├── hooks/         # Shared hook tests
│   └── lib/           # Utility tests
└── utils/mocks/       # MSW handlers
```

**Test Patterns:**
```typescript
// Hook tests with MSW
describe("useFeature", () => {
  it("fetches data", async () => {
    server.use(
      http.get(`${API_URL}/endpoint`, () => HttpResponse.json(mockData))
    );

    const { result } = renderHook(() => useFeature("id"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
```

**Error Status:** Use 501 instead of 500 to avoid ky's automatic retries.

## Common Tasks

### Adding a New Feature

1. Create directory: `src/features/[name]/`
2. Add types in `types/index.ts`
3. Create API client in `api/[name]-api.ts`
4. Build hooks in `hooks/use-[name].ts`
5. Add components in `components/`
6. Export public API in `index.ts`
7. Add tests in `tests/features/[name]/`
8. Add query keys to `shared/lib/constants.ts`

### Adding a New Test

1. Create test file mirroring source location
2. Import from `@/` aliases
3. Use MSW for API mocking
4. Follow existing patterns in similar tests

### Updating Dependencies

```bash
pnpm update [package]
pnpm type-check        # Verify types still work
pnpm test run          # Verify tests pass
```

## Troubleshooting

**Type errors after changes:**
```bash
pnpm type-check
```

**Test failures:**
```bash
pnpm test run --reporter=verbose [file]
```

**Lint issues:**
```bash
pnpm lint:fix
```

**Build errors:**
```bash
rm -rf .next && pnpm build
```
