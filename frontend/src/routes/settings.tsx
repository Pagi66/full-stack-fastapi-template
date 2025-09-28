import { createFileRoute } from '@tanstack/react-router';
import { AccountSettings } from '@/pages/settings/account-settings';
import { RouteGuard } from '@/components/auth/route-guard';

export const Route = createFileRoute('/settings')({
  component: () => (
    <RouteGuard>
      <AccountSettings />
    </RouteGuard>
  ),
});