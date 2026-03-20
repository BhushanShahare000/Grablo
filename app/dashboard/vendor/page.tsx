"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapPicker = dynamic(() => import("@/app/components/MapPicker"), { ssr: false });

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
}

interface Shop {
    id: number;
    name: string;
    description: string | null;
    address: string;
    deliveryEnabled: boolean;
    deliveryRange: number;
    latitude: number;
    longitude: number;
    imageUrl: string | null;
    menuItems: MenuItem[];
}

export default function VendorDashboard() {
    const { data: session, status } = useSession() as { data: any, status: string };
    const router = useRouter();
    const [shop, setShop] = useState<Shop | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [deliveryEnabled, setDeliveryEnabled] = useState(false);
    const [deliveryRange, setDeliveryRange] = useState(5);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [newItem, setNewItem] = useState({ name: "", description: "", price: "", imageUrl: "" });

    const shopFileRef = useRef<HTMLInputElement>(null);
    const menuFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role !== "VENDOR") {
            router.push("/");
        } else {
            fetchShopData();
        }
    }, [status, session]);

    const fetchShopData = async () => {
        try {
            const res = await fetch("/api/vendor/shop");
            const data = await res.json();
            if (data.shop) {
                setShop(data.shop);
                setName(data.shop.name || "");
                setDescription(data.shop.description || "");
                setAddress(data.shop.address || "");
                setImageUrl(data.shop.imageUrl || "");
                setMenuItems(data.shop.menuItems || []);
                setDeliveryEnabled(data.shop.deliveryEnabled);
                setDeliveryRange(data.shop.deliveryRange);
                setLatitude(data.shop.latitude);
                setLongitude(data.shop.longitude);
            } else {
                if (typeof window !== "undefined" && "geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        setLatitude(pos.coords.latitude);
                        setLongitude(pos.coords.longitude);
                    }, null, { enableHighAccuracy: true });
                }
            }
        } catch (error) {
            console.error("Error fetching shop data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, target: "shop" | "menu") => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                if (target === "shop") {
                    setImageUrl(data.url);
                } else {
                    setNewItem({ ...newItem, imageUrl: data.url });
                }
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const updateShopSettings = async () => {
        if (!name || !address) {
            alert("Name and Location are required!");
            return;
        }

        try {
            const res = await fetch("/api/vendor/shop", {
                method: "PATCH",
                body: JSON.stringify({ name, description, address, deliveryEnabled, deliveryRange, latitude, longitude, imageUrl }),
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                alert("Spot profile updated successfully!");
                fetchShopData();
            }
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    };

    const addMenuItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/vendor/menu", {
                method: "POST",
                body: JSON.stringify(newItem),
                headers: { "Content-Type": "application/json" },
            });
            if (res.ok) {
                const addedItem = await res.json();
                setMenuItems([...menuItems, addedItem]);
                setNewItem({ name: "", description: "", price: "", imageUrl: "" });
            }
        } catch (error) {
            console.error("Error adding menu item:", error);
        }
    };

    const deleteMenuItem = async (id: number) => {
        try {
            const res = await fetch(`/api/vendor/menu?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setMenuItems(menuItems.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Establishing Command...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-32 selection:bg-primary/10 antialiased">
            <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <h1 className="text-sm font-black text-foreground uppercase tracking-tight">Control Center</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors">Surface</Link>
                        <p className="font-black text-foreground text-[11px] hidden sm:block bg-slate-100 px-3 py-1.5 rounded-lg border border-border/40">{session?.user?.name}</p>
                    </div>
                </div>
            </header>

            <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-8">
                {!shop ? (
                    <div className="bg-surface p-10 sm:p-20 rounded-[48px] shadow-2xl border border-border/20 text-center max-w-2xl mx-auto relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full z-0 animate-pulse"></div>
                        <h2 className="text-4xl font-black text-foreground mb-4 tracking-tighter italic relative z-10 uppercase">Launch Spot</h2>
                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-12 relative z-10">Define your visual identity</p>

                        <div className="space-y-8 text-left relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-2">Spot Title</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-border/60 rounded-2xl px-6 py-4 font-black text-foreground placeholder-slate-300 focus:ring-2 ring-primary/10 outline-none transition-all" placeholder="E.g. Hot Grill House" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-2">Location Handle</label>
                                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 border border-border/60 rounded-2xl px-6 py-4 font-black text-foreground placeholder-slate-300 focus:ring-2 ring-primary/10 outline-none transition-all" placeholder="E.g. South Mall, Gate 2" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-2">Display Visual</label>
                                <div
                                    onClick={() => shopFileRef.current?.click()}
                                    className="w-full h-44 bg-slate-50 border-2 border-dashed border-border/60 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all relative overflow-hidden"
                                >
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl mb-1">{isUploading ? '🔄' : '🖼️'}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">{isUploading ? 'Syncing...' : 'Upload System File'}</span>
                                        </div>
                                    )}
                                    <input type="file" ref={shopFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "shop")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-2">The Story</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border border-border/60 rounded-2xl px-6 py-4 font-black text-foreground h-32 focus:ring-2 ring-primary/10 outline-none transition-all" placeholder="Briefly describe your food's unique character..."></textarea>
                            </div>
                            <button onClick={updateShopSettings} className="w-full mt-6 bg-primary text-white py-6 rounded-[24px] font-black hover:bg-foreground transition-all shadow-xl shadow-primary/10 uppercase tracking-[0.4em] text-[10px] active:scale-95">Enable Live Feed</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT COLUMN: SETTINGS */}
                        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                            <div className="bg-surface p-8 rounded-[40px] shadow-sm border border-border/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] z-0"></div>
                                <h2 className="text-xl font-black text-foreground tracking-tighter italic uppercase mb-10 relative z-10">General</h2>
                                <div className="space-y-8 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-2">Display Name</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-border/60 rounded-xl px-5 py-3.5 font-black text-foreground text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-2">Hero Image</label>
                                        <div
                                            onClick={() => shopFileRef.current?.click()}
                                            className="h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:bg-white transition-all overflow-hidden"
                                        >
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="Spot" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl opacity-20">📸</span>
                                            )}
                                            <input type="file" ref={shopFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "shop")} />
                                        </div>
                                    </div>
                                    <button onClick={updateShopSettings} className="w-full bg-primary text-white py-5 rounded-2xl font-black hover:bg-foreground transition-all shadow-xl shadow-primary/10 uppercase tracking-[0.4em] text-[9px]">Apply Changes</button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: CATALOG */}
                        <div className="lg:col-span-12 xl:col-span-8 space-y-10">
                            <div className="bg-surface p-8 sm:p-12 rounded-[40px] shadow-sm border border-border/30 relative overflow-hidden">
                                <h2 className="text-2xl font-black text-foreground tracking-tighter italic uppercase mb-10 underline decoration-primary/20">Catalog Feed</h2>
                                <form onSubmit={addMenuItem} className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 border-b border-border/40 pb-12">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Asset Title</label>
                                        <input type="text" placeholder="Spicy Chicken Catalog" className="w-full bg-slate-50 border border-border/60 rounded-2xl px-6 py-4 font-black text-foreground" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Price Index</label>
                                        <input type="number" step="0.01" placeholder="9.99" className="w-full bg-slate-50 border border-border/60 rounded-2xl px-6 py-4 font-black text-foreground" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} required />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Catalog Visual</label>
                                        <div
                                            onClick={() => menuFileRef.current?.click()}
                                            className="w-full h-24 bg-slate-50 border-2 border-dashed border-border/60 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white transition-all overflow-hidden"
                                        >
                                            {newItem.imageUrl ? (
                                                <img src={newItem.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted">Tap to Upload System Image</span>
                                            )}
                                            <input type="file" ref={menuFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "menu")} />
                                        </div>
                                    </div>
                                    <textarea placeholder="Product description index..." className="sm:col-span-2 w-full bg-slate-50 border border-border/60 rounded-2xl px-6 py-4 font-black text-foreground h-24" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}></textarea>
                                    <button type="submit" className="sm:col-span-2 bg-foreground text-white py-5 rounded-[24px] font-black hover:bg-primary transition-all shadow-xl">Push to Production Feed</button>
                                </form>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {menuItems.map((item) => (
                                        <div key={item.id} className="group bg-slate-50 p-6 rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-border/30 flex flex-col">
                                            {item.imageUrl && (
                                                <div className="h-40 bg-slate-100 rounded-2xl mb-6 overflow-hidden">
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase leading-none">{item.name}</h4>
                                                    <p className="text-xl font-black text-primary tabular-nums tracking-tighter italic">${item.price.toFixed(2)}</p>
                                                </div>
                                                <button onClick={() => deleteMenuItem(item.id)} className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-xl text-slate-200 hover:text-secondary transition-all active:scale-90 border border-border/20">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                            <p className="text-muted text-[10px] font-bold leading-relaxed italic line-clamp-2">{item.description || "The original verified signature."}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
