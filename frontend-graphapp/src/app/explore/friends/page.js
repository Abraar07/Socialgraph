"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function FriendsPage() {

  const router = useRouter();

  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /*
   * =========================
   * LOAD LOGGED-IN USER
   * =========================
   */

  useEffect(() => {

    const storedUser = localStorage.getItem("socialgraph_user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {

      const currentUser = JSON.parse(storedUser);

      setUser(currentUser);

      fetchFriends(currentUser.userId);

    } catch (err) {

      localStorage.removeItem("socialgraph_user");
      router.push("/login");

    }

  }, [router]);


  /*
   * =========================
   * GET FRIENDS
   * =========================
   */

  const fetchFriends = async (userId) => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/users/${userId}/friends`
      );

      if (!response.ok) {
        throw new Error("Unable to load friends");
      }

      const data = await response.json();

      setFriends(data);

    } catch (err) {

      setError(
        err.message || "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };


  /*
   * =========================
   * SEARCH FRIENDS
   * =========================
   */

  const filteredFriends = useMemo(() => {

    const query = search.trim().toLowerCase();

    if (!query) {
      return friends;
    }

    return friends.filter((friend) => {

      const name = String(friend.name || "").toLowerCase();

      const userId = String(friend.userId || "");

      return (
        name.includes(query) ||
        userId.startsWith(query)
      );

    });

  }, [friends, search]);


  /*
   * =========================
   * LOGOUT
   * =========================
   */

  const handleLogout = () => {

    localStorage.removeItem("socialgraph_user");

    router.push("/");

  };


  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {

    return (
      <main className="min-h-screen bg-[#08090d] text-white">

        <Navbar
          user={user}
          onLogout={handleLogout}
        />

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-zinc-500">
            Loading your friends...
          </div>

        </div>

      </main>
    );

  }


  return (
    <main className="min-h-screen bg-[#08090d] text-white">

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar
        user={user}
        onLogout={handleLogout}
      />


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div className="mx-auto max-w-6xl px-6 py-12">


        {/* Back */}

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-violet-400"
        >
          ← Back to Explore
        </Link>


        {/* Heading */}

        <div className="mt-10">

          <p className="text-sm font-medium text-violet-400">
            Your network
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            My Friends
          </h1>

          <p className="mt-3 text-zinc-500">
            Everyone you're connected with on SocialGraph.
          </p>

        </div>


        {/* =========================
            SEARCH
        ========================= */}

        <div className="relative mt-8 max-w-3xl">

          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your friends by name or User ID..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-12 py-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/50"
          />

        </div>


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>

        )}


        {/* =========================
            FRIEND COUNT
        ========================= */}

        <div className="mt-10 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-semibold">
              {search
                ? "Search results"
                : "All friends"
              }
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              {filteredFriends.length}{" "}
              {filteredFriends.length === 1
                ? "friend"
                : "friends"
              }
            </p>

          </div>

        </div>


        {/* =========================
            NO FRIENDS
        ========================= */}

        {friends.length === 0 && (

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-xl text-violet-400">
              S
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              You don't have any friends yet.
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Explore SocialGraph and start building your network.
            </p>

            <Link
              href="/explore"
              className="mt-6 inline-flex rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold transition hover:bg-violet-400"
            >
              Find People →
            </Link>

          </div>

        )}


        {/* =========================
            NO SEARCH RESULTS
        ========================= */}

        {friends.length > 0 &&
          filteredFriends.length === 0 && (

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">

              <h3 className="text-lg font-semibold">
                No friends found
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Try searching with a different name or User ID.
              </p>

            </div>

          )}


        {/* =========================
            FRIEND LIST
        ========================= */}

        {filteredFriends.length > 0 && (

          <div className="mt-8 space-y-3">

            {filteredFriends.map((friend) => (

              <Link
                key={friend.userId}
                href={`/profile/${friend.userId}`}
                className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-violet-400/30 hover:bg-violet-500/[0.04]"
              >

                {/* Avatar */}

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl font-semibold shadow-lg shadow-violet-500/10">
                  {friend.name?.charAt(0)?.toUpperCase()}
                </div>


                {/* User information */}

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-base font-semibold">
                    {friend.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {friend.region}
                    {friend.age
                      ? ` · ${friend.age} years old`
                      : ""
                    }
                  </p>

                </div>


                {/* User ID */}

                <div className="hidden rounded-xl border border-white/10 bg-black/20 px-4 py-2 sm:block">

                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    User ID
                  </p>

                  <p className="mt-1 font-mono text-sm text-violet-300">
                    {friend.userId}
                  </p>

                </div>


                {/* Arrow */}

                <div className="text-lg text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-400">
                  →
                </div>

              </Link>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}


/*
 * =========================
 * NAVBAR
 * =========================
 */

function Navbar({ user, onLogout }) {

  return (
    <nav className="border-b border-white/10">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-lg font-bold shadow-lg shadow-violet-500/20">
            S
          </div>

          <span className="text-2xl font-semibold">
            Social<span className="text-violet-400">
              Graph
            </span>
          </span>

        </Link>


        {/* Right side */}

        <div className="flex items-center gap-7">

          <Link
            href="/explore"
            className="text-sm font-medium text-white transition hover:text-violet-400"
          >
            Explore
          </Link>


          {user && (

            <span className="hidden text-sm text-zinc-400 sm:block">
              {user.name}
            </span>

          )}


          <button
            onClick={onLogout}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
}