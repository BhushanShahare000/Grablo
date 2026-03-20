import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const shop = await prisma.shop.findUnique({
            where: { id: parseInt(id) },
            include: { menuItems: true },
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        return NextResponse.json({ shop });
    } catch (error) {
        console.error('Error fetching shop:', error);
        return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 });
    }
}
