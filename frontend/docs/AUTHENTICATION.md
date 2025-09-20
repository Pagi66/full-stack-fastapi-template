# Authentication System Documentation

## Overview

This document outlines the authentication workflow for the Fleet ERP frontend. The stack combines FastAPI-issued JWT access tokens with a TanStack Query powered React client. Tokens are persisted in `localStorage`, surfaced through an in-memory accessor, and appended to every generated OpenAPI request at call time. Every token embeds the authenticated user's role so the UI can gate admin-only functionality immediately after sign-in.

## Architecture

### Backend (FastAPI)

- OAuth2 password flow backed by JWT access tokens.
- Primary endpoints:
  - `POST /api/v1/login/access-token` � issue access tokens containing a `role` claim.
  - `POST /api/v1/login/test-token` � verify an access token and return the active user.
- Token lifetime driven by `ACCESS_TOKEN_EXPIRE_MINUTES` in environment configuration.
- Password hashing via passlib/bcrypt.

### Frontend (React + TanStack)

- React Context (`AuthProvider`) exposes auth primitives to the component tree.
- TanStack Query manages API calls and cache invalidation, keyed under `['currentUser']` for the active user.
- Generated OpenAPI client (`src/api`) is configured at runtime by `src/api/client-config.ts`, which sets `OpenAPI.BASE` and resolves bearer tokens on demand.
- TanStack Router guards routes using both authentication state and the `allowedRoles` list when provided.

## Key Components

### 1. Auth Provider � `src/providers/auth-provider.tsx`

- Wraps the app with `AuthContext`.
- Handles login/logout mutations via generated services.
- Persists tokens through the token store and immediately hydrates the current user via `loginTestToken`, seeding TanStack Query and context.
- Exposes `isAdmin` and the current `UserRole` so views can branch instantly.
- Subscribes to global `auth-error` events to reset session state.

### 2. OpenAPI Client Configuration � `src/api/client-config.ts`

- Sets `OpenAPI.BASE` from `import.meta.env.VITE_API_URL`.
- Provides `setAccessToken`, `clearAccessToken`, and `getAccessToken` helpers that keep an in-memory copy aligned with `localStorage`.
- Supplies a resolver for `OpenAPI.TOKEN` so every `Authorization` header is computed immediately before the request is sent.

### 3. Route Guards � `src/components/auth/route-guard.tsx`

- Blocks unauthenticated access to protected routes and redirects to login.
- Guards can accept `allowedRoles` to restrict access to specific roles (for example the admin dashboard only allows `['admin']`).
- Supports inverse behaviour (redirect authenticated users away from auth-only pages).

### 4. Auth Error Boundary � `src/components/auth/error-boundary.tsx`

- Captures auth-related failures from nested components.
- Emits an `auth-error` window event to centralise logout handling.

## Authentication Flow

### Login

1. User submits credentials.
2. `AuthProvider` invokes `LoginService.loginLoginAccessToken`.
3. The returned access token is stored via `setAccessToken`, updating both in-memory cache and `localStorage`.
4. `AuthProvider` eagerly calls `LoginService.loginTestToken`, seeds the response into TanStack Query, and updates context state.
5. Authenticated user data (including `role`, `account_tier`, `kyc_status`, and balance) is now available synchronously to route guards.
6. The `login` helper returns the user's role so the UI can route admins to `/admin/dashboard` immediately.

### Protected Navigation

1. Route Guard checks `AuthContext` for `isAuthenticated`.
2. Authenticated users reach the requested route; unauthenticated users are redirected to `/login`.
3. If the guard detects a missing or expired token mid-navigation, it defers to the auth error boundary to reset state.
4. When `allowedRoles` is provided, guards redirect users who lack the necessary permissions to the specified `redirectTo` route.

### Logout / Token Expiry

1. `logout()` clears the token via `clearAccessToken`, removes cached user queries, and redirects to `/login`.
2. `auth-error` events (401 responses) also trigger `logout()`.
3. UI updates immediately because context resets to `user = null`.

## Error Handling

- 401 responses dispatch an `auth-error` event, ensuring tokens are purged and the user is redirected.
- 400/403 responses surface through component-level error boundaries or mutation error states.
- All API errors originated from generated services raise an `ApiError`, simplifying handling in consuming components.

## Security Notes

- Tokens remain in memory only for the current session and are re-read from storage before every request, limiting exposure if memory is inspected.
- Requests only include a bearer token when one is available; blank tokens are ignored by the client.
- Documentation and code both reference `VITE_API_URL` for the backend origin to avoid hard-coded URLs.

## Operational Safeguards

- Backend logging now emits JSON-structured entries at the level defined by `LOG_LEVEL`, simplifying ingestion by log platforms.
- Incoming HTTP traffic is throttled via an in-memory rate limiter (default `100` requests per 60 seconds per client); override the `RATE_LIMIT_*` settings to tune or disable when necessary.
- Password recovery and welcome emails dispatch asynchronously through a worker thread so user-facing endpoints respond without blocking on SMTP.

## Usage Examples

### Access Auth Context

```tsx
import { useAuth } from '@/providers/auth-provider';

const Dashboard = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <p>Welcome back, {user?.email} ({isAdmin ? 'admin' : 'user'})</p>
      <button onClick={logout}>Sign out</button>
    </div>
  );
};
```

### Call an Authenticated Endpoint

```tsx
import { useQuery } from '@tanstack/react-query';
import { PortfolioService } from '@/api/services/PortfolioService';
import { useAuth } from '@/providers/auth-provider';

export const useAccountSummary = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['account-summary', user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => PortfolioService.accountSummary(user!.id),
  });
};
```

## Configuration

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

Tokens are stored under the `access_token` key in `localStorage`. Helper functions in `client-config.ts` encapsulate reads and writes to keep the rest of the app agnostic of storage details.

## Testing Checklist

- Login mutation returns an access token, resolves the user's role, and hydrates context with `loginTestToken`.
- Protected routes redirect unauthenticated users to `/login`.
- Role-guarded routes reject users without the required role.
- `auth-error` events clear stored tokens and cached queries.
- Logout removes the token and blocks subsequent authenticated calls.

## Troubleshooting

1. **401 responses after login** � inspect network tab to confirm the Authorization header is present; if missing, verify `client-config.ts` is imported by `main.tsx`.
2. **CORS issues** � ensure backend `BACKEND_CORS_ORIGINS` includes the frontend origin.
3. **Token not persisting** � confirm `localStorage` is available (browser privacy modes may disable it).
4. **Outdated API base URL** � check the `VITE_API_URL` variable or rebuild the frontend after changes.

## Future Enhancements

- Introduce refresh tokens and silent renewal.
- Add social login providers.
- Implement granular permission checks via TanStack Query scoped caches.
- Persist auth state across tabs using the `storage` event.
