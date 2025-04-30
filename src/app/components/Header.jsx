"use client";

import Link from "next/link";
import SignOutButton from "./SignOut";
import { useSession } from "next-auth/react";

function Header() {
  const { data: session } = useSession();

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

      {session && (
        <div className="flex justify-end ml-auto">
          <SignOutButton />
        </div>
      )}
    </header>
  );
}

export default Header;
