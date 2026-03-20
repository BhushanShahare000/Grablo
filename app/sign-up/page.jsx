"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/app/components/MapPicker"), { ssr: false });

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [role, setRole] = useState("CUSTOMER");
    const [shopName, setShopName] = useState("");
    const [shopAddress, setShopAddress] = useState("");
    const [latitude, setLatitude] = useState(20.5937); // Default to India center
    const [longitude, setLongitude] = useState(78.9629);

    async function handleSignup(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, email, password, role,
                    shopName: role === "VENDOR" ? shopName : undefined,
                    shopAddress: role === "VENDOR" ? shopAddress : undefined,
                    latitude: role === "VENDOR" ? latitude : undefined,
                    longitude: role === "VENDOR" ? longitude : undefined
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Signup failed");
            } else {
                setSuccess(true);
                setTimeout(() => router.push("/login"), 1500);
            }
        } catch (err) {
            setError("Something went wrong. Try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4">
            <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20 backdrop-blur-sm">
                <h2 className="text-4xl font-black text-center text-indigo-600 mb-8 italic">
                    Join Grablo
                </h2>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
                        <button
                            type="button"
                            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${role === 'CUSTOMER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                            onClick={() => setRole('CUSTOMER')}
                        >
                            CUSTOMER
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${role === 'VENDOR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                            onClick={() => setRole('VENDOR')}
                        >
                            FOOD STALL
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Alex Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-black font-semibold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="alex@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-black font-semibold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-black font-semibold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                            required
                        />
                    </div>

                    {role === "VENDOR" && (
                        <div className="space-y-5 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Stall Name</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Grablo Pizza"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className="w-full bg-indigo-50/50 border-none rounded-2xl px-5 py-4 text-black font-semibold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Stall Location</label>
                                <div className="rounded-2xl overflow-hidden border-2 border-indigo-100 mb-2">
                                    <MapPicker
                                        initialPos={[latitude, longitude]}
                                        onLocationSelect={(lat, lng) => {
                                            setLatitude(lat);
                                            setLongitude(lng);
                                        }}
                                    />
                                </div>
                                <p className="text-[10px] text-indigo-400 italic">* Click on map to set your stall's exact position</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all duration-300 disabled:opacity-60 shadow-xl shadow-indigo-200 mt-4 uppercase tracking-tighter"
                    >
                        {loading ? "Creating your account..." : "Join Now"}
                    </button>
                </form>

                {error && (
                    <p className="text-red-500 text-sm text-center mt-4">{error}</p>
                )}

                {success && (
                    <p className="text-green-600 text-sm text-center mt-4">
                        Account created! Redirecting to login...
                    </p>
                )}

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <a href="/login" className="text-indigo-600 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}