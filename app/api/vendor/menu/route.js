import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, imageUrl } = await request.json();

    try {
        const shop = await prisma.shop.findUnique({
            where: { ownerId: parseInt(session.user.id) },
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found. Please set your shop settings first.' }, { status: 404 });
        }

        const item = await prisma.menuItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                imageUrl,
                shopId: shop.id,
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        await prisma.menuItem.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}
