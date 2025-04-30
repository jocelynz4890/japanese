"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })} // redirect to sign in page
      className="bg-red-500 text-white py-2 px-4 rounded"
    >
      Sign Out
    </button>
  );
}
