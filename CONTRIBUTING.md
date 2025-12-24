# Contributing to Fixads Dashboard

Thank you for your interest in contributing to Fixads Dashboard. This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Prerequisites

```bash
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0
```

### Setup

```bash
# Clone and install
git clone https://github.com/Fixads-dev/fixads-dashboard.git
cd fixads-dashboard
pnpm install

# Set up environment
cp .env.example .env.local

# Start development
pnpm dev
```

### IDE Setup

**VS Code Extensions (Recommended):**
- Biome (formatting/linting)
- TypeScript + JavaScript
- Tailwind CSS IntelliSense
- Playwright Test

**Settings:**
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

## Development Workflow

### Branch Naming

```
<type>/<ticket-id>-<short-description>

Examples:
feat/FIX-123-campaign-filters
fix/FIX-456-token-refresh
test/FIX-789-optimizer-tests
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Code style (formatting) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

**Scopes:** `auth`, `campaigns`, `optimizer`, `accounts`, `admin`, `shared`, etc.

### Running Checks

```bash
# Before committing
pnpm pre-commit

# Individual checks
pnpm lint          # Biome linting
pnpm type-check    # TypeScript
pnpm test run      # Unit tests
```

## Code Style

### TypeScript

```typescript
// Use explicit type imports
import type { Campaign } from "@/features/campaigns/types";
import { useCampaigns } from "@/features/campaigns/hooks";

// Prefer interfaces for objects
interface CampaignFilters {
  status?: CampaignStatus;
  dateRange?: DateRange;
}

// Use const assertions for literals
const STATUSES = ["ENABLED", "PAUSED", "REMOVED"] as const;
type Status = (typeof STATUSES)[number];
```

### React Components

```typescript
// Prefer function declarations
export function CampaignCard({ campaign }: CampaignCardProps) {
  return (/* ... */);
}

// Use named exports
export { CampaignCard };

// Collocate types with components
interface CampaignCardProps {
  campaign: Campaign;
  onSelect?: (id: string) => void;
}
```

### Hooks

```typescript
// Prefix custom hooks with 'use'
export function useCampaignFilters(initialFilters?: CampaignFilters) {
  // ...
}

// Return objects for multiple values
return { filters, setFilters, resetFilters };

// Use React Query for server state
export function useCampaigns(accountId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPAIGNS.list(accountId),
    queryFn: () => campaignsApi.list(accountId),
    enabled: !!accountId,
  });
}
```

### File Organization

```
features/campaigns/
├── api/
│   └── campaigns-api.ts      # API client
├── components/
│   ├── campaign-card.tsx     # Single component per file
│   ├── campaign-list.tsx
│   └── index.ts              # Barrel exports
├── hooks/
│   ├── use-campaigns.ts
│   └── index.ts
├── types/
│   └── index.ts              # All types for feature
├── schemas/
│   └── campaign-schemas.ts   # Zod schemas
└── index.ts                  # Public API
```

## Testing Guidelines

### Unit Tests

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { server } from "@/tests/utils/mocks/server";

describe("useCampaigns", () => {
  it("fetches campaigns for account", async () => {
    server.use(
      http.get("*/campaigns", () => {
        return HttpResponse.json({ campaigns: mockCampaigns });
      })
    );

    const { result } = renderHook(
      () => useCampaigns("account-1"),
      { wrapper: QueryWrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
  });
});
```

### Test File Naming

```
tests/
├── features/
│   └── campaigns/
│       ├── hooks/
│       │   └── use-campaigns.test.tsx    # Hook tests
│       ├── types/
│       │   └── index.test.ts             # Type helper tests
│       └── schemas/
│           └── campaign-schemas.test.ts  # Schema tests
```

### Coverage Requirements

- Minimum 70% coverage for all metrics
- New features must include tests
- Bug fixes should include regression tests

## Pull Request Process

### Before Submitting

1. **Update from main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks:**
   ```bash
   pnpm pre-commit
   ```

3. **Test manually** in the browser

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

### Review Process

1. Submit PR with clear description
2. Wait for CI checks to pass
3. Request review from team member
4. Address feedback
5. Merge after approval

## Architecture Guidelines

### Feature Modules

Each feature should be self-contained:

```typescript
// features/campaigns/index.ts - Public API
export { CampaignList, CampaignCard } from "./components";
export { useCampaigns, useCampaign } from "./hooks";
export type { Campaign, CampaignFilters } from "./types";
```

### State Management

| State Type | Solution |
|------------|----------|
| Server state | TanStack Query |
| Global UI state | Zustand |
| Form state | React Hook Form |
| Component state | useState/useReducer |

### API Layer

```typescript
// Use the shared API client
import { apiMethods } from "@/shared/api";

export const campaignsApi = {
  list: (accountId: string) =>
    apiMethods.get<CampaignsResponse>(`campaigns?account_id=${accountId}`),

  get: (id: string) =>
    apiMethods.get<Campaign>(`campaigns/${id}`),
};
```

### Error Handling

```typescript
// Use React Query's error handling
const { data, error, isError } = useCampaigns(accountId);

if (isError) {
  return <ErrorFallback error={error} />;
}

// For mutations, use onError callback
const mutation = useMutation({
  mutationFn: campaignsApi.update,
  onError: (error) => {
    toast.error(error.message);
  },
});
```

## Questions?

- Open an issue for bugs or feature requests
- Reach out to the team for architecture questions
- Check existing issues before creating new ones

---

Thank you for contributing!
