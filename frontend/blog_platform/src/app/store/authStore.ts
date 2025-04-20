import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => {
        if (!user?.id || !user.username || !user.email) {
          console.error("Invalid user data provided to login");
          throw new Error("Invalid user data");
        }
        if (!token) {
          console.error("No token provided to login");
          throw new Error("No token provided");
        }
        console.log("Updating auth store with user:", {
          id: user.id,
          username: user.username
        }, "and token:", token.slice(0, 10) + "...");
        set({ user, token });
      },
      logout: () => {
        console.log("Logging out, clearing auth store");
        set({ user: null, token: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        const user = state?.user;
        if (!user?.id) {
          console.warn("No user ID found in persisted state, logging out.");
          state?.logout?.();
        } else {
          console.log("Rehydrated auth store with user:", {
            id: user.id,
            username: user.username
          });
        }
      },
    }
  )
);

// Debug logging
useAuthStore.subscribe((state) => {
  console.log("Auth store state changed:", {
    user: state.user ? { id: state.user.id, username: state.user.username } : null,
    token: state.token ? state.token.slice(0, 10) + "..." : null,
  });
});
