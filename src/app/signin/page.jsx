"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  const handleLogin = (role) => {
    document.cookie = `login_role=${role}; path=/`; // save role to cookie
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="pt-24 flex justify-center px-4">
      <div className="p-8 rounded-xl shadow w-full max-w-md text-center border border-gray-200">
        <h1 className="text-2xl font-semibold mb-6">
          Sign in to access the rest of the site!
        </h1>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleLogin("teacher")}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Login as Teacher
          </button>

          <button
            onClick={() => handleLogin("student")}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            Login as Student
          </button>
        </div>
      </div>
    </div>
  );
}
