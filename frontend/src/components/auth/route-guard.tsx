import { ReactNode, useEffect } from 'react';
import { useAuth, UserRole } from '@/providers/auth-provider';
import { useRouter } from '@tanstack/react-router';
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

export const RouteGuard = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  allowedRoles,
}: RouteGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (requireAuth && !isAuthenticated) {
      router.navigate({ to: redirectTo });
    }
    if (allowedRoles && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      router.navigate({ to: redirectTo });
    }
    if (!requireAuth && isAuthenticated) {
      router.navigate({ to: redirectTo });
    }
  }, [allowedRoles, isAuthenticated, isLoading, redirectTo, requireAuth, router, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator size="xl" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
