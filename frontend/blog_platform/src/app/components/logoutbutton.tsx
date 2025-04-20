"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { resetAuthCookies } from "../lib/actions";


const LogoutButton: React.FC = () => {
  const { logout } = useAuthStore();
  const router = useRouter();

  const submitLogout = async () => {
    try {
      // Clear server-side cookies
      await resetAuthCookies();
      // Clear client-side auth state
      logout();
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={submitLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
    >
      Log out
    </button>
  );
};

export default LogoutButton;