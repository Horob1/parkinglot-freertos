import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AuthState {
  auth: boolean;
  login: () => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: false,
      login: () => set({ auth: true }),
      logout: () => set({ auth: false }),
    }),
    { name: "auth-storage" }
  )
);
