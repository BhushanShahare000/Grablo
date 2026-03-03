// lib/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // In development, attach to global to avoid creating new instances after HMR
    if (!globalThis.__prisma) {
        globalThis.__prisma = new PrismaClient({
            log: ['query'], // optional: helps debugging SQL queries in dev
        });
    }
    prisma = globalThis.__prisma;
}

export default prisma;
