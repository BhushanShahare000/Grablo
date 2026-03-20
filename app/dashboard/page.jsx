"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && status === "unauthenticated") {
            router.push("/login");
        } else if (mounted && status === "authenticated") {
            if (session.user.role === "ADMIN") {
                router.push("/dashboard/admin");
            } else if (session.user.role === "VENDOR") {
                router.push("/dashboard/vendor");
            } else if (session.user.role === "CUSTOMER") {
                router.push("/");
            }
        }
    }, [status, router, mounted, session]);

    if (!mounted || status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Loading...
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-indigo-600 mb-2">Dashboard</h1>
                <p className="text-gray-600 mb-6">
                    Welcome, <span className="font-semibold">{session.user.email}</span>
                </p>

                <div className="flex justify-center space-x-4 mb-6">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                        Role: {session.user.role}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        ID: {session.user.id}
                    </span>
                </div>

                <button
                    onClick={() => signOut()}
                    className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}