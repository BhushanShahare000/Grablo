import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const shops = await prisma.shop.findMany({
            include: { owner: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ users, shops });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }
}

