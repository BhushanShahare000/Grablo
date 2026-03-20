"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LeafletMap = dynamic(() => import("@/app/components/LeafletMap"), { ssr: false });

interface ShopDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ShopDetailPage({ params }: ShopDetailPageProps) {
    const [shop, setShop] = useState<any>(null);
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadShop = async () => {
            const { id } = await params;
            const res = await fetch(`/api/shops/${id}`);
            const data = await res.json();
            setShop(data.shop);
            setLoading(false);
        };
        loadShop();

        if (typeof window !== "undefined" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLoc([pos.coords.latitude, pos.coords.longitude]);
            }, null, { enableHighAccuracy: true });
        }
    }, [params]);

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="w-10 h-10 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.6em] animate-pulse">Syncing catalog feed...</p>
        </div>
    );

    if (!shop) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
                <div className="text-7xl mb-10">🍱</div>
                <h1 className="text-3xl font-black text-foreground mb-4 tracking-tighter italic uppercase">Spot not found</h1>
                <Link href="/" className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20">Return to Grid</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32 selection:bg-primary/10 antialiased">
            <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex justify-between items-center">
                    <Link href="/" className="group flex items-center gap-2">
                        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg transition-transform hover:scale-105 active:scale-95">G</div>
                        <span className="text-[9px] font-black text-muted group-hover:text-primary transition-all uppercase tracking-[0.3em] ml-2 hidden sm:block">Back to Discovery Feed</span>
                    </Link>
                </div>
            </header>

            {/* IMMERSIVE HERO */}
            <div className="h-[45vh] sm:h-[55vh] w-full relative group overflow-hidden">
                {shop.imageUrl ? (
                    <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-primary/5 font-black text-9xl">G</div>
                )}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/20 to-background"></div>
                <div className="absolute bottom-10 left-0 w-full px-4 sm:px-8 text-center sm:text-left">
                    <h1 className="text-5xl sm:text-8xl font-black text-foreground tracking-tighter mb-2 italic uppercase leading-[0.85]">{shop.name}</h1>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <p className="text-muted font-black text-[10px] sm:text-xs uppercase tracking-[0.4em]">{shop.address}</p>
                        <div className="h-4 w-px bg-border/40 hidden sm:block"></div>
                        <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">Verified Spot v2.0</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:grid lg:grid-cols-12 gap-10 sm:gap-16 pt-12">
                {/* INFO & MAP SECTION */}
                <div className="lg:col-span-5 space-y-10 sm:space-y-16">
                    <div className="bg-surface p-8 sm:p-12 rounded-[40px] shadow-sm border border-border/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-[140px] z-0"></div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-foreground tracking-tighter mb-6 italic uppercase underline decoration-primary/20">The Original Story</h2>
                            <p className="text-muted font-bold leading-relaxed mb-12 text-sm sm:text-base italic pr-4">{shop.description || "The original signature taste signature to this verified spot."}</p>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[28px] border border-border/40">
                                    <div className="w-10 h-10 bg-white rounded-xl shrink-0 flex items-center justify-center text-foreground shadow-sm text-lg">📍</div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black text-muted uppercase tracking-[0.3em]">Address</p>
                                        <p className="text-xs font-black text-foreground uppercase tracking-tight line-clamp-1">{shop.address}</p>
                                    </div>
                                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`, "_blank")} className="w-10 h-10 bg-primary text-white rounded-xl shrink-0 flex items-center justify-center hover:bg-foreground transition-all shadow-lg shadow-primary/10 active:scale-90 text-lg">&rarr;</button>
                                </div>
                                {shop.deliveryEnabled && (
                                    <div className="flex items-center gap-4 p-5 bg-accent/5 rounded-[28px] border border-accent/10">
                                        <div className="w-10 h-10 bg-white rounded-xl shrink-0 flex items-center justify-center text-accent shadow-sm text-lg">🏍️</div>
                                        <div>
                                            <p className="text-[8px] font-black text-accent uppercase tracking-[0.3em]">Direct Delivery</p>
                                            <p className="text-xs font-black text-foreground uppercase tracking-tight">Active within {shop.deliveryRange} km</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface p-3 rounded-[40px] shadow-sm border border-border/30">
                        <div className="h-64 sm:h-80 rounded-[30px] overflow-hidden border-8 border-white shadow-xl ring-1 ring-border/20">
                            <LeafletMap
                                shopPos={(shop.latitude !== null && shop.longitude !== null) ? [shop.latitude, shop.longitude] : undefined}
                                userPos={userLoc}
                            />
                        </div>
                    </div>
                </div>

                {/* THE MENU CATALOG */}
                <div className="lg:col-span-7">
                    <div className="bg-surface p-8 sm:p-12 rounded-[50px] shadow-sm border border-border/30 min-h-full h-full relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-black italic shadow-inner">M</div>
                            <div>
                                <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-none">Catalog Feed</h2>
                                <p className="text-secondary text-[8px] font-black uppercase tracking-[0.5em] mt-2">Verified House Specials</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {shop.menuItems.length > 0 ? shop.menuItems.map((item: any) => (
                                <div key={item.id} className="group p-6 sm:p-8 rounded-[36px] border border-border/30 hover:bg-slate-50 transition-all duration-500">
                                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 sm:gap-10">
                                        {item.imageUrl && (
                                            <div className="w-32 h-32 sm:w-28 sm:h-28 bg-slate-100 rounded-[28px] shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-2 text-center sm:text-left">
                                            <h4 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase leading-none italic">{item.name}</h4>
                                            <p className="text-muted text-[11px] font-bold leading-relaxed italic border-l-0 sm:border-l-2 border-primary/20 sm:pl-4 transition-all pr-2">
                                                {item.description || "The original signature verified taste cataloged daily."}
                                            </p>
                                        </div>
                                        <div className="text-4xl font-black text-foreground tabular-nums tracking-tighter group-hover:text-primary transition-colors drop-shadow-sm">
                                            ${(item.price as number).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-32 opacity-20">
                                    <div className="text-7xl mb-6">📂</div>
                                    <p className="text-foreground text-sm font-black tracking-widest uppercase italic border-b border-foreground/20 inline-block pb-1 px-4">Catalog currently empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
