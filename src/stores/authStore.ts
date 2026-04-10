import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  setAuth: (token: string, role?: string | null, userId?: number | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      setAuth: (token, role, userId) =>
        set({
          token,
          role: role ?? null,
          userId: userId ?? null,
        }),
      clearAuth: () =>
        set({
          token: null,
          role: null,
          userId: null,
        }),
    }),
    {
      name: "auth-storage",
      partialize: ({ token, role, userId }) => ({ token, role, userId }),
    }
  )
);
