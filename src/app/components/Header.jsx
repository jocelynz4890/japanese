"use client";

import Link from "next/link";
import SignOutButton from "./SignOut";
import { useSession } from "next-auth/react";

function Header() {
  const { data: session, status } = useSession();

  const isStudent = session?.user?.role === "student";

  return (
    <header className="sticky top-0 flex items-center justify-between px-6 py-3 shadow-md h-16">
      <nav className="flex space-x-6">
        <Link href="/" className="hover:text-gray-300 transition">
          Home
        </Link>
        <Link href="/progress" className="hover:text-gray-300 transition">
          Progress
        </Link>
      </nav>

      {isStudent && (
        <div className="flex justify-end ml-auto">
          <input
            type="text"
            maxLength={6}
            className="px-2 py-1 text-sm rounded-md border border-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter class code"
          />
        </div>
      )}

      {session && (
        <div className="flex justify-end ml-auto">
          <SignOutButton />
        </div>
      )}
    </header>
  );
}

export default Header;
