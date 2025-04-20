"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import Search from "../comment/SEARCH/search";
import LogoutButton from "../logoutbutton";
import NewPostButton from "./NewPostButton";
import { HiMenu, HiX } from "react-icons/hi";
import { MyPostsButton } from "./mypostbutton";
// import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // const router = useRouter();
  // const handleeditprofile = () => {
  //   if (!user) {
  //     router.push('/login'); // Redirect to login if not authenticated
  //     return;
  //   }
  //     router.push('/profile'); // Navigate to user's posts page
  //   };

  return (
    <nav className="bg-white shadow p-4 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          <Link href="/">Blog Platform</Link>
        </div>

        {/* Hamburger Icon (Mobile) */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-2xl text-gray-700 focus:outline-none">
            {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* Center Search (Desktop Only) */}
        {user && (
          <div className="hidden md:flex flex-1 justify-center max-w-md px-4">
            <Search />
          </div>
        )}

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span  className="text-gray-700 font-bold ">Hi, {user.username}</span>
              <MyPostsButton />
              <NewPostButton />
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden mt-4 space-y-4 text-center bg-gray-50 rounded-lg p-4 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-100 max-h-screen" : "opacity-0 max-h-0"
          }`}
        >
          {user && (
            <div className="mb-4">
              <Search />
            </div>
          )}
          {user ? (
            <>
              <div  className="text-gray-700 font-medium" >Hi, {user.username}</div>
              <MyPostsButton/>
              <NewPostButton className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg" />
              <LogoutButton  />
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="w-full py-3 mb-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}