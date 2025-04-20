"use client";

import { useForm } from "react-hook-form";
import { registerUser, fetchMe } from "@/app/lib/api/auth";
import { useAuthStore } from "@/app/store/authStore";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const [error, setError] = useState("");

  const onSubmit = async (data: any) => {
    try {
      const { access, refresh } = await registerUser(data);
      Cookies.set("token", access, { path: "/" });
      Cookies.set("refreshToken", refresh, { path: "/" });

      const user = await fetchMe();
      login(user, access);

      router.push("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.response?.data?.error || "Registration failed.");
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
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username?.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            {...register("email", { required: "Email is required" })}
            placeholder="Email"
            type="email"
            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email?.message?.toString()}</p>
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
            <p className="text-red-500 text-sm">{errors.password?.message?.toString()}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 text-lg rounded-xl hover:bg-blue-700 transition duration-200"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
