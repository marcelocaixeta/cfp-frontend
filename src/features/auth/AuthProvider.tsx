import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { queryKeys } from '../../config/queryKeys';
import { clearAuthToken, getAuthToken, setAuthToken } from '../../lib/api/authToken';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from './api/authApi';
import { AuthContext, type AuthContextValue } from './authContext';
import type { LoginInput, RegisterInput, User } from './types';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!getAuthToken()) {
        setIsInitializing(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch {
        clearAuthToken();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input);
    if (!response.token || !response.user) {
      throw new Error('A API não retornou token ou usuário.');
    }
    setAuthToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await registerRequest(input);
    if (!response.token || !response.user) {
      throw new Error('A API não retornou token ou usuário.');
    }
    setAuthToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getAuthToken()) {
        await logoutRequest();
      }
    } finally {
      clearAuthToken();
      setUser(null);
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
      window.location.assign('/login');
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && getAuthToken()),
      isInitializing,
      login,
      register,
      logout,
    }),
    [isInitializing, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
