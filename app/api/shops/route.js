import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const maxDistance = parseFloat(searchParams.get('distance')) || 10; // default 10km

    try {
        const shops = await prisma.shop.findMany({
            include: {
                menuItems: true,
            },
        });

        if (isNaN(lat) || isNaN(lng)) {
            // If location is missing, we can't filter by distance. 
            // Return empty or a limited set? Let's return all but with a flag.
            return NextResponse.json({ shops: [], requiresLocation: true });
        }

        const filteredShops = shops.map(shop => {
            if (shop.latitude === null || shop.longitude === null) return { ...shop, distance: Infinity };
            const distance = getDistance(lat, lng, shop.latitude, shop.longitude);
            return { ...shop, distance };
        }).filter(shop => shop.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);

        return NextResponse.json({ shops: filteredShops });
    } catch (error) {
        console.error('Error fetching shops:', error);
        return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
    }
}
