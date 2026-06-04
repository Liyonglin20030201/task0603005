import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  role: {
    id: number;
    name: string;
    code: string;
    permissions: string[];
  };
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  admin: AdminInfo | null;
  setAuth: (token: string, refreshToken: string, admin: AdminInfo) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      admin: null,
      setAuth: (token, refreshToken, admin) => set({ token, refreshToken, admin }),
      logout: () => set({ token: null, refreshToken: null, admin: null }),
      hasPermission: (permission: string) => {
        const { admin } = get();
        if (!admin) return false;
        if (admin.role.code === 'super_admin') return true;
        return admin.role.permissions.includes(permission);
      },
    }),
    { name: 'auth-storage' },
  ),
);
