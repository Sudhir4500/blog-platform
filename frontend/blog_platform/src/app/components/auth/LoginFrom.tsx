"use client";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/app/store/authStore";
import { loginUser } from "@/app/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface LoginFormData {
  identifier: string;
  password: string;
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      const response = await loginUser({
        username: data.identifier.trim().toLowerCase(),
        password: data.password,
      });

      // Wait until Zustand updates before redirecting
      await new Promise((resolve) => {
        login(response.user, response.access);
        setTimeout(resolve, 50); // small wait to avoid race condition
      });

      // Optional: Redirect to original page if "next" param exists
      const nextPath = searchParams.get("next") || "/";
      router.replace(nextPath);
    } catch (err: any) {
      const message =
        err.response?.data?.error || "Login failed. Please check your credentials.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg space-y-7"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center">Welcome Back</h2>

        {errorMessage && (
          <div className="text-red-500 text-sm text-center">{errorMessage}</div>
        )}

        <div className="space-y-2">
          <input
            {...register("identifier", { required: "Email or Username is required" })}
            placeholder="Email or Username"
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.identifier && (
            <p className="text-red-500 text-sm">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            placeholder="Password"
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 text-lg rounded-xl hover:bg-blue-700 transition duration-200"
        >
          Log In
        </button>
        <p className="text-sm text-center text-gray-600">
          Create new account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
