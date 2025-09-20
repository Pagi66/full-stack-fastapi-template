import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { LoginService } from '@/api/services/LoginService';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  syncAccessTokenFromStorage,
} from '@/api/client-config';

export type UserRole = 'admin' | 'user';

type AccountTier = string;
type KycStatus = string;

interface User {
  id: string;
  email: string;
  full_name?: string | null;
  is_active?: boolean;
  role: UserRole;
  account_tier: AccountTier;
  kyc_status: KycStatus;
  kyc_verified_at?: string | null;
  kyc_notes?: string | null;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normaliseUser = (payload: Record<string, unknown>): User => {
  const rawRole = (payload.role as string) ?? 'user';
  const role: UserRole = rawRole === 'admin' ? 'admin' : 'user';
  return {
    id: String(payload.id),
    email: String(payload.email),
    full_name: (payload.full_name as string | null) ?? null,
    is_active: Boolean(payload.is_active ?? true),
    role,
    account_tier: String(payload.account_tier ?? 'basic'),
    kyc_status: String(payload.kyc_status ?? 'pending'),
    kyc_verified_at: (payload.kyc_verified_at as string | null) ?? null,
    kyc_notes: (payload.kyc_notes as string | null) ?? null,
    balance:
      typeof payload.balance === 'number'
        ? (payload.balance as number)
        : Number(payload.balance ?? 0),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthTokenState] = useState<string | undefined>(() => getAccessToken());
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthTokenState(syncAccessTokenFromStorage());
  }, []);

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => LoginService.loginTestToken(),
    enabled: Boolean(authToken),
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      LoginService.loginLoginAccessToken({
        username: email,
        password: password,
        grant_type: '',
        scope: '',
        client_id: '',
        client_secret: '',
      }),
    onSuccess: async (data) => {
      setAccessToken(data.access_token);
      setAuthTokenState(data.access_token);
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      clearAccessToken();
      setAuthTokenState(undefined);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      setUser(null);
      router.history.push('/login');
    },
  });

  useEffect(() => {
    if (userQuery.data) {
      const payload = userQuery.data as Record<string, unknown>;
      setUser(normaliseUser(payload));
    } else if (!userQuery.isFetching) {
      setUser(null);
    }
    setIsLoading(userQuery.isLoading);
  }, [userQuery.data, userQuery.isLoading, userQuery.isFetching]);

  const login = async (email: string, password: string): Promise<UserRole> => {
    const token = await loginMutation.mutateAsync({ email, password });
    const rawRole = (token?.role as string) ?? 'user';
    return rawRole === 'admin' ? 'admin' : 'user';
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [logout]);

  const refreshToken = async () => {
    logout();
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading: isLoading || loginMutation.isPending,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refreshToken,
    }),
    [user, isLoading, loginMutation.isPending],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
