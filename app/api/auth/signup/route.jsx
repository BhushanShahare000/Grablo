import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';


export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
            return NextResponse.json({ error: 'user already exists' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashed,
                role: role || 'CUSTOMER',
            },
            select: { id: true, email: true, name: true, role: true },
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error('signup error', error);
        return NextResponse.json({ error: 'internal server error' }, { status: 500 });
    }

}

