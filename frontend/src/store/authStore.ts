import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@types/index";

interface AuthState {
  user:  AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth:    (user: AuthUser, token: string) => void;
  clearAuth:  () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      // ✅ Removed manual localStorage.setItem — zustand persist handles it
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      // ✅ Removed manual localStorage.removeItem — zustand persist handles it
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name:    "unilease_user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);