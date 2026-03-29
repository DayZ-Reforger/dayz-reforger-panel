import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import { api, ApiError } from '../../lib/api';
import { tokenStore } from '../../lib/tokenStore';
import type { Account } from '../../lib/types';

interface AuthContextValue {
  user: Account | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(tokenStore.get()));

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStore.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await api.getMe();
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        tokenStore.clear();
      }
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser().catch(() => undefined);
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && tokenStore.get()),
      refreshUser,
      signOut
    }),
    [loading, refreshUser, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
