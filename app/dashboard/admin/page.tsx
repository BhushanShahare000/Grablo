"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { data: session, status } = useSession() as { data: any, status: string };
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "ADMIN") {
            router.push("/");
        } else {
            fetchAdminData();
        }
    }, [status, session, router]);

    const fetchAdminData = async () => {
        try {
            const res = await fetch("/api/admin/data");
            const data = await res.json();
            setUsers(data.users || []);
            setShops(data.shops || []);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <nav className="bg-white shadow-sm py-4 mb-8">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-red-600">Admin Panel</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium">Admin: {session?.user?.name}</span>
                        <button onClick={() => router.push("/")} className="text-gray-500 hover:text-red-600 font-bold">Storefront</button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 space-y-8">
                {/* Users Table */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 text-sm uppercase">
                                    <th className="py-4 font-black">Name</th>
                                    <th className="py-4 font-black">Email</th>
                                    <th className="py-4 font-black">Role</th>
                                    <th className="py-4 font-black">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user: any) => (
                                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-4 font-medium text-gray-800">{user.name}</td>
                                        <td className="py-4 text-gray-600">{user.email}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                                user.role === 'VENDOR' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {user.role === 'VENDOR' ? 'SHOPKEEPER' : user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Shops Table */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Shop Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 text-sm uppercase">
                                    <th className="py-4 font-black">Shop Name</th>
                                    <th className="py-4 font-black">Owner</th>
                                    <th className="py-4 font-black">Delivery</th>
                                    <th className="py-4 font-black">Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shops.map((shop: any) => (
                                    <tr key={shop.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-4 font-medium text-gray-800">{shop.name}</td>
                                        <td className="py-4 text-gray-600">{shop.owner?.name || 'N/A'}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${shop.deliveryEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {shop.deliveryEnabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="py-4 font-black text-indigo-600">{shop.deliveryRange} km</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
