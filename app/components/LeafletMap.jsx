"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// CUSTOM PREMIUM MARKERS
const SpotSVG = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="#6366f1" fill-opacity="0.1"/>
  <circle cx="20" cy="20" r="12" fill="#6366f1" stroke="white" stroke-width="3"/>
  <circle cx="20" cy="20" r="4" fill="white"/>
</svg>
`;

const UserSVG = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="#f43f5e" fill-opacity="0.2">
    <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
    <animate attributeName="fill-opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle cx="20" cy="20" r="8" fill="#f43f5e" stroke="white" stroke-width="3"/>
</svg>
`;

const SpotIcon = L.divIcon({
    html: SpotSVG,
    className: 'custom-spot-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const UserIcon = L.divIcon({
    html: UserSVG,
    className: 'custom-user-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position && !isNaN(position[0]) && !isNaN(position[1])) {
            map.flyTo(position, 14, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
}

function isValidPos(pos) {
    return Array.isArray(pos) && pos.length === 2 && typeof pos[0] === 'number' && typeof pos[1] === 'number' && !isNaN(pos[0]) && !isNaN(pos[1]);
}

export default function LeafletMap({ shopPos, userPos }) {
    const [mounted, setMounted] = useState(false);
    const [route, setRoute] = useState([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isValidPos(userPos) && isValidPos(shopPos)) {
            fetch(`https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${shopPos[1]},${shopPos[0]}?overview=full&geometries=geojson`)
                .then(res => res.json())
                .then(data => {
                    if (data.routes && data.routes[0]) {
                        const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
                        setRoute(coords);
                    }
                })
                .catch(err => console.error("Map Routing Error:", err));
        }
    }, [userPos, shopPos]);

    if (!mounted) return (
        <div className="h-full w-full bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    const center = isValidPos(userPos) ? userPos : (isValidPos(shopPos) ? shopPos : [20.5937, 78.9629]);

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={center}
                zoom={13}
                zoomControl={false}
                style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                {isValidPos(shopPos) && (
                    <Marker position={shopPos} icon={SpotIcon}>
                        <Popup>
                            <div className="p-1">
                                <p className="text-[9px] font-black uppercase text-primary mb-1">Food Spot</p>
                                <p className="font-bold text-slate-800 text-[11px]">Verified Connection</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {isValidPos(userPos) && (
                    <Marker position={userPos} icon={UserIcon}>
                        <Popup>
                            <div className="p-1 text-center">
                                <p className="text-[9px] font-black uppercase text-secondary mb-1">Your Signal</p>
                                <p className="font-bold text-slate-800 text-[11px]">Active HUD Link</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {route.length > 0 && (
                    <Polyline positions={route} color="#6366f1" weight={8} opacity={0.6} lineCap="round" lineJoin="round">
                        <Polyline positions={route} color="#ffffff" weight={2} opacity={0.8} dashArray="1, 15" />
                    </Polyline>
                )}

                <RecenterMap position={center} />
            </MapContainer>

            <div className="absolute bottom-4 left-4 z-[1000] bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">GeoLink Verified</span>
            </div>
        </div>
    );
}
