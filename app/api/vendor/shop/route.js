import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const shop = await prisma.shop.findUnique({
            where: { ownerId: parseInt(session.user.id) },
            include: { menuItems: true },
        });
        return NextResponse.json({ shop });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 });
    }
}

export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, address, deliveryEnabled, deliveryRange, latitude, longitude, imageUrl } = await request.json();

    try {
        const userId = parseInt(session.user.id);

        // Use upsert to create or update the shop
        const shop = await prisma.shop.upsert({
            where: { ownerId: userId },
            update: {
                name,
                description,
                address,
                deliveryEnabled,
                deliveryRange,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                imageUrl
            },
            create: {
                name: name || "My New Shop",
                description: description || "",
                address: address || "No address provided",
                deliveryEnabled: deliveryEnabled ?? true,
                deliveryRange: deliveryRange ?? 5,
                latitude: latitude ? parseFloat(latitude) : parseFloat(latitude) || 20.5937,
                longitude: longitude ? parseFloat(longitude) : parseFloat(longitude) || 78.9629,
                imageUrl,
                ownerId: userId
            }
        });
        return NextResponse.json({ shop });
    } catch (error) {
        console.error("Shop Update Error:", error);
        return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
    }
}
