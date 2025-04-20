//store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        console.log("Updating auth store with user:", user, "and token:", token.slice(0, 10) + "...");
        set({ user, token });
      },
      logout: () => {
        console.log("Logging out, clearing auth store");
        set({ user: null, token: null });
        // Explicitly clear persisted storage
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("auth-storage-state");
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

// Subscribe to state changes for debugging
useAuthStore.subscribe((state) => {
  console.log("Auth store state changed:", state);
});