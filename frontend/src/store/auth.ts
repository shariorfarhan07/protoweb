"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPublic } from "@/lib/api-types";

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  setAuth: (user: UserPublic, token: string) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  canManageInventory: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin" || user?.role === "super_admin";
      },
      isSuperAdmin: () => get().user?.role === "super_admin",
      canManageInventory: () => {
        const { user } = get();
        return (
          user?.role === "admin" ||
          user?.role === "super_admin" ||
          user?.role === "inventory_manager"
        );
      },
    }),
    {
      name: "prototypebd-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
