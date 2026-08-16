"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ExplorePage() {
    
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [people, setPeople] = useState([]);
  const [friends, setFriends] = useState([]);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searching, setSearching] = useState(false);

  const [error, setError] = useState("");


  /*
   * ==========================
   * GET CURRENT USER
   * ==========================
   */

  useEffect(() => {

    const storedUser = localStorage.getItem("socialgraph_user");

    if (storedUser) {

      try {

        const user = JSON.parse(storedUser);

        setCurrentUser(user);

      } catch {

        localStorage.removeItem("socialgraph_user");

      }

    }

    /*
     * Important:
     * We must wait until localStorage has been checked
     * before deciding whether this is a visitor or
     * logged-in user.
     */

    setAuthChecked(true);

  }, []);


  /*
   * ==========================
   * LOAD PEOPLE
   * ==========================
   */

  useEffect(() => {

    /*
     * Don't load anything until we know
     * whether the user is logged in.
     */

    if (!authChecked) {
      return;
    }


    const loadPeople = async () => {

      try {

        setLoadingPeople(true);
        setError("");

        let url;


        /*
         * LOGGED-IN USER
         *
         * Existing/new users:
         *
         * /discover?userId=1001
         *
         * Backend decides:
         *
         * - no friends -> random users
         * - has friends -> 2-hop recommendations
         */

        if (currentUser) {

          url = `${API}/discover?userId=${currentUser.userId}`;

        }


        /*
         * VISITOR
         *
         * No account/session.
         *
         * Get random public users.
         */

        else {

          url = `${API}/discover`;

        }


        const response = await fetch(url);


        if (!response.ok) {

          throw new Error("Unable to load people");

        }


        const data = await response.json();

        setPeople(data);


      } catch (err) {

        console.error(err);

        setError("Unable to load people right now.");

      } finally {

        setLoadingPeople(false);

      }

    };


    loadPeople();

  }, [currentUser, authChecked]);


  /*
   * ==========================
   * LOAD FRIENDS
   * ==========================
   */

  useEffect(() => {

    /*
     * Visitors don't have friends.
     */

    if (!currentUser) {

      setFriends([]);

      return;

    }


    const loadFriends = async () => {

      try {

        setLoadingFriends(true);


        const response = await fetch(
          `${API}/${currentUser.userId}/friends`
        );


        if (!response.ok) {

          throw new Error("Unable to load friends");

        }


        const data = await response.json();

        setFriends(data);


      } catch (err) {

        console.error(err);

      } finally {

        setLoadingFriends(false);

      }

    };


    loadFriends();

  }, [currentUser]);


  /*
   * ==========================
   * SEARCH
   * ==========================
   */

  useEffect(() => {

    /*
     * Empty search
     */

    if (!search.trim()) {

      setSearchResults([]);

      return;

    }


    const timeout = setTimeout(async () => {

      try {

        setSearching(true);


        /*
         * Backend:
         *
         * GET /api/users/search?query=rah
         *
         * Supports:
         * - name
         * - user ID
         */

        const response = await fetch(
          `${API}/search?query=${encodeURIComponent(
            search.trim()
          )}`
        );


        if (!response.ok) {

          throw new Error("Search failed");

        }


        const data = await response.json();

        setSearchResults(data);


      } catch (err) {

        console.error(err);

        setSearchResults([]);

      } finally {

        setSearching(false);

      }

    }, 300);


    return () => clearTimeout(timeout);

  }, [search]);


  /*
   * ==========================
   * USER CARD
   * ==========================
   */

  const UserCard = ({ user }) => {

    return (

      <Link
        href={`/profile/${user.userId}`}
        className="
          group
          block
          min-w-[280px]
          max-w-[280px]
          rounded-2xl
          border
          border-white/10
          bg-white/[0.03]
          p-6
          transition
          duration-300
          hover:-translate-y-1
          hover:border-violet-400/30
          hover:bg-white/[0.05]
        "
      >


        {/* Avatar */}

        <div
          className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-violet-500
            to-purple-600
            text-3xl
            font-semibold
            text-white
            shadow-lg
            shadow-violet-500/20
          "
        >

          {user.name?.charAt(0)?.toUpperCase()}

        </div>


        {/* Name */}

        <h3 className="mt-5 text-lg font-semibold text-white">

          {user.name}

        </h3>


        {/* Region */}

        <p className="mt-1 text-sm text-zinc-500">

          {user.region}

        </p>


        {/* Age */}

        <p className="mt-1 text-sm text-zinc-600">

          {user.age} years old

        </p>


        {/* User ID */}

        <div
          className="
            mt-5
            rounded-xl
            border
            border-white/10
            bg-black/20
            px-4
            py-3
          "
        >

          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-zinc-600
            "
          >
            User ID
          </p>


          <p className="mt-1 font-mono text-sm text-violet-300">

            {user.userId}

          </p>

        </div>


        {/* View Profile */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            px-4
            py-3
            text-sm
            font-medium
            text-zinc-300
            transition
            group-hover:border-violet-400/30
            group-hover:text-white
          "
        >

          View Profile →

        </div>

      </Link>

    );

  };


  /*
   * ==========================
   * PAGE
   * ==========================
   */

  return (

    <main className="min-h-screen bg-[#08090d] text-white">


      {/* =========================
          NAVBAR
      ========================== */}

      <header className="border-b border-white/10">

        <div
          className="
            mx-auto
            flex
            h-20
            max-w-[1600px]
            items-center
            justify-between
            px-8
          "
        >


          {/* Logo */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-violet-500
                text-lg
                font-bold
                shadow-lg
                shadow-violet-500/20
              "
            >
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


            {/* Explore */}

            <span className="font-medium text-white">

              Explore

            </span>


            {/* Logged-in */}

            {currentUser ? (

              <>

                <Link
                    href={`/profile/${currentUser.userId}`}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-xs font-semibold">
                        {currentUser.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <span>
                        {currentUser.name}
                    </span>
                </Link>


                <button
                  onClick={() => {

                    localStorage.removeItem(
                      "socialgraph_user"
                    );

                    window.location.href = "/";

                  }}
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    transition
                    hover:bg-white/[0.08]
                  "
                >

                  Logout

                </button>

              </>

            ) : (

              /* Visitor */

              <>

                <Link
                  href="/login"
                  className="
                    text-zinc-400
                    transition
                    hover:text-white
                  "
                >

                  Sign in

                </Link>


                <Link
                  href="/create"
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    transition
                    hover:bg-white/[0.08]
                  "
                >

                  Create account

                </Link>

              </>

            )}

          </div>

        </div>

      </header>


      {/* =========================
          MAIN
      ========================== */}

      <div
        className="
          mx-auto
          max-w-[1600px]
          px-8
          py-16
        "
      >


        {/* Heading */}

        <div className="max-w-3xl">

          <p className="text-sm font-medium text-violet-400">

            Discover your network

          </p>


          <h1
            className="
              mt-4
              text-5xl
              font-semibold
              tracking-tight
            "
          >

            Explore people.

          </h1>


          <p className="mt-4 text-lg text-zinc-500">

            Discover new people, find connections, and build your
            SocialGraph network.

          </p>

        </div>


        {/* =========================
            SEARCH
        ========================== */}

        <div className="relative mt-12 max-w-5xl">

          <div
            className="
              flex
              items-center
              rounded-2xl
              border
              border-violet-400/30
              bg-white/[0.04]
              px-5
              transition
              focus-within:border-violet-400/60
            "
          >

            <span className="mr-4 text-xl text-zinc-500">

              ⌕

            </span>


            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search people by name or User ID..."
              className="
                w-full
                bg-transparent
                py-5
                text-base
                text-white
                outline-none
                placeholder:text-zinc-600
              "
            />

          </div>


          {/* =========================
              SEARCH RESULTS
          ========================== */}

          {search.trim() && (

            <div
              className="
                absolute
                left-0
                right-0
                top-full
                z-20
                mt-3
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-[#111217]
                shadow-2xl
              "
            >

              {searching ? (

                <div className="px-6 py-5 text-sm text-zinc-500">

                  Searching...

                </div>

              ) : searchResults.length === 0 ? (

                <div className="px-6 py-8 text-center">

                  <p className="text-zinc-400">

                    No users found.

                  </p>


                  <p className="mt-1 text-sm text-zinc-600">

                    Try another name or User ID.

                  </p>

                </div>

              ) : (

                <div className="max-h-[400px] overflow-y-auto">

                  {searchResults.map((user) => (

                    <Link
                      key={user.userId}
                      href={`/profile/${user.userId}`}
                      className="
                        flex
                        items-center
                        gap-4
                        border-b
                        border-white/5
                        px-5
                        py-4
                        transition
                        last:border-0
                        hover:bg-white/[0.04]
                      "
                    >

                      {/* Avatar */}

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-violet-500/20
                          font-semibold
                          text-violet-300
                        "
                      >

                        {user.name
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </div>


                      {/* Details */}

                      <div className="min-w-0">

                        <p className="font-medium text-white">

                          {user.name}

                        </p>


                        <p className="text-sm text-zinc-500">

                          {user.region} · ID {user.userId}

                        </p>

                      </div>

                    </Link>

                  ))}

                </div>

              )}

            </div>

          )}

        </div>


        {/* Error */}

        {error && (

          <div
            className="
              mt-8
              rounded-xl
              border
              border-red-400/20
              bg-red-400/5
              px-5
              py-4
              text-sm
              text-red-300
            "
          >

            {error}

          </div>

        )}


        {/* =========================
            PEOPLE YOU MAY KNOW
        ========================== */}

        <section className="mt-20">

          <div className="flex items-end justify-between">

            <div>

              <h2 className="text-2xl font-semibold">

                People You May Know

              </h2>


              <p className="mt-2 text-sm text-zinc-500">

                Discover people who could become part of your
                network.

              </p>

            </div>

          </div>


          {/* Horizontal cards */}

          <div className="mt-7 overflow-x-auto pb-5">

            <div className="flex gap-6">

              {loadingPeople ? (

                Array.from({ length: 5 }).map((_, index) => (

                  <div
                    key={index}
                    className="
                      h-[430px]
                      min-w-[350px]
                      animate-pulse
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.03]
                    "
                  />

                ))

              ) : people.length === 0 ? (

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    px-8
                    py-10
                    text-zinc-500
                  "
                >

                  No people to discover right now.

                </div>

              ) : (

                people.map((user) => (

                  <UserCard
                    key={user.userId}
                    user={user}
                  />

                ))

              )}

            </div>

          </div>

        </section>


        {/* =========================
            MY FRIENDS
        ========================== */}

        {currentUser && (

          <section className="mt-16">

            <div className="flex items-end justify-between">

              <div>

                <h2 className="text-2xl font-semibold">

                  My Friends

                </h2>


                <p className="mt-2 text-sm text-zinc-500">

                  People already connected to your network.

                </p>

              </div>


              <a
                href="/explore/friends"
                className="text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                View all friends →
            </a>

            </div>


            {/* Horizontal friends */}

            <div className="mt-7 overflow-x-auto pb-5">

              <div className="flex gap-6">

                {loadingFriends ? (

                  Array.from({ length: 4 }).map((_, index) => (

                    <div
                      key={index}
                      className="
                        h-[430px]
                        min-w-[350px]
                        animate-pulse
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.03]
                      "
                    />

                  ))

                ) : friends.length === 0 ? (

                  <div
                    className="
                      rounded-2xl
                      border
                      border-white/10
                      px-8
                      py-10
                    "
                  >

                    <p className="text-zinc-400">

                      You don't have any friends yet.

                    </p>


                    <p className="mt-2 text-sm text-zinc-600">

                      Search for people above and start building
                      your network.

                    </p>

                  </div>

                ) : (

                  friends.map((user) => (

                    <UserCard
                      key={user.userId}
                      user={user}
                    />

                  ))

                )}

              </div>

            </div>

          </section>

        )}

      </div>

    </main>

  );

}