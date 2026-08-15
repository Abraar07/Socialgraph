"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAccount() {

  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    name: "",
    gender: "1",
    age: "",
    region: "",
  });

  const [createdUser, setCreatedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        API,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name,
            gender: Number(form.gender),
            age: Number(form.age),
            region: form.region,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message || "Unable to create account"
        );

      }


      /*
       * Don't save the session yet.
       *
       * First show the user their generated ID.
       */

      setCreatedUser(data);

    } catch (err) {

      setError(
        err.message || "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };


  const continueToHome = () => {

    localStorage.setItem(
      "socialgraph_user",
      JSON.stringify(createdUser)
    );

    router.push("/");

  };


  /*
   * ==========================
   * ACCOUNT CREATED SCREEN
   * ==========================
   */

  if (createdUser) {

    return (
      <main className="min-h-screen bg-[#08090d] text-white">

        <div className="flex min-h-screen items-center justify-center px-6">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15 text-2xl text-violet-400">
              ✓
            </div>


            <h1 className="text-3xl font-semibold">
              Account Created!
            </h1>


            <p className="mt-3 text-zinc-400">
              Welcome to SocialGraph,{" "}
              <span className="text-white">
                {createdUser.name}
              </span>
            </p>


            <div className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-6">

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Your User ID
              </p>

              <p className="mt-3 font-mono text-3xl font-semibold text-violet-300">
                {createdUser.userId}
              </p>

            </div>


            <p className="mt-5 text-sm leading-6 text-zinc-500">
              Save this ID. You will use it to sign in to
              your SocialGraph account later.
            </p>


            <button
              onClick={continueToHome}
              className="mt-8 w-full rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-semibold transition hover:bg-violet-400"
            >
              Continue to SocialGraph →
            </button>

          </div>

        </div>

      </main>
    );

  }


  /*
   * ==========================
   * CREATE ACCOUNT FORM
   * ==========================
   */

  return (
    <main className="min-h-screen bg-[#08090d] text-white">

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">

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
              Create account
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Join the SocialGraph network.
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


              {/* Name */}

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Name
                </label>

                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />

              </div>


              {/* Gender */}

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Gender
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#111218] px-4 py-3 text-sm outline-none focus:border-violet-400/50"
                >

                  <option value="1">
                    Male
                  </option>

                  <option value="0">
                    Female
                  </option>

                </select>

              </div>


              {/* Age */}

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Age
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  max="120"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />

              </div>


              {/* Region */}

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Region
                </label>

                <input
                  required
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="Chennai, Tokyo, Mumbai..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
                />

              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "Creating account..."
                  : "Create Account"
                }

              </button>

            </form>


            <div className="mt-7 text-center text-sm text-zinc-500">

              Already have an account?

              <Link
                href="/login"
                className="ml-2 text-violet-400 hover:text-violet-300"
              >
                Sign in
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}