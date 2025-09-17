# TanStack Migration Instructions

## Overview

This document outlines the successful migration of the FastAPI + React template from React Router v7 to TanStack Router and the integration of TanStack Query for modern data fetching. This migration provides type-safe routing, file-based route organization, and powerful data management capabilities.

## What Was Migrated

### 1. Routing System
- **From**: React Router v7 with imperative route configuration
- **To**: TanStack Router with file-based routing system
- **Benefits**: Type safety, automatic code splitting, better developer experience

### 2. Data Fetching
- **Added**: TanStack Query (React Query) for server state management
- **Benefits**: Automatic caching, background updates, optimistic updates, retry logic

### 3. Development Tools
- **Added**: TanStack Router DevTools and React Query DevTools
- **Benefits**: Better debugging and inspection of routing and data fetching

## File Structure Changes

### New Files Created
```
src/
├── routes/                    # File-based routing structure
│   ├── __root.tsx            # Root route with devtools
│   ├── index.tsx             # Landing page (/)
│   ├── home.tsx              # Home screen (/home)
│   ├── dashboard.tsx         # User dashboard (/dashboard)
│   ├── login.tsx             # Login page (/login)
│   ├── signup.tsx            # Signup page (/signup)
│   ├── $.tsx                 # Catch-all route for 404
│   └── admin/
│       └── dashboard.tsx     # Admin dashboard (/admin/dashboard)
├── router.tsx                # Router configuration
└── routeTree.gen.ts          # Auto-generated route tree (DO NOT EDIT)
```

### Modified Files
- `src/main.tsx` - Updated to use TanStack Router and Query providers
- `src/providers/router-provider.tsx` - Updated to use TanStack Router navigation
- `src/pages/not-found.tsx` - Updated navigation hooks

### Dependencies Added
```json
{
  "dependencies": {
    "@tanstack/react-router": "^latest",
    "@tanstack/react-query": "^latest",
    "@tanstack/router-devtools": "^latest",
    "@tanstack/react-query-devtools": "^latest"
  },
  "devDependencies": {
    "@tanstack/router-cli": "^latest"
  }
}
```

### Dependencies Removed
- `react-router` - Replaced with TanStack Router

## Key Implementation Details

### Router Configuration (`src/router.tsx`)
```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

### Main Application Setup (`src/main.tsx`)
```tsx
// QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Provider hierarchy
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <RouterProvider router={router} />
    <ReactQueryDevtools initialIsOpen={false} />
  </ThemeProvider>
</QueryClientProvider>
```

### File-Based Route Example (`src/routes/dashboard.tsx`)
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { UserDashboard } from '@/pages/user-dashboard'

export const Route = createFileRoute('/dashboard')({
  component: UserDashboard,
})
```

## Development Workflow

### Route Generation
Routes are automatically generated from the file structure. Run this command after adding/modifying routes:
```bash
npx @tanstack/router-cli generate
```

### Adding New Routes
1. Create a new file in `src/routes/` following the naming convention
2. Export a `Route` created with `createFileRoute()`
3. Run the generation command
4. The route will be automatically available

### Route Naming Convention
- `index.tsx` → `/` (root)
- `about.tsx` → `/about`
- `users.tsx` → `/users`
- `users/index.tsx` → `/users`
- `users/$userId.tsx` → `/users/:userId` (dynamic)
- `$.tsx` → `/*` (catch-all)

## Migration Benefits

### Type Safety
- Automatic TypeScript inference for routes
- Type-safe navigation with route validation
- Compile-time route checking

### Performance
- Automatic code splitting at route level
- Intelligent caching with TanStack Query
- Background data updates

### Developer Experience
- DevTools for debugging routing and queries
- Hot reload support for route changes
- Clear file organization

### Data Management
- Declarative data fetching patterns
- Automatic loading states
- Built-in error handling
- Optimistic updates ready

## Usage Examples

### Navigation
```tsx
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()

// Navigate to route
navigate({ to: '/dashboard' })

// Navigate with search params
navigate({ 
  to: '/users', 
  search: { page: 1, filter: 'active' } 
})
```

### Data Fetching (Ready for Implementation)
```tsx
import { useQuery } from '@tanstack/react-query'

// Example query hook
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => UsersService.readUsers(),
  staleTime: 1000 * 60 * 5,
})
```

### Route Guards (Example Implementation)
```tsx
export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user?.is_superuser) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminDashboard,
})
```

## Best Practices

### 1. Route Organization
- Keep route files focused on routing concerns only
- Use the `pages/` directory for actual page components
- Implement data loading in route `loader` functions when needed

### 2. Data Fetching
- Use TanStack Query for all server state
- Implement proper error boundaries
- Use optimistic updates for better UX

### 3. Type Safety
- Always export typed route configurations
- Use search schema for type-safe search params
- Leverage TypeScript inference

### 4. Performance
- Implement route-level code splitting
- Use proper caching strategies
- Monitor bundle sizes

## Troubleshooting

### Common Issues

#### Route Not Found
- Ensure route file is properly named
- Run `npx @tanstack/router-cli generate`
- Check that the route exports `Route` correctly

#### TypeScript Errors
- Regenerate route tree after changes
- Ensure proper route typing
- Check import paths

#### Navigation Issues
- Verify route paths match file structure
- Use the correct navigation hooks
- Check for typos in route paths

### Development Commands
```bash
# Generate routes
npx @tanstack/router-cli generate

# Watch mode for route generation
npx @tanstack/router-cli watch

# Start development server
npm run dev
```

## Future Enhancements

### Immediate Opportunities
1. **Add authentication guards** to protected routes
2. **Implement search schemas** for type-safe URL params
3. **Add route loaders** for data preloading
4. **Create custom query hooks** for API endpoints

### Advanced Features
1. **Implement parallel data loading** with route loaders
2. **Add route-level error boundaries**
3. **Implement route-based code splitting**
4. **Add SEO meta tags** per route

## Conclusion

The migration to TanStack Router and Query provides a modern, type-safe foundation for the FastAPI React template. The file-based routing system scales well with project growth, and TanStack Query provides powerful data management capabilities that will improve user experience through intelligent caching and background updates.

All existing functionality has been preserved while gaining significant improvements in developer experience, type safety, and performance characteristics.