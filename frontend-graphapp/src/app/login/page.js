"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {

  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {

  e.preventDefault();

  setError("");
  setLoading(true);

  try {

    const response = await fetch(
      `http://localhost:8080/api/users/${userId}`
    );

    // Check status BEFORE trying to parse JSON
    if (!response.ok) {

      if (response.status === 404) {
        throw new Error("User ID not available");
      }

      throw new Error("Unable to sign in");
    }

    // Only parse JSON when request was successful
    const user = await response.json();

    // Save logged-in user
    localStorage.setItem(
      "socialgraph_user",
      JSON.stringify(user)
    );

    // Go to home
    router.push("/");

  } catch (err) {

    setError(
      err.message || "Something went wrong"
    );

  } finally {

    setLoading(false);

  }
};


  return (
    <main className="min-h-screen bg-[#08090d] text-white">

      <div className="flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-md">


          {/* Logo */}

          <Link
            href="/"
            className="mb-10 flex items-center justify-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500">
              <span className="text-sm font-bold">
                S
              </span>
            </div>

            <span className="text-xl font-semibold">
              Social<span className="text-violet-400">
                Graph
              </span>
            </span>

          </Link>


          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl sm:p-9">

            <h1 className="text-3xl font-semibold">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Sign in using your SocialGraph User ID.
            </p>


            {error && (

              <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {error}
              </div>

            )}


            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  User ID
                </label>

                <input
                  required
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 101004"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />

              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "Signing in..."
                  : "Sign In"
                }

              </button>

            </form>


            <div className="mt-7 text-center text-sm text-zinc-500">

              Don't have an account?

              <Link
                href="/create"
                className="ml-2 text-violet-400 hover:text-violet-300"
              >
                Create one
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}