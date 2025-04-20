// components/ui/NewPostButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { FaPlus } from "react-icons/fa"; // Optional: Use any icon

interface NewPostButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function NewPostButton({ children = "New Post", icon = <FaPlus />, className = "" }: NewPostButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/new");
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
