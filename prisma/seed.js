// prisma/seed.js
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

async function main() {
    const hashed = await bcrypt.hash('password123', 10);

    await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            name: 'Test Customer',
            email: 'customer@example.com',
            password: hashed,
            role: 'CUSTOMER',
        },
    });

    console.log('Seed complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });