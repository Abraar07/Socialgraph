"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {

  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Check whether a user is already logged in
  useEffect(() => {

    const savedUser = localStorage.getItem("socialgraph_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("socialgraph_user");
      }
    }

    setLoaded(true);

  }, []);


  const handleLogout = () => {

    localStorage.removeItem("socialgraph_user");

    setUser(null);
  };


  // Prevent UI flicker while checking localStorage
  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#08090d]" />
    );
  }


  return (
    <main className="min-h-screen overflow-hidden bg-[#08090d] text-white">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none fixed inset-0">

        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute bottom-[-250px] left-[-150px] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[130px]" />

        <div className="absolute right-[-150px] top-[30%] h-[450px] w-[450px] rounded-full bg-fuchsia-600/5 blur-[130px]" />

      </div>


      {/* ================= NAVBAR ================= */}

      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* LOGO */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-500/20">

            <span className="text-sm font-bold">
              S
            </span>

          </div>

          <span className="text-xl font-semibold tracking-tight">

            Social
            <span className="text-violet-400">
              Graph
            </span>

          </span>

        </Link>


        {/* RIGHT SIDE */}

        <div className="flex items-center gap-3">

          {/* Explore is always available */}

          <Link
            href="/explore"
            className="rounded-xl px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            Explore
          </Link>


          {/* ================= VISITOR ================= */}

          {!user && (
            <>

              <Link
                href="/login"
                className="hidden px-4 py-2.5 text-sm text-zinc-300 transition hover:text-white sm:block"
              >
                Sign in
              </Link>


              <Link
                href="/create"
                className="rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:border-white/20 hover:bg-white/12"
              >
                Create account
              </Link>

            </>
          )}


          {/* ================= LOGGED IN ================= */}

          {user && (
            <>

              {/* User name */}

              <div className="hidden items-center gap-2 px-3 text-sm text-zinc-300 sm:flex">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>

                <span>
                  {user.name}
                </span>

              </div>


              {/* Logout */}

              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>

            </>
          )}

        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-16 px-6 pb-20 pt-10 lg:grid-cols-2 lg:px-10 lg:pt-0">


        {/* ================= LEFT ================= */}

        <div className="max-w-2xl">

          {/* Badge */}

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400 backdrop-blur">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />

            {user
              ? `Welcome back, ${user.name}`
              : "Discover your network"
            }

          </div>


          {/* Heading */}

          <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">

            People are

            <br />

            <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              connected.
            </span>

            <br />

            Discover how.

          </h1>


          {/* Description */}

          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">

            Explore people, discover new connections, and
            build your own network through meaningful
            relationships.

          </p>


          {/* ================= BUTTONS ================= */}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">


            {/* ================= LOGGED IN ================= */}

            {user && (

              <Link
                href="/explore"
                className="group flex items-center justify-center gap-3 rounded-xl bg-violet-500 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-400"
              >

                Explore people

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>

              </Link>

            )}


            {/* ================= VISITOR ================= */}

            {!user && (

              <>

                <Link
                  href="/create"
                  className="group flex items-center justify-center gap-3 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-400"
                >

                  Create your account

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>

                </Link>


                <Link
                  href="/explore"
                  className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                >

                  Explore people

                  <span>
                    ↗
                  </span>

                </Link>

              </>

            )}

          </div>


          {/* ================= USER ID INFO ================= */}

          {user && (

            <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">

              <div>

                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Your User ID
                </p>

                <p className="mt-0.5 font-mono text-sm font-medium text-violet-300">
                  {user.userId}
                </p>

              </div>

            </div>

          )}


          {/* ================= VISITOR INFO ================= */}

          {!user && (

            <div className="mt-8 flex items-center gap-3 text-xs text-zinc-500">

              <div className="flex -space-x-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#08090d] bg-violet-500 text-[10px] font-bold">
                  A
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#08090d] bg-indigo-500 text-[10px] font-bold">
                  R
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#08090d] bg-fuchsia-500 text-[10px] font-bold">
                  N
                </div>

              </div>

              <span>
                Explore the network without an account
              </span>

            </div>

          )}

        </div>


        {/* ================= GRAPH ================= */}

        <div className="relative mx-auto h-[460px] w-full max-w-[520px] lg:h-[540px]">


          {/* Glow */}

          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[90px]" />


          {/* Outer rings */}

          <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

          <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />


          {/* Connection lines */}

          <div className="absolute left-1/2 top-1/2 h-px w-[250px] -translate-x-1/2 -translate-y-1/2 rotate-[25deg] bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

          <div className="absolute left-1/2 top-1/2 h-px w-[260px] -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

          <div className="absolute left-1/2 top-1/2 h-px w-[270px] -translate-x-1/2 -translate-y-1/2 rotate-[145deg] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

          <div className="absolute left-1/2 top-1/2 h-px w-[230px] -translate-x-1/2 -translate-y-1/2 rotate-[-145deg] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />


          {/* Central node */}

          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-violet-300/30 bg-[#151321] shadow-[0_0_70px_rgba(139,92,246,0.25)]">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">

              <div className="text-center">

                <div className="text-xl font-bold">
                  SG
                </div>

                <div className="mt-0.5 text-[8px] uppercase tracking-[0.2em] text-white/60">
                  Network
                </div>

              </div>

            </div>

          </div>


          {/* People */}

          <div className="absolute left-[14%] top-[23%] animate-[float_5s_ease-in-out_infinite]">

            <Person
              initial="A"
              name="Alex"
              color="bg-violet-500"
            />

          </div>


          <div className="absolute right-[13%] top-[20%] animate-[float_5s_ease-in-out_1s_infinite]">

            <Person
              initial="R"
              name="Rahul"
              color="bg-indigo-500"
            />

          </div>


          <div className="absolute bottom-[18%] left-[18%] animate-[float_5s_ease-in-out_1.5s_infinite]">

            <Person
              initial="N"
              name="Nithish"
              color="bg-fuchsia-500"
            />

          </div>


          <div className="absolute bottom-[14%] right-[17%] animate-[float_5s_ease-in-out_2s_infinite]">

            <Person
              initial="V"
              name="Vivek"
              color="bg-blue-500"
            />

          </div>


          {/* Floating dots */}

          <div className="absolute left-[8%] top-[50%] h-2 w-2 animate-pulse rounded-full bg-violet-400" />

          <div className="absolute right-[7%] top-[48%] h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />

          <div className="absolute left-[50%] top-[7%] h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />

        </div>

      </section>

    </main>
  );
}


/* =========================
   PERSON
========================= */

function Person({ initial, name, color }) {

  return (

    <div className="flex flex-col items-center gap-2">

      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border border-white/20 ${color} shadow-xl`}
      >

        <span className="text-lg font-semibold">
          {initial}
        </span>

      </div>


      <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] text-zinc-400 backdrop-blur">
        {name}
      </div>

    </div>

  );
}