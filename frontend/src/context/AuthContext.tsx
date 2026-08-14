'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, clearToken, setToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  gameId?: string;
  role: string;
  status: string;
}

export interface Wallet {
  availableBalance: number;
  lockedBalance: number;
}

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  loading: boolean;
  refreshMe: () => Promise<void>;
  loginUser: (token: string, userData: User) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  wallet: null,
  loading: true,
  refreshMe: async () => {},
  loginUser: () => {},
  logoutUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.user);
        setWallet(res.wallet);
      }
    } catch (e) {
      clearToken();
      setUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('ngl_token')) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
    fetchMe(); // Fetch full user + wallet
  };

  const logoutUser = () => {
    clearToken();
    setUser(null);
    setWallet(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, wallet, loading, refreshMe: fetchMe, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
