# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Check code with Biome
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Format code with Biome
pnpm type-check       # TypeScript type checking

# Testing
pnpm test             # Run unit tests (Vitest, watch mode)
pnpm test run         # Run tests once
pnpm test:ui          # Vitest UI
pnpm test:coverage    # Run with coverage (70% threshold)
pnpm test:e2e         # Playwright e2e tests
pnpm test:e2e:ui      # Playwright UI mode

# Pre-commit
pnpm pre-commit       # Run lint + type-check + tests
```

## Architecture

### Project Structure
- **Feature-based architecture** under `src/features/` - each feature has its own api, components, hooks, stores, and types
- **Next.js App Router** with route groups: `(auth)` for login/callback, `(dashboard)` for authenticated pages
- **Shared code** in `src/shared/` - api client, hooks, providers, types, lib utilities
- **UI components** in `src/components/ui/` - Radix-based shadcn/ui components

### Key Features
- `src/features/auth/` - Google OAuth authentication, Zustand store with JWT refresh
- `src/features/accounts/` - Google Ads account connection and management
- `src/features/campaigns/` - PMax campaign viewing with GAQL queries
- `src/features/optimizer/` - Text optimizer (AI suggestions) and Smart optimizer (bad asset detection)

### API Layer
- HTTP client: **ky** with automatic JWT injection and refresh (`src/shared/api/client.ts`)
- State management: **Zustand** for auth, **TanStack Query** for server state
- Auth store uses `getAuthStore()` for non-hook access in API interceptors

### Auth Flow
- Google OAuth callback → backend exchanges code → returns `fixads_token` (JWT pair) + user
- Tokens stored in Zustand with localStorage persistence
- `AuthGuard` component wraps dashboard routes for client-side protection
- 401 responses trigger automatic token refresh or redirect to login

### Environment Variables
```
NEXT_PUBLIC_API_URL          # Backend API base URL
NEXT_PUBLIC_APP_URL          # Frontend URL (for OAuth callbacks)
NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER  # Feature flag
```

## Code Style
- **Biome** for linting/formatting (not ESLint/Prettier)
- Double quotes, semicolons, 2-space indent, 100 char line width
- Import type keyword required (`import type { Foo }`)
- Unused imports/variables are errors

## Testing
- Unit tests: Vitest + React Testing Library + MSW for API mocking
- Test setup in `tests/setup.ts` mocks `next/navigation` and `next-themes`
- MSW handlers in `tests/utils/mocks/handlers.ts`
- E2E tests: Playwright in `tests/e2e/`
