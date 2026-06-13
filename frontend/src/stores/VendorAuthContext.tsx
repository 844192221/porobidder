import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  vendorGetSession,
  vendorLogin as vendorLoginApi,
  vendorLogout as vendorLogoutApi,
  vendorRegister as vendorRegisterApi,
  type VendorProfile,
} from '../api/vendorAuth';

type VendorAuthContextValue = {
  vendor: VendorProfile | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (vendorId: string, password: string) => Promise<void>;
  register: (vendorId: string, password: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const VendorAuthContext = createContext<VendorAuthContextValue | null>(null);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const session = await vendorGetSession();
        setVendor(session);
      } finally {
        setIsReady(true);
      }
    };
    void bootstrap();
  }, []);

  const login = useCallback(async (vendorId: string, password: string) => {
    const profile = await vendorLoginApi(vendorId, password);
    setVendor(profile);
  }, []);

  const register = useCallback(async (vendorId: string, password: string, email: string) => {
    const profile = await vendorRegisterApi(vendorId, password, email);
    setVendor(profile);
  }, []);

  const logout = useCallback(async () => {
    await vendorLogoutApi();
    setVendor(null);
  }, []);

  const value = useMemo(
    () => ({
      vendor,
      isReady,
      isAuthenticated: Boolean(vendor),
      login,
      register,
      logout,
    }),
    [vendor, isReady, login, register, logout],
  );

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>;
}

export function useVendorAuth(): VendorAuthContextValue {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within VendorAuthProvider');
  }
  return context;
}
