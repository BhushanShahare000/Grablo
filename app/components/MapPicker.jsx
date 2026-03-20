"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const PickerIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-indigo.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={PickerIcon}></Marker>
    );
}

function isValidPos(pos) {
    return Array.isArray(pos) && pos.length === 2 && typeof pos[0] === 'number' && typeof pos[1] === 'number' && !isNaN(pos[0]) && !isNaN(pos[1]);
}

export default function MapPicker({ initialPos, onLocationSelect }) {
    const defaultPos = [20.5937, 78.9629];
    const [position, setPosition] = useState(isValidPos(initialPos) ? initialPos : defaultPos);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isValidPos(position)) {
            onLocationSelect(position[0], position[1]);
        }
    }, [position]);

    if (!mounted) return (
        <div className="h-[300px] w-full bg-slate-50 flex items-center justify-center rounded-[32px] border-2 border-dashed border-slate-100">
            <div className="w-6 h-6 border-2 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-[300px] w-full rounded-[32px] overflow-hidden border border-slate-200 shadow-inner">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%', background: '#f8fafc' }} zoomControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
        </div>
    );
}
