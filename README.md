<div align="center">

# Fixads Dashboard

**Enterprise Google Ads Management Platform**

A modern, full-featured dashboard for managing Google Ads campaigns with AI-powered optimization, built with Next.js 16 and React 19.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)](#)

[Features](#features) · [Quick Start](#quick-start) · [Architecture](#architecture) · [Development](#development) · [Testing](#testing)

</div>

---

## Features

- **Campaign Management** — View and manage Performance Max campaigns with real-time metrics
- **AI Text Optimizer** — Generate optimized ad copy using AI suggestions
- **Smart Optimizer** — Detect and improve underperforming assets automatically
- **Multi-Account Support** — Connect and switch between multiple Google Ads accounts
- **Search Terms Analysis** — Analyze search term performance and manage keywords
- **Change History** — Track all modifications with detailed audit logs
- **Recommendations** — Apply Google Ads recommendations directly from the dashboard
- **Experimentation** — Multi-Armed Bandit testing for asset optimization

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) with App Router & Turbopack |
| **UI Library** | [React 19](https://react.dev/) with React Compiler |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Components** | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **State** | [Zustand 5](https://zustand.docs.pmnd.rs/) + [TanStack Query 5](https://tanstack.com/query) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) |
| **HTTP Client** | [ky](https://github.com/sindresorhus/ky) with circuit breaker |
| **Charts** | [Recharts 3](https://recharts.org/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) + [MSW](https://mswjs.io/) |
| **Linting** | [Biome](https://biomejs.dev/) |

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- Backend API running (see [fixads-api](https://github.com/Fixads-dev/fixads-api))

### Installation

```bash
# Clone the repository
git clone https://github.com/Fixads-dev/fixads-dashboard.git
cd fixads-dashboard

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8080    # Backend API URL
NEXT_PUBLIC_APP_URL=http://localhost:3000    # Frontend URL (OAuth callbacks)

# Optional
NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER=true      # Feature flag
```

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, callback)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/
│   ├── charts/            # Chart components (Recharts)
│   └── ui/                # shadcn/ui components
├── features/              # Feature-based modules
│   ├── accounts/          # Google Ads account management
│   ├── admin/             # Admin panel
│   ├── auth/              # Authentication
│   ├── campaigns/         # Campaign management
│   ├── change-history/    # Audit logs
│   ├── conversions/       # Conversion tracking
│   ├── experimentation/   # MAB testing
│   ├── optimizer/         # AI optimization
│   ├── recommendations/   # Google Ads recommendations
│   └── search-terms/      # Search term analysis
├── shared/                # Shared utilities
│   ├── api/               # HTTP client with interceptors
│   ├── hooks/             # Common hooks
│   ├── lib/               # Utilities (circuit breaker, constants)
│   └── providers/         # React context providers
└── hooks/                 # Global hooks
```

### Feature Module Structure

Each feature follows a consistent structure:

```
features/[feature]/
├── api/           # API client functions
├── components/    # Feature-specific components
├── hooks/         # React Query hooks
├── stores/        # Zustand stores (if needed)
├── types/         # TypeScript types
├── schemas/       # Zod validation schemas
└── index.ts       # Public exports
```

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Google    │────▶│  Callback   │
│   Page      │     │   OAuth     │     │   Handler   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │  Dashboard  │◀────│   Backend   │
                    │   (JWT)     │     │  Exchange   │
                    └─────────────┘     └─────────────┘
```

### API Layer

- **Circuit Breaker** — Automatic failure detection and recovery
- **Token Refresh** — Mutex-based concurrent refresh handling
- **Request Interceptors** — Automatic JWT injection
- **Error Handling** — Standardized error responses

## Development

### Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Check with Biome
pnpm lint:fix         # Auto-fix issues
pnpm format           # Format code
pnpm type-check       # TypeScript checking

# Testing
pnpm test             # Watch mode
pnpm test run         # Single run
pnpm test:coverage    # With coverage report
pnpm test:e2e         # E2E tests
pnpm test:e2e:ui      # E2E with UI

# Pre-commit
pnpm pre-commit       # lint + type-check + tests
```

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

- Double quotes for strings
- Semicolons required
- 2-space indentation
- 100 character line width
- `import type` for type-only imports

### Creating a New Feature

1. Create feature directory under `src/features/`
2. Add API client in `api/`
3. Define types in `types/`
4. Create React Query hooks in `hooks/`
5. Build components in `components/`
6. Export public API from `index.ts`
7. Add tests in `tests/features/[feature]/`

## Testing

### Unit Tests

We use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/) and [MSW](https://mswjs.io/) for API mocking.

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test run

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test run tests/features/auth/hooks/use-google-oauth.test.tsx
```

### E2E Tests

We use [Playwright](https://playwright.dev/) for end-to-end testing.

```bash
# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e tests/e2e/auth.spec.ts
```

### Test Structure

```
tests/
├── features/           # Feature-specific tests
│   ├── auth/
│   │   ├── hooks/     # Hook tests
│   │   ├── stores/    # Store tests
│   │   └── types/     # Type helper tests
│   └── ...
├── shared/            # Shared utility tests
│   ├── api/           # API client tests
│   ├── hooks/         # Common hook tests
│   └── lib/           # Utility tests
├── e2e/               # Playwright E2E tests
└── utils/
    └── mocks/         # MSW handlers and server setup
```

### Coverage Thresholds

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |

## Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables (Production)

```bash
NEXT_PUBLIC_API_URL=https://api.fixads.xyz
NEXT_PUBLIC_APP_URL=https://app.fixads.xyz
NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER=true
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Contributing

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```bash
feat(campaigns): add campaign filtering by status
fix(auth): resolve token refresh race condition
test(optimizer): add smart optimizer hook tests
docs: update README with architecture section
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following code style guidelines
3. Add/update tests for new functionality
4. Run `pnpm pre-commit` to validate
5. Submit PR with clear description
6. Address review feedback
7. Merge after approval

## License

This project is proprietary software. All rights reserved.

---

<div align="center">

**[Fixads](https://fixads.xyz)** · Built with Next.js 16 & React 19

</div>
