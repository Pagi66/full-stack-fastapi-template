import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { RouteProvider } from '@/providers/router-provider'

export const Route = createRootRoute({
  component: () => (
    <RouteProvider>
      <Outlet />
      <TanStackRouterDevtools />
    </RouteProvider>
  ),
})