import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchMe, login as loginApi, logout as logoutApi, type UserDto } from '../api/auth';
import { getAuthToken, setAuthToken } from '../api/client';

type AuthContextValue = {
  user: UserDto | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }
    const profile = await fetchMe();
    setUser(profile);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshUser();
      } catch {
        setAuthToken('');
        setUser(null);
      } finally {
        setIsReady(true);
      }
    };
    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(async (userId: string) => {
    const response = await loginApi(userId);
    setAuthToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getAuthToken()) {
        await logoutApi();
      }
    } catch {
      // ignore
    } finally {
      setAuthToken('');
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
    }),
    [user, isReady, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
