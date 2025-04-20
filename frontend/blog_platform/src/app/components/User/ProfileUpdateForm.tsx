"use client";

import { useForm } from "react-hook-form";
import { useAuthStore } from "@/app/store/authStore";
import { updateUserProfile, fetchMe } from "@/app/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface FormData {
  username: string;
  bio: string;
  avatar: FileList;
}

export default function ProfileUpdateForm() {
  const { user, login } = useAuthStore(); // <- include login to update store after profile update
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UseEffect hook to trigger re-fetching when profile is updated
  useEffect(() => {
    if (user) {
      // Simulate a re-fetch of the updated profile if needed
      fetchUserProfile();
    }
  }, [user]);

  // Re-fetch user profile after update
  const fetchUserProfile = async () => {
    const token = Cookies.get("session_access_token");
    if (!token) {
      console.error("Authentication token is missing.");
      return;
    }

    try {
      const updatedUser = await fetchMe(); // Fetch updated profile from the backend
      login(updatedUser, token); // Update Zustand store with the new profile data
    } catch (err) {
      console.error("Error fetching updated profile:", err);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      setErrorMessage("User ID is missing. Please log in again.");
      return;
    }

    const token = Cookies.get("session_access_token");
    if (!token) {
      setErrorMessage("Authentication token is missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("bio", data.bio);
    if (data.avatar && data.avatar.length > 0) {
      formData.append("avatar", data.avatar[0]);
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const updatedUser = await updateUserProfile(user.id, formData);

      // Update the store with the new profile data
      login(updatedUser, token);

      // Fetch the updated user profile (you can also manually refresh the data if needed)
      fetchUserProfile();

      console.log("✅ Profile updated successfully:", updatedUser);
      router.push("/profile"); // Redirect to the profile page after update
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to update profile. Please try again.";
      setErrorMessage(message);
      console.error("❌ Error updating profile:", err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">Update Your Profile</h2>

      {errorMessage && (
        <div className="mb-4 text-sm text-red-500 text-center">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Username</label>
          <input
            {...register("username", { required: "Username is required" })}
            placeholder="Enter username"
            defaultValue={user?.username}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">Bio</label>
          <textarea
            {...register("bio")}
            placeholder="Tell us about yourself"
            defaultValue={user?.bio}
            className="w-full px-4 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">Profile Picture</label>
          <input
            {...register("avatar")}
            type="file"
            accept="image/*"
            className="w-full border rounded-xl p-2 text-gray-600"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
