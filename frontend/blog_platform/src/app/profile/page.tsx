"use client";

import { useAuthStore } from "@/app/store/authStore";
import ProfileUpdateForm from "../components/User/ProfileUpdateForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // Ensure zustand store is hydrated before checking
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && (!token || !user)) {
      router.push("/login");
    }
  }, [hydrated, token, user, router]);

  if (!hydrated) return null; // Avoid flicker

  return (
    <main className="min-h-screen py-10 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <ProfileUpdateForm />
    </main>
  );
}
