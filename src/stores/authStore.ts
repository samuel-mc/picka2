import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  authenticated: boolean;
  initialized: boolean;
  role: string | null;
  userId: number | null;
  username: string | null;
  setAuth: (payload: {
    role?: string | null;
    userId?: number | null;
    username?: string | null;
  }) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authenticated: false,
      initialized: false,
      role: null,
      userId: null,
      username: null,
      setAuth: ({ role, userId, username }) =>
        set({
          authenticated: true,
          initialized: true,
          role: role ?? null,
          userId: userId ?? null,
          username: username ?? null,
        }),
      setInitialized: (initialized) =>
        set((state) => ({
          initialized,
          authenticated: initialized ? state.authenticated : false,
        })),
      clearAuth: () =>
        set({
          authenticated: false,
          initialized: true,
          role: null,
          userId: null,
          username: null,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ authenticated, role, userId, username }) => ({
        authenticated,
        role,
        userId,
        username,
      }),
    }
  )
);
