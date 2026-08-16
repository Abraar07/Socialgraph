"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProfilePage() {

    const params = useParams();
    const router = useRouter();

    const userId = params.userId;

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [isFriend, setIsFriend] = useState(false);

    const [loading, setLoading] = useState(true);
    const [friendLoading, setFriendLoading] = useState(false);

    const [error, setError] = useState("");

    const API = process.env.NEXT_PUBLIC_API_URL;


    /*
     * ==========================
     * LOAD PROFILE
     * ==========================
     */

    useEffect(() => {

        const loadProfile = async () => {

            try {

                /*
                 * Check whether someone is logged in.
                 */

                const storedUser =
                    localStorage.getItem("socialgraph_user");

                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                }


                /*
                 * Get profile from Spring Boot.
                 */

                const response = await fetch(
                    `${API}/${userId}`
                );


                if (!response.ok) {

                    if (response.status === 404) {
                        throw new Error("User not found");
                    }

                    throw new Error("Unable to load profile");
                }


                const profileUser = await response.json();

                setUser(profileUser);


                /*
                 * Check friendship only when:
                 *
                 * 1. Someone is logged in
                 * 2. They are viewing another user
                 */

                if (
                    storedUser &&
                    JSON.parse(storedUser).userId !== Number(userId)
                ) {

                    const loggedUser = JSON.parse(storedUser);

                    const statusResponse = await fetch(
                        `${API}/${loggedUser.userId}/friends/${userId}/status`
                    );


                    if (statusResponse.ok) {

                        const status =
                            await statusResponse.json();

                        setIsFriend(status.friends);
                    }
                }


            } catch (err) {

                setError(
                    err.message || "Something went wrong"
                );

            } finally {

                setLoading(false);
            }
        };


        if (userId) {
            loadProfile();
        }

    }, [userId]);


    /*
     * ==========================
     * ADD FRIEND
     * ==========================
     */

    const handleAddFriend = async () => {

        /*
         * Visitor
         */

        if (!currentUser) {

            router.push("/login");

            return;
        }


        /*
         * Don't allow adding yourself.
         */

        if (currentUser.userId === Number(userId)) {
            return;
        }


        setFriendLoading(true);
        setError("");


        try {

            const response = await fetch(
                `${API}/${currentUser.userId}/friends/${userId}`,
                {
                    method: "POST",
                }
            );


            const data = await response.text();


            if (!response.ok) {

                throw new Error(
                    data || "Unable to add friend"
                );
            }


            /*
             * Update UI immediately.
             */

            setIsFriend(true);


        } catch (err) {

            setError(
                err.message || "Unable to add friend"
            );

        } finally {

            setFriendLoading(false);
        }
    };


    /*
     * ==========================
     * UNFRIEND
     * ==========================
     */

    const handleUnfriend = async () => {

        if (!currentUser) {
            router.push("/login");
            return;
        }


        setFriendLoading(true);
        setError("");


        try {

            const response = await fetch(
                `${API}/${currentUser.userId}/friends/${userId}`,
                {
                    method: "DELETE",
                }
            );


            const data = await response.text();


            if (!response.ok) {

                throw new Error(
                    data || "Unable to unfriend"
                );
            }


            /*
             * Update UI immediately.
             *
             * The FRIEND relationship has now
             * been deleted from CognoDB.
             */

            setIsFriend(false);


        } catch (err) {

            setError(
                err.message || "Unable to unfriend"
            );

        } finally {

            setFriendLoading(false);
        }
    };


    /*
    * ==========================
    * DELETE ACCOUNT
    * ==========================
    */

    const handleDeleteAccount = async () => {

        if (!currentUser) {
            router.push("/login");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setFriendLoading(true);
        setError("");

        try {

            const response = await fetch(
                `${API}/${currentUser.userId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data || "Unable to delete account"
                );
            }

            /*
            * Account deleted successfully.
            * Remove the local login session.
            */

            localStorage.removeItem("socialgraph_user");

            /*
            * Go back to home page.
            */

            router.push("/");

        } catch (err) {

            setError(
                err.message || "Unable to delete account"
            );

        } finally {

            setFriendLoading(false);

        }
    };


    /*
     * ==========================
     * LOADING
     * ==========================
     */

    if (loading) {

        return (
            <main className="min-h-screen bg-[#08090d] text-white">

                <Navbar />

                <div className="flex min-h-[80vh] items-center justify-center">

                    <div className="text-sm text-zinc-500">
                        Loading profile...
                    </div>

                </div>

            </main>
        );
    }


    /*
     * ==========================
     * ERROR
     * ==========================
     */

    if (error && !user) {

        return (
            <main className="min-h-screen bg-[#08090d] text-white">

                <Navbar />

                <div className="flex min-h-[80vh] items-center justify-center px-6">

                    <div className="text-center">

                        <h1 className="text-2xl font-semibold">
                            Profile not found
                        </h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            {error}
                        </p>

                        <Link
                            href="/explore"
                            className="mt-6 inline-block rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold transition hover:bg-violet-400"
                        >
                            Back to Explore
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    /*
     * ==========================
     * PROFILE STATE
     * ==========================
     */

    const isOwnProfile =
        currentUser &&
        currentUser.userId === Number(userId);


    return (
        <main className="min-h-screen bg-[#08090d] text-white">

            <Navbar currentUser={currentUser} />


            <div className="mx-auto max-w-5xl px-6 py-12">

                {/* Back */}

                <Link
                    href="/explore"
                    className="text-sm text-zinc-500 transition hover:text-white"
                >
                    ← Back to Explore
                </Link>


                {/* Profile Card */}

                <section className="mx-auto mt-8 max-w-2xl">

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">


                        {/* Gradient header */}

                        <div className="relative h-32 bg-gradient-to-r from-violet-600/30 via-purple-500/10 to-indigo-500/20">

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_60%)]" />

                        </div>


                        {/* Profile content */}

                        <div className="px-7 pb-8 sm:px-10">


                            {/* Avatar */}

                            <div className="-mt-14 flex items-end justify-between">

                                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-[#08090d] bg-gradient-to-br from-violet-500 to-indigo-600 text-4xl font-semibold shadow-xl">

                                    {user.name?.charAt(0)?.toUpperCase()}

                                </div>

                            </div>


                            {/* Name */}

                            <div className="mt-6">

                                <h1 className="text-3xl font-semibold tracking-tight">
                                    {user.name}
                                </h1>

                                <p className="mt-2 text-sm text-zinc-500">
                                    {user.region} · {user.age} years old
                                </p>

                            </div>


                            {/* User ID */}

                            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">

                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                                    User ID
                                </p>

                                <p className="mt-1 font-mono text-lg text-violet-300">
                                    {user.userId}
                                </p>

                            </div>


                            {/* Error */}

                            {error && (

                                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                                    {error}
                                </div>

                            )}


                            {/* Action */}

                            <div className="mt-7">

                                {isOwnProfile ? (

                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={friendLoading}
                                        className="w-full rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {friendLoading
                                            ? "Deleting account..."
                                            : "Delete Account"
                                        }

                                    </button>

                                ) : isFriend ? (

                                    <button
                                        onClick={handleUnfriend}
                                        disabled={friendLoading}
                                        className="w-full rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {friendLoading
                                            ? "Unfriending..."
                                            : "− Unfriend"
                                        }

                                    </button>

                                ) : (

                                    <button
                                        onClick={handleAddFriend}
                                        disabled={friendLoading}
                                        className="w-full rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {friendLoading
                                            ? "Adding..."
                                            : "+ Add Friend"
                                        }

                                    </button>

                                )}

                            </div>


                            {/* Small information */}

                            <div className="mt-8 border-t border-white/10 pt-6">

                                <p className="text-center text-sm text-zinc-600">
                                    Discover people, build connections,
                                    and grow your network.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}


/*
 * ==========================
 * NAVBAR
 * ==========================
 */

function Navbar({ currentUser }) {

    return (
        <nav className="border-b border-white/10 bg-[#08090d]/80 backdrop-blur-xl">

            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">


                {/* Logo */}

                <Link
                    href="/"
                    className="flex items-center gap-3"
                >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-500/20">

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


                {/* Navigation */}

                <div className="flex items-center gap-5">

                    <Link
                        href="/explore"
                        className="text-sm text-zinc-400 transition hover:text-white"
                    >
                        Explore
                    </Link>


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
                                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                Logout
                            </button>

                        </>

                    ) : (

                        <>

                            <Link
                                href="/login"
                                className="text-sm text-zinc-400 transition hover:text-white"
                            >
                                Sign in
                            </Link>

                            <Link
                                href="/create"
                                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold transition hover:bg-white/[0.1]"
                            >
                                Create account
                            </Link>

                        </>

                    )}

                </div>

            </div>

        </nav>
    );
}