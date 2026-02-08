# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                              # Dev server (Turbopack) → http://localhost:3000
pnpm build                            # Production build (standalone output)
pnpm type-check                       # TypeScript verification (npx tsc --noEmit)

# Quality
pnpm lint                             # Biome check
pnpm lint:fix                         # Biome auto-fix
pnpm format                           # Biome format

# Testing
pnpm test run                         # Single test run
pnpm test run tests/path/to/file.test.ts  # Run specific test
pnpm test:coverage                    # With coverage
pnpm test:e2e                         # Playwright E2E

# Pre-commit
pnpm pre-commit                       # lint + type-check + tests
```

## Architecture

**Fixads Dashboard** — Next.js 16 app for managing Google Ads campaigns with AI-powered optimization. Uses React 19 (with React Compiler), TypeScript 5, Tailwind CSS 4, TanStack Query 5, Zustand 5, Biome 2, Vitest 4.

### Backend: Microservices via API Proxy

The frontend talks to multiple backend services through Next.js rewrites (configured in `next.config.ts`). All API calls use path-based routing through `API_PATHS` in `shared/lib/constants.ts`:

| Service | API Path | Local Port | Purpose |
|---------|----------|------------|---------|
| Auth | `/v1/*` | 8080 | Authentication, users, organizations |
| Google Ads | `/google-ads/v1/*` | 8081 | Campaigns, accounts, search terms |
| Optimization | `/optimization/v1/*` | 8085 | Text & Smart optimizers |
| Alerts | `/alert/v1/*` | 8086 | Alert rules, history, webhooks |
| Reports | `/reports/v1/*` | 8083 | Analytics, dashboards, reports |

When `NEXT_PUBLIC_API_URL` is set, requests go to that host directly. When empty, Next.js rewrites proxy to localhost ports.

### Feature Modules

Each feature is self-contained under `src/features/` with `api/`, `components/`, `hooks/`, `types/`, and `index.ts` (public exports):

`account-overview`, `accounts`, `admin`, `alerts`, `auth`, `campaigns`, `change-history`, `conversions`, `credentials`, `dashboard`, `dashboards`, `experimentation`, `optimizer`, `organizations`, `recommendations`, `reports`, `search-terms`

### Route Groups

- `(auth)/` — Public: login, OAuth callback
- `(dashboard)/` — Protected by `AuthGuard`: all dashboard pages
- `invite/[token]/` — Organization invitation acceptance (public)

### API Client

`shared/api/` provides `apiMethods` (ky-based HTTP client) with:
- **Circuit breaker**: Opens after 5 consecutive 5xx/network failures, resets after 30s
- **Token refresh**: Mutex-protected automatic JWT refresh on 401
- **RFC 7807 error parsing**: Structured error responses
- All feature API modules import from `apiMethods`

### State Management

- **Server state**: TanStack Query with centralized `QUERY_KEYS` in `shared/lib/constants.ts`
- **Client state**: Zustand stores (auth store with localStorage persistence)
- **Auth access outside React**: `getAuthStore()` for API interceptors

### Shared Components

- `src/components/ui/` — shadcn/ui components
- `src/components/charts/` — Recharts-based chart components (kpi-card, chart-card, etc.)
- `src/shared/components/` — App-level shared components (EmptyState, ErrorFallback, LoadingState, etc.)

`EmptyState` (from `@/shared/components`) accepts action as either `ReactNode` or `{ label: string, onClick: () => void }`.

## Key Conventions

### Mutations
Every `.mutate()` call must include `onError` with `toast.error()` (import from `"sonner"`). `mutateAsync` in form handlers must be wrapped in try/catch.

### Query Keys
Always use centralized `QUERY_KEYS` from `shared/lib/constants.ts`. Never define local query key arrays.

### Input Validation
Use `validateCampaignId()` / `validateAssetGroupId()` before interpolating IDs into URLs or GAQL strings. Both use `/^\d+$/` regex.

### Accessibility
- Icon-only `<Button size="icon">`: add `<span className="sr-only">Label</span>` inside
- Native `<button>` with icon-only: add `aria-label` attribute
- Destructive actions: use `AlertDialog` component, not native `confirm()`
- Animations: use `motion-safe:animate-spin` for spinners, `motion-reduce:transition-none` for transitions

### Styling
- Page h1: `text-2xl font-bold tracking-tight`
- Dashboard layout provides `p-4 md:p-6` — content components must not add outer padding
- Use specific transition properties (`transition-colors`, `transition-[box-shadow,border-color]`), not `transition-all`
- Loading spinners: use `Loader2` from lucide-react, not raw CSS border spinners

### Code Style (Biome)
- Double quotes, semicolons, 2-space indent, 100 char width
- `import type` for type-only imports
- Files: `kebab-case`, Components: `PascalCase`, Hooks: `use-` prefix, Types: `PascalCase`

## Testing

Tests mirror source structure under `tests/`. Use MSW for API mocking. Use 501 instead of 500 to avoid ky's automatic retries. shadcn/ui components (`src/components/ui/`) are excluded from coverage.

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080  # Backend API (or empty for local proxy rewrites)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Frontend URL (for OAuth redirects)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...          # Google OAuth client ID
NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER=true   # Feature flag
NEXT_PUBLIC_ENABLE_DARK_MODE=true         # Feature flag
```

## WSL Notes

If developing in WSL with node_modules installed on Windows: run `CI=true pnpm install` from WSL to get Linux-native binaries (lightningcss, rollup). Biome and Vitest may need native platform binaries — use `npx tsc --noEmit` as the primary verification gate if they fail.
