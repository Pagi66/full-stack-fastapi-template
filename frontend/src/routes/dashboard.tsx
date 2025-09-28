import { createFileRoute, Outlet } from '@tanstack/react-router'
import { UserDashboard } from '@/pages/user-dashboard'
import { ExecutionFeedProvider } from '@/providers/execution-feed-provider'
import { RouteGuard } from '@/components/auth/route-guard'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <RouteGuard>
      <ExecutionFeedProvider>
        <UserDashboard>
          <Outlet />
        </UserDashboard>
      </ExecutionFeedProvider>
    </RouteGuard>
  ),
})
