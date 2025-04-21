"use client";

import { useForm } from "react-hook-form";
import { registerUser, fetchMe } from "@/app/lib/api/auth";
import { useAuthStore } from "@/app/store/authStore";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const normalizedData = {
        ...data,
        username: data.username.trim().toLowerCase(),
      };

      const { access, refresh } = await registerUser(normalizedData);
      Cookies.set("token", access, { path: "/" });
      Cookies.set("refreshToken", refresh, { path: "/" });

      const user = await fetchMe();
      login(user, access);

      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create Your Account
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="space-y-2">
          <input
            {...register("username", { required: "Username is required" })}
            placeholder="Username"
            autoComplete="username"
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            placeholder="Email"
            type="email"
            autoComplete="email"
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message?.toString()}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-lg rounded-xl transition duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
