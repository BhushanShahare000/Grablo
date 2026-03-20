"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/app/components/LeafletMap"), { ssr: false });

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [distance, setDistance] = useState(10);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/shops", window.location.origin);
      if (userLoc) {
        url.searchParams.append("lat", userLoc.lat.toString());
        url.searchParams.append("lng", userLoc.lng.toString());
      }
      url.searchParams.append("distance", distance.toString());
      const res = await fetch(url);
      const data = await res.json();
      setShops(data.shops || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [userLoc, distance]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 antialiased">
      {/* PROFESSIONAL NAV */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-base font-black tracking-tight text-foreground uppercase">Grablo</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-8">
            {status === "authenticated" ? (
              <div className="flex items-center gap-6">
                <Link href={(session?.user as any).role === 'VENDOR' ? "/dashboard/vendor" : "/dashboard"} className="text-[10px] font-black uppercase tracking-widest text-primary">Dash</Link>
                <button onClick={() => signOut()} className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-secondary transition-colors">Exit</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors">Login</Link>
                <Link href="/sign-up" className="bg-primary text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95">Join</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* REFINED HERO */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
        <div className="max-w-4xl mx-auto text-center border-b border-border/50 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-widest mb-8 border border-primary/10">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
            High-Precision Gastronomy
          </div>
          <h2 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none mb-8 text-foreground uppercase italic px-4">
            Grab food <span className="text-primary not-italic">near you</span>.
          </h2>

          <div className="bg-surface/80 p-2 sm:p-4 rounded-[40px] shadow-2xl border border-border/40 inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full max-w-2xl mx-auto">
            <div className="flex-1 w-full px-6 py-2 space-y-2 text-left">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-muted uppercase tracking-widest">Radius</label>
                <span className="text-2xl font-black text-primary tracking-tighter tabular-nums">{distance} <span className="text-[10px] uppercase">km</span></span>
              </div>
              <input type="range" min={1} max={50} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary" />
            </div>
            <button className="w-full sm:w-auto bg-foreground text-white px-10 py-5 rounded-[30px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all active:scale-95">Refresh Results</button>
          </div>
        </div>
      </section>

      {/* DISCOVERY GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16 px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">The Discovery Feed</h3>
            <p className="text-muted text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
              {shops.length} High-Density Results Found
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto ring-1 ring-border/20">
            <button onClick={() => setViewMode("list")} className={`flex-1 sm:w-28 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-primary'}`}>Grid</button>
            <button onClick={() => setViewMode("map")} className={`flex-1 sm:w-28 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-primary'}`}>Map</button>
          </div>
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <span className="text-[9px] font-black text-muted uppercase tracking-[0.5em] animate-pulse">Syncing catalog...</span>
          </div>
        ) : viewMode === "map" ? (
          <div className="h-[600px] rounded-[50px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-border/30 relative">
            <MapView
              shopPos={shops.find(s => s.latitude !== null && s.longitude !== null) ? [shops.find(s => s.latitude !== null && s.longitude !== null).latitude, shops.find(s => s.latitude !== null && s.longitude !== null).longitude] : undefined}
              userPos={userLoc ? [userLoc.lat, userLoc.lng] : undefined}
            />
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl z-20 border border-border/50 flex items-center gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full animate-ping"></div>
              <p className="text-[8px] font-black text-foreground uppercase tracking-widest">Active Precision HUD</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {shops.map((shop) => (
              <Link href={`/shops/${shop.id}`} key={shop.id} className="group relative flex flex-col bg-surface rounded-[40px] border border-border/30 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                <div className="h-72 bg-slate-50 relative overflow-hidden">
                  {shop.imageUrl ? (
                    <img src={shop.imageUrl} alt={shop.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-primary/10 italic font-black text-6xl">G</div>
                  )}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border border-border/40">
                    {shop.distance ? `${shop.distance.toFixed(1)} km away` : "Nearby"}
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase leading-none">{shop.name}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted border border-border/50 px-2 py-1 rounded-lg">{shop.address}</span>
                  </div>
                  <p className="text-muted font-bold text-xs line-clamp-2 leading-relaxed italic border-l-2 border-primary/20 pl-4 group-hover:border-primary transition-all">
                    {shop.description || "The original signature taste of the neighborhood."}
                  </p>
                  <div className="pt-6 border-t border-border/30 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-muted">Verified Spot</span>
                    <span className="text-primary flex items-center gap-2 group-hover:gap-4 transition-all whitespace-nowrap">
                      View Catalog
                      <span className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center">&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-slate-50 pt-24 pb-12 px-8 border-t border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center font-black text-white text-xs shadow-lg">G</div>
            <span className="text-sm font-black tracking-tight text-foreground uppercase">Grablo</span>
          </div>
          <p className="text-muted font-black uppercase text-[8px] tracking-[0.6em] mb-8">&copy; 2026 High-Precision Gastronomy Platform.</p>
          <div className="w-12 h-1 bg-primary/10 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
}
