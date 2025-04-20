"use client";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/app/store/authStore";
import { loginUser } from "@/app/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormData {
  identifier: string; // renamed for clarity
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      // Send identifier as "username" to match backend expectations
      const response = await loginUser({
        username: data.identifier.trim().toLowerCase(),
        password: data.password,
      });
      login(response.user, response.access);
      router.push("/");
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
      </form>
    </div>
  );
}
